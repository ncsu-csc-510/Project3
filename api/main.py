"""

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

"""

from fastapi.middleware.cors import CORSMiddleware
from routes import router, user_router
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI, HTTPException
from models import ShoppingListItem
from bson import ObjectId
from typing import List
import sys
import os
import certifi
from dotenv import load_dotenv
from fastapi.staticfiles import StaticFiles

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

# Create uploads directory if it doesn't exist
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)

# Mount the uploads directory for serving static files
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.on_event("startup")
async def startup_db_client():
    """Initializes the database client when the application starts"""
    app.mongodb_client = AsyncIOMotorClient(
        config["ATLAS_URI"],
        tlsCAFile=ca,
        ssl=True,
    )
    app.database = app.mongodb_client[config["DB_NAME"]]
    print("Available routes:")
    for route in app.routes:
        if hasattr(route, 'methods'):
            print(f"{route.methods} {route.path}")
        else:
            print(f"MOUNT {route.path}")


@app.on_event("shutdown")
async def shutdown_db_client():
    """Closes the database client when the application shuts down"""
    app.mongodb_client.close()


# Include the router with all endpoints
# Use different routers for different path operations
app.include_router(router, tags=["api"])
app.include_router(user_router, prefix="/user", tags=["users"])


@app.get("/")
async def root():
    """Root endpoint for testing"""
    return {"message": "API is running"}

""" This api functions is for shopping list."""

@app.get("/shopping-list")
async def get_shopping_list():
    """Fetches the shopping list from the database or returns an empty list"""
    collection_name = "shopping-list"
    collection_names = await app.database.list_collection_names()
    if collection_name not in collection_names:
        await app.database.create_collection(collection_name)

    shopping_list = []
    cursor = app.database[collection_name].find()
    async for item in cursor:
        item["_id"] = str(item["_id"])
        shopping_list.append(item)

    return {"shopping_list": shopping_list}


@app.post("/shopping-list/update")
async def update_shopping_list(items: List[ShoppingListItem]):
    """
    Extends the shopping list in the database with new items.
    Ensures no duplicate items are added.
    """
    collection_name = "shopping-list"
    collection_names = await app.database.list_collection_names()
    if collection_name not in collection_names:
        await app.database.create_collection(collection_name)

    collection = app.database[collection_name]

    # Fetch existing items from the database
    existing_items = []
    cursor = collection.find()
    async for item in cursor:
        existing_items.append(item)
        
    existing_items_dict = {
        (item["name"], item["unit"]): item for item in existing_items
    }

    # Filter new items to avoid duplicates based on 'name' and 'unit'
    new_items = [
        {"name": item.name, "quantity": item.quantity,
            "unit": item.unit, "checked": item.checked}
        for item in items
        if (item.name, item.unit) not in existing_items_dict
    ]

    if not new_items:
        raise HTTPException(status_code=400, detail="No new items to add.")

    # Insert only new items
    await collection.insert_many(new_items)

    # Fetch the updated list
    updated_list = []
    cursor = collection.find()
    async for item in cursor:
        item["_id"] = str(item["_id"])
        updated_list.append(item)

    return {"message": "Shopping list updated successfully", "shopping_list": updated_list}


@app.put("/shopping-list/{item_id}")
async def update_shopping_list_item(item_id: str, item: ShoppingListItem):
    """
    Updates a single item in the shopping list by its ID.
    Ensures the item exists before updating.
    """
    collection_name = "shopping-list"
    collection = app.database[collection_name]

    # Try to find the item by ID
    existing_item = await collection.find_one({"_id": ObjectId(item_id)})

    if not existing_item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Prepare the updated data
    updated_item_data = {
        "name": item.name,
        "quantity": item.quantity,
        "unit": item.unit,
        "checked": item.checked
    }

    # Update the item in the database
    result = await collection.update_one({"_id": ObjectId(item_id)}, {
                                   "$set": updated_item_data})

    if result.matched_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update item")

    # Fetch the updated list after the update
    updated_item = await collection.find_one({"_id": ObjectId(item_id)})
    updated_item = {**updated_item, "_id": str(updated_item["_id"])}

    return {"message": "Item updated successfully", "shopping_list_item": updated_item}


@app.delete("/shopping-list/{item_id}")
async def delete_shopping_list_item(item_id: str):
    """Deletes an item from the shopping list by its ID"""
    collection_name = "shopping-list"
    collection = app.database[collection_name]

    # Try to find and delete the item
    result = await collection.delete_one({"_id": ObjectId(item_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")

    return {"message": f"Item with ID {item_id} deleted successfully"}


# Shopping list endpoints have been moved to routes.py

async def get_database():
    """Returns the database connection."""
    return app.database
