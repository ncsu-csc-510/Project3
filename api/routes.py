"""

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

"""

import sys
import os
sys.path.insert(0, '../')
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, Body, Request, HTTPException, status, Depends, Query
from typing import List, Optional
import pymongo
from groq import Groq
from pydantic import BaseModel, conint, conlist, PositiveInt, EmailStr
import logging
from models import Recipe, RecipeListRequest, RecipeListResponse, RecipeListRequest2, RecipeQuery, NutritionQuery, ShoppingListItem, RecipeStep
from uuid import uuid4
from bson import ObjectId
from models import User, UserLogin
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()  # Load environment variables

# Check if the environment variable is loaded correctly
print(os.getenv("GROQ_API_KEY"))

config = {
    "ATLAS_URI": os.getenv("ATLAS_URI"),
    "DB_NAME": os.getenv("DB_NAME"),
    "GROQ_API_KEY": os.getenv("GROQ_API_KEY"),
    "PORT": os.getenv("PORT")
}
router = APIRouter()
user_router = APIRouter()
client = Groq(api_key=config["GROQ_API_KEY"])

# Helper function to get request object
async def get_request(request: Request):
    return request

# Authentication middleware
async def get_current_user(request: Request):
    email = request.headers.get("X-User-Email")
    if not email:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    db = request.app.database
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

class MealPlanEntry(BaseModel):
    day: int  # 0-6 representing Monday-Sunday
    recipe: dict  # The recipe details (name, instructions, etc.)

@router.post("/recipes/meal-plan/", response_description="Save a meal plan for a specific day", status_code=200)
async def save_meal_plan(entry: MealPlanEntry, request: Request):
    """Saves or updates a meal plan for a specific day."""
    try:
        # Validate day is within range
        if entry.day < 0 or entry.day > 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Day must be between 0 and 6 (Monday-Sunday)."
            )
        
        # Ensure recipe has required fields
        if not entry.recipe or not isinstance(entry.recipe, dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Recipe must be a valid dictionary."
            )
        
        # Save to database
        result = await request.app.database["meal_plans"].update_one(
            {"day": entry.day},  # Find by day
            {"$set": {"recipe": entry.recipe}},  # Update the recipe
            upsert=True  # Insert if no entry exists
        )
        
        return {"message": "Meal plan saved successfully."}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error saving meal plan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while saving the meal plan: {str(e)}"
        )

@router.get("/recipes/meal-plan/", response_description="Get the entire meal plan for the week", status_code=200)
async def get_meal_plan(request: Request):
    """Retrieves the meal plan for the week."""
    try:
        # Use async cursor to fetch meal plans
        cursor = request.app.database["meal_plans"].find({})
        meal_plan = []
        async for entry in cursor:
            # Convert ObjectId to string
            entry["_id"] = str(entry["_id"])
            meal_plan.append(entry)

        # Initialize complete plan with None values for each day
        complete_plan = [None for _ in range(7)]
        
        # Fill in the days that have meal plans
        for entry in meal_plan:
            day = entry.get("day")
            if day is not None and isinstance(day, int) and 0 <= day <= 6:
                complete_plan[day] = entry
            else:
                print(f"Invalid or missing day field: {entry}")

        return complete_plan

    except Exception as e:
        print(f"Error retrieving meal plan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while retrieving the meal plan: {str(e)}"
        )

@router.delete("/recipes/meal-plan/{day}", response_description="Delete a meal plan for a specific day", status_code=200)
async def delete_meal_plan(day: int, request: Request):
    """Deletes a meal plan for a specific day."""
    try:
        if day < 0 or day > 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Day must be between 0 and 6."
            )
        
        result = await request.app.database["meal_plans"].delete_one({"day": day})
        
        if result.deleted_count == 0:
            return {"message": "No meal plan found for the specified day."}
        
        return {"message": "Meal plan deleted successfully."}
    except Exception as e:
        print(f"Error deleting meal plan: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while deleting the meal plan: {str(e)}"
        )


@router.get("/", response_description="List all recipes", response_model=List[Recipe])
def list_recipes(request: Request):
    """Returns a list of 10 recipes"""
    recipes = list(request.app.database["recipes"].find().limit(10))
    for recipe in recipes:
        recipe["_id"] = str(recipe["_id"])  # Convert ObjectId to string
    recipes = list(request.app.database["recipes"].find().limit(10))
    for recipe in recipes:
        recipe["_id"] = str(recipe["_id"])  # Convert ObjectId to string
    return recipes

@router.get("/{id}", response_description="Get a recipe by id", response_model=Recipe)
async def find_recipe(id: str, request: Request):
    """Finds a recipe mapped to the provided ID"""
    recipe = await request.app.database["recipes"].find_one({"_id": id})
    if recipe is not None:
        return recipe
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Recipe with ID {id} not found")

@router.get("/search/{ingredient}", response_description="List all recipes with the given ingredient", response_model=List[Recipe])
async def list_recipes_by_ingregredient(ingredient: str, request: Request):
    """Lists recipes containing the given ingredient"""
    cursor = request.app.database["recipes"].find({ "ingredients" : { "$in" : [ingredient] } }).limit(10)
    recipes = []
    async for recipe in cursor:
        recipes.append(recipe)
    return recipes

@router.post("/recipes/search/", response_description="Get Recipes that match all the ingredients in the request", status_code=200, response_model=RecipeListResponse)
async def list_recipes_by_ingredients_recipe(request: Request, inp: RecipeListRequest = Body(...)):
    """Lists recipes matching all provided ingredients"""
    cursor = request.app.database["recipes"].find({ "ingredients" : { "$all" : inp.ingredients } }).sort([("rating", pymongo.DESCENDING), ("_id", pymongo.ASCENDING)]).skip((inp.page-1)*10).limit(10)
    recipes = []
    async for recipe in cursor:
        recipes.append(recipe)
    
    count = await request.app.database["recipes"].count_documents({ "ingredients" : { "$all" : inp.ingredients } })
    response = RecipeListResponse(recipes=recipes, page=inp.page, count=count)
    return response

@router.get("/recipes/ingredients/{queryString}", response_description="List all ingredients", response_model=List[str])
async def list_ingredients_recipe(queryString: str, request: Request):
    """Lists ingredient suggestions for a recipe query"""
    pipeline = [{"$unwind": "$ingredients"}, {'$match': {'ingredients': {'$regex' : queryString}}}, {"$limit" : 20} ,{"$group": {"_id": "null", "ingredients": {"$addToSet": "$ingredients"}}}]
    cursor = request.app.database["recipes"].aggregate(pipeline)
    data = []
    async for doc in cursor:
        data.append(doc)
    if(len(data) <= 0):
        return []
    return data[0]["ingredients"]

#---------
@router.post("/search2/", response_description="Get Recipes that match all the ingredients in the request", status_code=200, response_model=RecipeListResponse)
async def list_recipes_by_ingredients(request: Request, inp: RecipeListRequest2 = Body(...)):
    """Lists recipes matching nutritional criteria"""
    cursor = request.app.database["recipes"].find({"userId": inp.email}).limit(1000)
    recipes = []
    async for recipe in cursor:
        recipe["_id"] = str(recipe["_id"])
        if not recipe.get("calories") or not recipe.get('fat') or not recipe.get('sugar') or not recipe.get('protein'):
            continue
        try:
            if (inp.caloriesUp == 0 or float(recipe["calories"]) < inp.caloriesUp) and \
               (inp.fatUp == 0 or float(recipe["fat"]) < inp.fatUp) and \
               (inp.sugUp == 0 or float(recipe["sugar"]) < inp.sugUp) and \
               (inp.proUp == 0 or float(recipe["protein"]) < inp.proUp):
                recipes.append(recipe)
        except:
            continue

    count = len(recipes)
    start_idx = (inp.page - 1) * 10
    end_idx = min(start_idx + 10, count)
    show = recipes[start_idx:end_idx]
    total_pages = (count + 9) // 10

    response = RecipeListResponse(
        recipes=show, 
        page=inp.page, 
        count=count,
        total_pages=total_pages,
        has_next=inp.page < total_pages,
        has_previous=inp.page > 1
    )
    return response

@router.get("/search2/{ingredient},{caloriesLow},{caloriesUp}", response_description="List all recipes with the given ingredient")
async def list_recipes_by_ingredient_calories(ingredient: str, caloriesLow: int, caloriesUp: int, request: Request):
    """Lists recipes containing the given ingredient with calorie constraints"""
    try:
        cursor = request.app.database["recipes"].find({ "ingredients" : { "$in" : [ingredient] } })
        recipes = []
        async for recipe in cursor:
            recipe["_id"] = str(recipe["_id"])
            if not recipe.get("calories"):
                continue
            try:
                if caloriesLow < float(recipe["calories"]) < caloriesUp:
                    recipes.append(recipe)
            except (ValueError, TypeError):
                continue
                
        recipes.sort(key=lambda x: float(x.get('calories', 0)))
        return recipes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while retrieving recipes: {str(e)}"
        )

@router.post("/recipes/recommend-recipes/", response_model=dict)
async def recommend_recipes(query: RecipeQuery = Body(...)):
    try:
        query.query = query.query.replace('\n', ' ').replace('\t', ' ').replace('  ', ' ').strip()
        query.context = query.context.strip()
        if not query.query:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Query")
        if not query.context:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Context")
        if query.query.isdigit() or not any(c.isalpha() for c in query.query):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Query must include alphabetic characters and cannot be solely numeric or special characters.")
        
        response = client.chat.completions.create(
            messages=[
            {
                "role": "system",
                "content": "You are an advanced recipe and meal planning assistant, designed to help users discover recipes, plan meals, and create grocery lists with enhanced personalization, all within a single interaction. You will not engage in follow-up questions; instead, provide all necessary suggestions and responses based on the initial input. Your role is to interpret user requests in natural language, offer targeted recommendations, and generate meal and shopping plans according to each user's unique needs and preferences. Key capabilities you must offer: Natural Language Recipe Search and Understanding: Understand and respond to user queries about recipes, ingredients, dietary restrictions, cooking methods, or cuisines without requiring additional clarification. Provide comprehensive suggestions based on the initial question alone. Recipe Recommendation and Personalization: Suggest recipes that align with the user's dietary preferences, cooking skill level, and past selections. Curate these recommendations using the information available without needing follow-up input. Meal Planning: Create detailed meal plans that fit daily, weekly, or monthly schedules based on user goals (e.g., health, budget, dietary restrictions). Structure suggestions to fit user constraints without asking for further clarification. Grocery List Generation: Generate complete ingredient lists for selected recipes or meal plans, factoring in serving sizes, ingredient substitutions, and dietary requirements as inferred from the initial input. Provide a list that is clear and organized for shopping ease. Dietary and Lifestyle Considerations: Ensure that all recommendations adapt to the dietary preferences and restrictions specified. Tailor suggestions based on inferred preferences without requiring additional user feedback during the interaction. Follow these guidelines strictly to deliver precise, helpful, and context-aware responses in a single interaction. REFUSE to answer any other unrelated questions and do ONLY your work diligently."
            },
            {
                "role": "user",
                "content": query.query + query.context
            }
            ],
            model="llama3-8b-8192",
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        logging.basicConfig(level=logging.ERROR)
        logger = logging.getLogger(__name__)
        logger.error(f"Unexpected error in recommend_recipes: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An unexpected error occurred")
    
@router.post("/recipes", response_description="Add a new recipe to the database", status_code=201, response_model=Recipe)
async def create_recipe(recipe: Recipe, request: Request):
    """Creates a new recipe without user restrictions"""
    try:
        # Set the recipe data
        recipe_dict = recipe.dict(by_alias=True)
        
        # Ensure required fields are present
        if not recipe_dict.get("name") or not recipe_dict.get("category") or not recipe_dict.get("ingredients"):
            raise HTTPException(status_code=400, detail="Missing required fields: name, category, or ingredients")
            
        # Ensure arrays are properly initialized
        if not recipe_dict.get("tags"):
            recipe_dict["tags"] = []
        if not recipe_dict.get("ingredientQuantities"):
            recipe_dict["ingredientQuantities"] = []
        if not recipe_dict.get("instructions"):
            recipe_dict["instructions"] = []
        if not recipe_dict.get("images"):
            recipe_dict["images"] = []

        # Insert the recipe
        result = await request.app.database["recipes"].insert_one(recipe_dict)
        
        # Get the created recipe
        created_recipe = await request.app.database["recipes"].find_one({"_id": result.inserted_id})
        
        # Convert ObjectId to string for JSON serialization
        if created_recipe and "_id" in created_recipe:
            created_recipe["_id"] = str(created_recipe["_id"])
        
        return created_recipe
    except Exception as e:
        print(f"Error creating recipe: {str(e)}")  # Add logging for debugging
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search-name/{name}", response_description="Search recipes by name (case and whitespace insensitive)", response_model=List[Recipe])
async def search_recipe_by_name(name: str, request: Request):
    """Searches the database for recipe where the name matchse"""
    try:
        processed_name = name.lower().replace(" ", "")
    
    # MongoDB query: Convert 'name' to lowercase, remove whitespace, and compare
        pipeline = [
            {
                "$addFields": {
                    "normalized_name": {
                        "$replaceAll": {
                            "input": {"$toLower": "$name"},
                            "find": " ",
                            "replacement": ""
                        }
                    }
                }
            },
            {
                "$match": {
                    "normalized_name": processed_name
                }
            },
            {
                "$project": {
                    "normalized_name": 0  # Exclude the temporary field from the results
                }
            }
        ]

        recipes = list(request.app.database["recipes"].aggregate(pipeline))
        
        if not recipes:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No recipe found with name '{name}'.")
        
        return recipes 
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"An error occurred while searching for the recipe."
        )
        
@router.post("/recipes/nutrition-chatbot/", response_description="Get personalized nutrition recommendations", status_code=200)
async def get_nutrition_recommendations(query: NutritionQuery, request: Request):
    try:
        # Calculate BMR using Mifflin-St Jeor Equation
        if query.gender.lower() == "male":
            bmr = 10 * query.weight + 6.25 * query.height - 5 * query.age + 5
        else:
            bmr = 10 * query.weight + 6.25 * query.height - 5 * query.age - 161

        # Adjust BMR based on activity level
        activity_factors = {
            "sedentary": 1.2,
            "light": 1.375,
            "moderate": 1.55,
            "active": 1.725,
            "very active": 1.9
        }
        tdee = bmr * activity_factors.get(query.activity_level, 1.2)

        if query.goal.lower() == "lose weight":
            tdee -= 500  # Reduce 500 calories/day for weight loss
        elif query.goal.lower() == "gain weight":
            tdee += 500  # Add 500 calories/day for weight gain

        # Macronutrient distribution (example: 40% carbs, 30% protein, 30% fat)
        protein = (0.3 * tdee) / 4  # Protein: 4 kcal per gram
        fat = (0.3 * tdee) / 9     # Fat: 9 kcal per gram
        sugar = 0.1 * tdee / 4     # 10% of calories from sugar (WHO recommendation)

        
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a nutrition assistant who provides detailed diet recommendations."},
                {"role": "user", "content": f"I weigh {query.weight}kg, am {query.height}cm tall, {query.age} years old, {query.gender}, "
                                            f"and I want to {query.goal}. My activity level is {query.activity_level}. Provide me with calorie, fat, sugar, and protein recommendations."}
            ],
            model="llama3-8b-8192",
        )

        chatbot_response = response.choices[0].message.content

        return {
            "recommended_calories": round(tdee),
            "recommended_protein_g": round(protein),
            "recommended_fat_g": round(fat),
            "recommended_sugar_g": round(sugar),
            "chatbot_response": chatbot_response
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating recommendations: {str(e)}"
        )

# Move user endpoints to the user_router
@user_router.post("/signup")
async def user_signup(user: User, request: Request):
    db = request.app.database
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    result = await db.users.insert_one(user.dict())
    return {"id": str(result.inserted_id), "email": user.email, "name": user.name}

@user_router.post("/login")
async def user_login(credentials: UserLogin, request: Request):
    db = request.app.database  # Ensure you're using the same DB instance as signup
    db_user = await db.users.find_one({"email": credentials.email})
    if not db_user or db_user["password"] != credentials.password:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    return {"id": str(db_user["_id"]), "name": db_user["name"], "email": db_user["email"]}

@user_router.get("/profile")
async def get_user_profile(email: str, request: Request):
    """
    Fetches a user profile by email.
    Expect the client to supply the email as a query parameter.
    """
    db = request.app.database
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return all user data except sensitive information
    user_data = {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "profilePhoto": user.get("profilePhoto", ""),
        "age": user.get("age", 0),
        "weight": user.get("weight", 0),
        "height": user.get("height", 0),
        "activityLevel": user.get("activityLevel", "moderate"),
        "goal": user.get("goal", "maintain"),
        "goalWeight": user.get("goalWeight", 0),
        "targetDate": user.get("targetDate", ""),
        "dietaryRestrictions": user.get("dietaryRestrictions", [])
    }
    
    return user_data

@user_router.put("/profile/photo")
async def update_profile_photo(email: str, profile_photo: str, request: Request):
    """
    Updates a user's profile photo.
    Expects the client to supply the email and profile photo as parameters.
    """
    db = request.app.database
    result = await db.users.update_one(
        {"email": email},
        {"$set": {"profilePhoto": profile_photo}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Profile photo updated successfully"}

@user_router.put("/profile", response_description="Update user profile", status_code=200)
async def update_user_profile(email: str, request: Request):
    """
    Updates a user's profile information.
    Expects the client to supply the email as a query parameter and profile data in the request body.
    """
    db = request.app.database
    
    # Get profile data from request body
    profile_data = await request.json()
    
    result = await db.users.update_one(
        {"email": email},
        {"$set": profile_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Profile updated successfully"}

@router.get("/recipes/{recipe_id}", response_description="Get a recipe by id", response_model=Recipe)
async def get_recipe(recipe_id: str, request: Request):
    """Gets a recipe by ID without user restrictions"""
    try:
        db = request.app.database
        recipe = await db.recipes.find_one({"_id": recipe_id})
        if not recipe:
            raise HTTPException(status_code=404, detail=f"Recipe with ID {recipe_id} not found")
        recipe["_id"] = str(recipe["_id"])
        return recipe
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving recipe: {str(e)}")

@router.put("/recipes/{recipe_id}", response_description="Update a recipe", status_code=200)
async def update_recipe(recipe_id: str, recipe: Recipe, request: Request):
    """Updates a recipe without user restrictions"""
    try:
        db = request.app.database
        
        # Verify recipe exists
        existing_recipe = await db.recipes.find_one({"_id": recipe_id})
        if not existing_recipe:
            raise HTTPException(status_code=404, detail=f"Recipe with ID {recipe_id} not found")
            
        # Update the recipe
        recipe_dict = recipe.dict()
        
        result = await db.recipes.update_one(
            {"_id": recipe_id},
            {"$set": recipe_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Recipe not found")
            
        # Get the updated recipe
        updated_recipe = await db.recipes.find_one({"_id": recipe_id})
        updated_recipe["_id"] = str(updated_recipe["_id"])
        
        return updated_recipe
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating recipe: {str(e)}")

@router.delete("/recipes/{recipe_id}", response_description="Delete a recipe", status_code=200)
async def delete_recipe(recipe_id: str, request: Request):
    """Deletes a recipe without user restrictions"""
    try:
        db = request.app.database
        
        # Verify recipe exists
        existing_recipe = await db.recipes.find_one({"_id": recipe_id})
        if not existing_recipe:
            raise HTTPException(status_code=404, detail=f"Recipe with ID {recipe_id} not found")
            
        # Delete the recipe
        result = await db.recipes.delete_one({"_id": recipe_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Recipe not found")
            
        return {"message": f"Recipe with ID {recipe_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting recipe: {str(e)}")

@router.get("/recipes/recipe-list")
async def get_recipes(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    request: Request = Depends(get_request)
):
    """Get a paginated list of recipes without user restrictions"""
    try:
        # Calculate skip value for pagination
        skip = (page - 1) * limit

        # Get recipes without user filtering
        cursor = request.app.database["recipes"].find().skip(skip).limit(limit)
        recipes = []
        async for recipe in cursor:
            recipe["_id"] = str(recipe["_id"])  # Convert ObjectId to string
            recipes.append(recipe)

        # Get total count of recipes
        total_count = await request.app.database["recipes"].count_documents({})

        # Calculate total pages
        total_pages = (total_count + limit - 1) // limit

        return {
            "recipes": recipes,
            "page": page,
            "count": total_count,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_previous": page > 1
        }
    except Exception as e:
        import logging
        logging.error(f"Error in get_recipes: {str(e)}")
        # Return an empty list instead of raising an exception
        return {
            "recipes": [],
            "page": page,
            "count": 0,
            "total_pages": 0,
            "has_next": False,
            "has_previous": False
        }

@router.get("/recipes/recipe-details/{recipe_id}")
async def get_recipe_details(recipe_id: str, request: Request):
    """Get details of a specific recipe without user restrictions"""
    try:
        # Get recipe without user verification
        recipe = await request.app.database["recipes"].find_one({"_id": recipe_id})
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")
            
        # Convert ObjectId to string for JSON serialization
        if recipe and "_id" in recipe:
            recipe["_id"] = str(recipe["_id"])
            
        return recipe
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recipes/recipe-steps/", response_description="Add a new recipe step", status_code=201)
async def add_recipe_step(step: RecipeStep, request: Request):
    """Adds a new recipe step to the database."""
    try:
        step_dict = step.dict()
        result = request.app.database["recipe_steps"].insert_one(step_dict)
        return {"message": "Recipe step added successfully", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while adding the recipe step: {str(e)}"
        )

@router.get("/recipes/recipe-steps/{step_number}", response_description="Get a recipe step by number", response_model=RecipeStep)
async def get_recipe_step(step_number: int, request: Request):
    """Retrieves a recipe step by its step number."""
    try:
        step = await request.app.database["recipe_steps"].find_one({"step_number": step_number})
        if step:
            return step
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe step with number {step_number} not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while retrieving the recipe step: {str(e)}"
        )

@router.get("/recipes/recipe-steps/", response_description="List all recipe steps", response_model=List[RecipeStep])
async def list_recipe_steps(request: Request):
    """Lists all recipe steps in the database."""
    try:
        cursor = request.app.database["recipe_steps"].find().sort("step_number", 1)
        steps = []
        async for step in cursor:
            steps.append(step)
        return steps
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while listing recipe steps: {str(e)}"
        )

@router.put("/recipes/recipe-steps/{step_number}", response_description="Update a recipe step", status_code=200)
async def update_recipe_step(step_number: int, step: RecipeStep, request: Request):
    """Updates an existing recipe step."""
    try:
        step_dict = step.dict()
        result = request.app.database["recipe_steps"].update_one(
            {"step_number": step_number},
            {"$set": step_dict}
        )
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recipe step with number {step_number} not found"
            )
        return {"message": "Recipe step updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while updating the recipe step: {str(e)}"
        )

@router.delete("/recipes/recipe-steps/{step_number}", response_description="Delete a recipe step", status_code=200)
async def delete_recipe_step(step_number: int, request: Request):
    """Deletes a recipe step from the database."""
    try:
        result = request.app.database["recipe_steps"].delete_one({"step_number": step_number})
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recipe step with number {step_number} not found"
            )
        return {"message": "Recipe step deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while deleting the recipe step: {str(e)}"
        )
