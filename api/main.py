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

app = FastAPI()
app.include_router(router) 

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


app.include_router(router, tags=["recipes"], prefix="/recipe")

""" This api functions is for shopping list."""


@app.get("/shopping-list")
async def get_shopping_list():
    """Fetches the shopping list from the database or returns an empty list"""
    collection_name = "shopping-list"
    if collection_name not in await app.database.list_collection_names():
        await app.database.create_collection(collection_name)

    shopping_list = await app.database[collection_name].find().to_list(length=None)
    shopping_list = [{**item, "_id": str(item["_id"])}
                     for item in shopping_list]

    return {"shopping_list": shopping_list}


@app.post("/shopping-list/update")
async def update_shopping_list(items: List[ShoppingListItem]):
    """
    Extends the shopping list in the database with new items.
    Ensures no duplicate items are added.
    """
    collection_name = "shopping-list"
    if collection_name not in await app.database.list_collection_names():
        await app.database.create_collection(collection_name)

    collection = app.database[collection_name]

    # Fetch existing items from the database
    existing_items = await collection.find().to_list(length=None)
    existing_items_dict = {
        (item["name"], item["unit"]): item for item in existing_items
    }

    # Process each new item
    for item in items:
        item_dict = item.dict()
        key = (item_dict["name"], item_dict["unit"])

        if key in existing_items_dict:
            # Update existing item
            existing_item = existing_items_dict[key]
            new_quantity = existing_item["quantity"] + item_dict["quantity"]
            await collection.update_one(
                {"_id": existing_item["_id"]},
                {"$set": {"quantity": new_quantity}}
            )
        else:
            # Insert new item
            await collection.insert_one(item_dict)

    # Fetch the updated list
    updated_list = await collection.find().to_list(length=None)
    updated_list = [{**item, "_id": str(item["_id"])} for item in updated_list]

    return {"shopping_list": updated_list}


@app.post("/shopping-list/clear")
async def clear_shopping_list():
    """Clears all items from the shopping list"""
    collection_name = "shopping-list"
    if collection_name not in await app.database.list_collection_names():
        await app.database.create_collection(collection_name)

    await app.database[collection_name].delete_many({})
    return {"message": "Shopping list cleared successfully"}


@app.post("/shopping-list/remove")
async def remove_from_shopping_list(item: ShoppingListItem):
    """Removes a specific item from the shopping list"""
    collection_name = "shopping-list"
    if collection_name not in await app.database.list_collection_names():
        await app.database.create_collection(collection_name)

    result = await app.database[collection_name].delete_one({
        "name": item.name,
        "unit": item.unit
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found in shopping list")

    return {"message": "Item removed from shopping list successfully"}


@app.put("/shopping-list/{item_id}")
async def update_shopping_list_item(item_id: str, item: ShoppingListItem):
    """
    Updates a single item in the shopping list by its ID.
    Ensures the item exists before updating.
    """
    collection_name = "shopping-list"
    collection = app.database[collection_name]

    # Try to find the item by ID
    existing_item = collection.find_one({"_id": ObjectId(item_id)})

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
    result = collection.update_one({"_id": ObjectId(item_id)}, {
                                   "$set": updated_item_data})

    if result.matched_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update item")

    # Fetch the updated list after the update
    updated_item = collection.find_one({"_id": ObjectId(item_id)})
    updated_item = {**updated_item, "_id": str(updated_item["_id"])}

    return {"message": "Item updated successfully", "shopping_list_item": updated_item}


@app.delete("/shopping-list/{item_id}")
async def delete_shopping_list_item(item_id: str):
    """Deletes an item from the shopping list by its ID"""
    collection_name = "shopping-list"
    collection = app.database[collection_name]

    # Try to find and delete the item
    result = collection.delete_one({"_id": ObjectId(item_id)})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")

    return {"message": f"Item with ID {item_id} deleted successfully"}

def get_database():
    """Returns the database connection."""
    return app.database
