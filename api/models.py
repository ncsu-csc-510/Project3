"""

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

"""

from datetime import datetime
from itertools import count
import uuid
from typing import Optional, List
from pydantic import BaseModel, Field
from pydantic import BaseModel, EmailStr


class Recipe(BaseModel):
    """A data model representing a recipe"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()),
                    alias="_id")  # Unique identifier for the recip
    userId: Optional[str] = None  # ID of the user who created the recipe
    name: str  # Name of the recipe Required
    cookTime: Optional[str] = None
    prepTime: Optional[str] = None
    totalTime: Optional[str] = None
    description: Optional[str] = None
    images: Optional[List[str]] = Field(default_factory=list)  # URLs of images related to the recipe
    category: str # Required
    tags: List[str] = Field(default_factory=list)
    ingredientQuantities: List[str] = Field(default_factory=list)
    ingredients: List[str]  # Required
    rating: Optional[str] = None
    calories: Optional[str] = None
    fat: Optional[str] = None
    saturatedFat: Optional[str] = None
    cholesterol: Optional[str] = None
    sodium: Optional[str] = None
    carbs: Optional[str] = None
    fiber: Optional[str] = None
    sugar: Optional[str] = None
    protein: Optional[str] = None
    servings: Optional[str] = None
    instructions: List[str] = Field(default_factory=list) # Required

    class Config:
        schema_extra = {

            "example": {
                "id": "abcd-efgh-jklm-nopq-rstuv",
                "userId": "user123",
                "name": "Low-Fat Berry Blue Frozen Dessert",
                "cookTime": "24H",
                "prepTime": "45M",
                "totalTime": "24H45M",
                "description": "Make and share this Low-Fat Berry Blue Frozen Dessert recipe from Food.com.",
                "images": [
                    "https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/38/YUeirxMLQaeE1h3v3qnM_229%20berry%20blue%20frzn%20dess.jpg",
                    "https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/38/AFPDDHATWzQ0b1CDpDAT_255%20berry%20blue%20frzn%20dess.jpg",
                    "https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/38/UYgf9nwMT2SGGJCuzILO_228%20berry%20blue%20frzn%20dess.jpg",
                    "https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/38/PeBMJN2TGSaYks2759BA_20140722_202142.jpg",
                    "https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/38/picuaETeN.jpg",
                    "https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/38/pictzvxW5.jpg"
                ],
                "category": "Frozen Desserts",
                "tags": [
                    "Dessert",
                    "Low Protein",
                    "Low Cholesterol",
                    "Healthy",
                    "Free Of...",
                    "Summer",
                    "Weeknight",
                    "Freezer",
                    "Easy"
                ],
                "ingredientQuantities": [
                    "4",
                    "1/4",
                    "1",
                    "1"
                ],
                "ingredients": [
                    "blueberries",
                    "granulated sugar",
                    "vanilla yogurt",
                    "lemon juice"
                ],
                "rating": "4.5",
                "calories": "170.9",
                "fat": "2.5",
                "saturatedFat": "1.3",
                "cholesterol": "8",
                "sodium": "29.8",
                "carbs": "37.1",
                "fiber": "3.6",
                "sugar": "30.2",
                "protein": "3.2",
                "servings": "4",
                "instructions": [
                    "Toss 2 cups berries with sugar.",
                    "Let stand for 45 minutes, stirring occasionally.",
                    "Transfer berry-sugar mixture to food processor.",
                    "Add yogurt and process until smooth.",
                    "Strain through fine sieve. Pour into baking pan (or transfer to ice cream maker and process according to manufacturers' directions). Freeze uncovered until edges are solid but centre is soft.  Transfer to processor and blend until smooth again.",
                    "Return to pan and freeze until edges are solid.",
                    "Transfer to processor and blend until smooth again.",
                    "Fold in remaining 2 cups of blueberries.",
                    "Pour into plastic mold and freeze overnight. Let soften slightly to serve."
                ]
            }
        }


class RecipeListRequest(BaseModel):
    ingredients: List[str] = Field(...,
                                   description="List of ingredients to filter recipes")
    page: int = Field(..., description="Page number for pagination")


class RecipeListResponse(BaseModel):
    recipes: List[Recipe] = Field(...,
                                  description="List of recipes matching the filter criteria")
    page: int = Field(..., description="Current page number")
    count: int = Field(...,
                       description="Total count of recipes matching the filter criteria")


class RecipeListRequest2(BaseModel):
    email: EmailStr = Field(..., description="User's email")
    page: int = Field(..., ge=1, description="Page number, must be at least 1")
    caloriesUp: float = Field(..., ge=0, le=4000,
                              description="Calories upper limit, between 0 and 4000")
    fatUp: float = Field(..., ge=0, le=140,
                         description="Fat upper limit, between 0 and 140")
    sugUp: float = Field(..., ge=0, le=150,
                         description="Sugar upper limit, between 0 and 150")
    proUp: float = Field(..., ge=0, le=250,
                         description="Protein upper limit, between 0 and 250")


class RecipeQuery(BaseModel):
    query: str
    context: str


class User(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str


# class Token(BaseModel):
#     access_token: str
#     token_type: str


class ShoppingListItem(BaseModel):
    name: str
    quantity: int
    unit: str
    checked: bool

class NutritionQuery(BaseModel):
    weight: float # in kg 
    height: float # in centimeters 
    age: int
    gender: str # "male" or "female"
    goal: str # "lose weight", "maintain weight", or "gain weight"
    activity_level: str # "sedentary", "light", "moderate", "active", "very active"

class RecipeStep(BaseModel):
    step_number: int
    description: str
    duration_seconds: Optional[int] = None
    voice_command: Optional[str] = None
    ingredients: Optional[list[str]] = None
    equipment: Optional[list[str]] = None

class MealPlanGenerationRequest(BaseModel):
    ingredients: List[str] = Field(..., description="List of available ingredients")
    dietary_preferences: List[str] = Field(..., description="Dietary preferences (e.g., vegetarian, vegan, gluten-free)")
    max_cooking_time: int = Field(..., description="Maximum cooking time per meal in minutes")
    max_calories: float = Field(..., description="Maximum calories per meal")
    max_protein: float = Field(..., description="Maximum protein per meal in grams")
    max_sugar: float = Field(..., description="Maximum sugar per meal in grams")
    max_sodium: float = Field(..., description="Maximum sodium per meal in mg")
    days: int = Field(..., description="Number of days to plan for (1-7)")

class Favorite(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    user_email: EmailStr
    recipe_id: str
    name: str
    images: List[str] = Field(default_factory=list)
    category: str
    rating: Optional[str] = None
    prepTime: Optional[str] = None
    cookTime: Optional[str] = None
    protein: Optional[str] = None
    carbs: Optional[str] = None
    fat: Optional[str] = None
    instructions: List[str] = Field(default_factory=list)
    ingredients: List[str] = Field(default_factory=list)
    url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    
    class Config:
        schema_extra = {
            "example": {
                "id": "abcd-efgh-jklm-nopq-rstuv",
                "user_email": "user@example.com",
                "recipe_id": "recipe123",
                "name": "Chocolate Cake",
                "images": ["https://example.com/cake.jpg"],
                "category": "Dessert",
                "rating": "5",
                "prepTime": "30 mins",
                "cookTime": "45 mins",
                "protein": "5",
                "carbs": "40",
                "fat": "10",
                "instructions": ["Mix ingredients", "Bake at 350°F"],
                "ingredients": ["Flour", "Sugar", "Cocoa"],
                "url": "http://localhost:3000/recipe-details/recipe123",
                "created_at": "2023-04-22T10:30:00Z"
            }
        }