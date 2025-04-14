"""

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

"""

from fastapi.middleware.cors import CORSMiddleware
from routes import router
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI, HTTPException
from models import ShoppingListItem
from bson import ObjectId
from typing import List
import sys
import os
import certifi
from dotenv import load_dotenv

sys.path.insert(0, '../')

load_dotenv()

load_dotenv()

app = FastAPI()

ca = certifi.where()

config = {
    "ATLAS_URI": os.getenv("ATLAS_URI"),
    "DB_NAME": os.getenv("DB_NAME"),
    "GROQ_API_KEY": os.getenv("GROQ_API_KEY"),
    "PORT": os.getenv("PORT")
}

origins = ['http://localhost:3000', "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.on_event("startup")
async def startup_db_client():
    """Initializes the database client when the application starts"""
    app.mongodb_client = AsyncIOMotorClient(config["ATLAS_URI"], tlsCAFile=ca)
    app.database = app.mongodb_client[config["DB_NAME"]]


@app.on_event("shutdown")
async def shutdown_db_client():
    """Closes the database client when the application shuts down"""
    app.mongodb_client.close()


# Include the router with all endpoints
# First include the user authentication endpoints without a prefix
app.include_router(router, tags=["users"], prefix="")

# Then include the recipe endpoints with the /recipe prefix
app.include_router(router, tags=["recipes"], prefix="/recipe")

""" This api functions is for shopping list."""

# Shopping list endpoints have been moved to routes.py

async def get_database():
    """Returns the database connection."""
    return app.database
