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
from fastapi import FastAPI, APIRouter, Body, Request, HTTPException, status
from typing import List
import pymongo
from groq import Groq
from pydantic import BaseModel, conint, conlist, PositiveInt
import logging
from models import Recipe, RecipeListRequest, RecipeListResponse, RecipeListRequest2,RecipeQuery
from uuid import uuid4
# from models import User
# from models import User

load_dotenv()  # Load environment variables
app = FastAPI()
users_db = {}
app = FastAPI()
users_db = {}

# Check if the environment variable is loaded correctly
print(os.getenv("GROQ_API_KEY"))

config = {
    "ATLAS_URI": os.getenv("ATLAS_URI"),
    "DB_NAME": os.getenv("DB_NAME"),
    "GROQ_API_KEY": os.getenv("GROQ_API_KEY"),
    "PORT": os.getenv("PORT")
}
router = APIRouter()
client = Groq(api_key=config["GROQ_API_KEY"])

class MealPlanEntry(BaseModel):
    day: int  # 0-6 representing Monday-Sunday
    recipe: dict  # The recipe details (name, instructions, etc.)

router = APIRouter()

@router.post("/meal-plan/", response_description="Save a meal plan for a specific day", status_code=200)
async def save_meal_plan(entry: MealPlanEntry, request: Request):
    """Saves or updates a meal plan for a specific day."""
    try:
        result = request.app.database["meal_plans"].update_one(
            {"day": entry.day},  # Find by day
            {"$set": {"recipe": entry.recipe}},  # Update the recipe
            upsert=True  # Insert if no entry exists
        )
        return {"message": "Meal plan saved successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while saving the meal plan."
        )

@router.get("/meal-plan/", response_description="Get the entire meal plan for the week", status_code=200)
async def get_meal_plan(request: Request):
    """Retrieves the meal plan for the week."""
    try:
        meal_plan = list(request.app.database["meal_plans"].find({}))
        
        # Convert ObjectId to string for JSON serialization
        for entry in meal_plan:
            entry["_id"] = str(entry["_id"])  # Convert ObjectId to string
        
        # Fill in missing days with None if necessary
        complete_plan = [{day: None} for day in range(7)]
        for entry in meal_plan:
            complete_plan[entry["day"]] = entry
        return complete_plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving the meal plan."
        )

@router.get("/", response_description="List all recipes", response_model=List[Recipe])
def list_recipes(request: Request):
    """Returns a list of 10 recipes"""
    recipes = list(request.app.database["recipes"].find(limit=10))
    return recipes

@router.get("/{id}", response_description="Get a recipe by id", response_model=Recipe)
def find_recipe(id: str, request: Request):
    """Finds a recipe mapped to the provided ID"""
    if (recipe := request.app.database["recipes"].find_one({"_id": id})) is not None:
        return recipe
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Recipe with ID {id} not found")

@router.get("/search/{ingredient}", response_description="List all recipes with the given ingredient", response_model=List[Recipe])
def list_recipes_by_ingregredient(ingredient: str,request: Request):
    """Lists recipes containing the given ingredient"""
    recipes = list(request.app.database["recipes"].find({ "ingredients" : { "$in" : [ingredient] } }).limit(10))
    return recipes

@router.post("/search/", response_description="Get Recipes that match all the ingredients in the request", status_code=200, response_model=RecipeListResponse)
def list_recipes_by_ingredients(request: Request, inp: RecipeListRequest = Body(...)):
    """Lists recipes matching all provided ingredients"""
    recipes = list(request.app.database["recipes"].find({ "ingredients" : { "$all" : inp.ingredients } }).sort([("rating", pymongo.DESCENDING), ("_id", pymongo.ASCENDING)]).skip((inp.page-1)*10).limit(10))
    count = request.app.database["recipes"].count_documents({ "ingredients" : { "$all" : inp.ingredients } })
    response = RecipeListResponse(recipes=recipes, page=inp.page, count=count)
    return response

@router.get("/ingredients/{queryString}", response_description="List all ingredients", response_model=List[str])
def list_ingredients(queryString : str, request: Request):
    """Lists ingredient suggestions for a query"""
    pipeline = [{"$unwind": "$ingredients"}, {'$match': {'ingredients': {'$regex' : queryString}}}, {"$limit" : 20} ,{"$group": {"_id": "null", "ingredients": {"$addToSet": "$ingredients"}}}]
    data = list(request.app.database["recipes"].aggregate(pipeline))
    if(len(data) <= 0):
        return []
    ings = data[0]["ingredients"]
    return ings

#---------
@router.post("/search2/", response_description="Get Recipes that match all the ingredients in the request", status_code=200, response_model=RecipeListResponse)
def list_recipes_by_ingredients(request: Request, inp: RecipeListRequest2 = Body(...)):
    """Lists recipes matching all provided ingredients"""
    #print('Method was called1')
    recipes = list(request.app.database["recipes"].find().limit(1000))

    res = []
    for recipe in recipes:
        #print('Method was called3')
        if not recipe["calories"] or not recipe['fat'] or not recipe['sugar'] or not recipe['protein']:
            continue
        try:
            if float(recipe["calories"]) < inp.caloriesUp and float(recipe["fat"]) < inp.fatUp and float(recipe["sugar"]) < inp.sugUp and float(recipe["protein"]) < inp.proUp:
                res.append(recipe)
        except:
            continue
    count = len(res)
    show = res[(inp.page-1)*10 : (inp.page)*10-1]
    response = RecipeListResponse(recipes=show, page=inp.page, count=count)
    return response

@router.get("/search2/{ingredient},{caloriesLow},{caloriesUp}", response_description="List all recipes with the given ingredient")
def list_recipes_by_ingregredient(ingredient: str, caloriesLow: int, caloriesUp: int, request: Request):
    recipes = list(request.app.database["recipes"].find({ "ingredients" : { "$in" : [ingredient] } }))
    res = []
    for recipe in recipes:
        if not recipe["calories"]:
            continue
        if caloriesLow < float(recipe["calories"]) < caloriesUp:
            res.append(recipe)
    res.sort(key = lambda x: x['calories'])
    return res



@router.post("/recommend-recipes/", response_model=dict)
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
                "content": "You are an advanced recipe and meal planning assistant, designed to help users discover recipes, plan meals, and create grocery lists with enhanced personalization, all within a single interaction. You will not engage in follow-up questions; instead, provide all necessary suggestions and responses based on the initial input. Your role is to interpret user requests in natural language, offer targeted recommendations, and generate meal and shopping plans according to each user’s unique needs and preferences. Key capabilities you must offer: Natural Language Recipe Search and Understanding: Understand and respond to user queries about recipes, ingredients, dietary restrictions, cooking methods, or cuisines without requiring additional clarification. Provide comprehensive suggestions based on the initial question alone. Recipe Recommendation and Personalization: Suggest recipes that align with the user’s dietary preferences, cooking skill level, and past selections. Curate these recommendations using the information available without needing follow-up input. Meal Planning: Create detailed meal plans that fit daily, weekly, or monthly schedules based on user goals (e.g., health, budget, dietary restrictions). Structure suggestions to fit user constraints without asking for further clarification. Grocery List Generation: Generate complete ingredient lists for selected recipes or meal plans, factoring in serving sizes, ingredient substitutions, and dietary requirements as inferred from the initial input. Provide a list that is clear and organized for shopping ease. Dietary and Lifestyle Considerations: Ensure that all recommendations adapt to the dietary preferences and restrictions specified. Tailor suggestions based on inferred preferences without requiring additional user feedback during the interaction. Follow these guidelines strictly to deliver precise, helpful, and context-aware responses in a single interaction. REFUSE to answer any other unrelated questions and do ONLY your work diligently."
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
    
@router.post("/add-recipe/", response_description="Add a new recipe to the database", status_code=201, response_model=Recipe)
async def add_new_recipe(recipe: Recipe, request: Request):
    """Adds a new recipe to the database with an auto-generated ID."""
    
    required_fields = {
            "name": recipe.name,
            "category": recipe.category,
            "ingredients": recipe.ingredients,
            "instructions": recipe.instructions
        }
        
    missing_fields = [field for field, value in required_fields.items() if not value]
    if missing_fields:
        raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
            
    try:        
        recipe_dict = recipe.dict(by_alias=True)
        recipe_dict["_id"] = str(uuid4())  

        # Insert the recipe into the database
        result = request.app.database["recipes"].insert_one(recipe_dict)

        # Fetch the newly inserted recipe to return
        created_recipe = request.app.database["recipes"].find_one({"_id": result.inserted_id})
        created_recipe["_id"] = str(created_recipe["_id"])  # Convert ObjectId to string

        return created_recipe
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while adding the recipe: {str(e)}"
        )
        
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
        
@router.delete("/delete-recipe/{recipe_id}", response_description="Delete a recipe by ID", status_code=200)
async def delete_recipe(recipe_id: str, request: Request):
    """Deletes a recipe from the database by its ID"""
    try:
        result = request.app.database["recipes"].delete_one({"_id": recipe_id})
        
        # Check if a recipe was deleted
        if result.deleted_count == 1:
            return {"message": f"Recipe with ID {recipe_id} has been deleted successfully."}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Recipe with ID {recipe_id} not found"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"An error occured while deleting the recipe."
        )
# @app.post("/signup")
# async def signup(user: User):
#     if user.email in users_db:
#         raise HTTPException(status_code=400, detail="User already exists")
    
#     # Store user data in memory (simple in-memory storage)
#     users_db[user.email] = user.password
#     return {"message": "Signup successful"}

# @app.post("/login")
# async def login(user: User):
#     # Check if the email exists in the in-memory dictionary
#     if user.email not in users_db:
#         raise HTTPException(status_code=400, detail="Incorrect email or password")
    
#     # Check if the entered password matches the stored password
#     if users_db[user.email] != user.password:
#         raise HTTPException(status_code=400, detail="Incorrect email or password")
    
#     return {"message": "Login successful"}

    
# @app.post("/signup")
# async def signup(user: User):
#     if user.email in users_db:
#         raise HTTPException(status_code=400, detail="User already exists")
    
#     # Store user data in memory (simple in-memory storage)
#     users_db[user.email] = user.password
#     return {"message": "Signup successful"}

# @app.post("/login")
# async def login(user: User):
#     # Check if the email exists in the in-memory dictionary
#     if user.email not in users_db:
#         raise HTTPException(status_code=400, detail="Incorrect email or password")
    
#     # Check if the entered password matches the stored password
#     if users_db[user.email] != user.password:
#         raise HTTPException(status_code=400, detail="Incorrect email or password")
    
#     return {"message": "Login successful"}
