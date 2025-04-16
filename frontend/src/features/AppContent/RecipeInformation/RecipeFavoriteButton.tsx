import React, { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import axios from "axios";

type Recipe = {
    name: string;
    ingredients: string[];
    rating: number;
    prepTime: string;
    sugar: number;
    carbs: number;
    protein: number;
    category: string;
    servings: number;
    cookTime: string;
    cholesterol: number;
    fat: number;
    instructions: string[];
    images: string[];
    id?: string;        // Some recipes use id
    _id?: string;       // Some recipes use _id
    recipe_id?: string; // For compatibility with API
    url?: string;       // Add optional URL field
};

interface Props {
    recipe: Recipe | null; // Handle possible null values
}  

const RecipeFavoriteButton: React.FC<Props> = ({ recipe }) => {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
  
    // Get user email from localStorage (set during login)
    const userEmail = localStorage.getItem("userEmail");
  
    useEffect(() => {
      if (!recipe || !userEmail) return;
      
      // Get recipe ID from any available property
      const recipeId = getRecipeId(recipe);
      if (!recipeId) return;
      
      // Check if this recipe is in favorites
      const checkFavoriteStatus = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/user/favorites?user_email=${userEmail}`);
          const favorites = response.data;
          // Check if the recipe is in favorites using any of its possible IDs
          setIsFavorite(favorites.some((fav: any) => 
            fav.recipe_id === recipeId || 
            fav.recipe_id === recipe.id || 
            fav.recipe_id === recipe._id || 
            fav.recipe_id === recipe.recipe_id
          ));
        } catch (error) {
          console.error("Error checking favorite status:", error);
          // Fall back to localStorage for backward compatibility
          const savedFavorites: Recipe[] = JSON.parse(localStorage.getItem("favorites") ?? "[]");
          setIsFavorite(savedFavorites.some((fav) => fav.name === recipe.name));
        }
      };
      
      checkFavoriteStatus();
    }, [recipe, userEmail]);
  
    // Function to get recipe ID from any available property
    const getRecipeId = (recipe: Recipe): string => {
      // Try all possible ID properties, then fall back to URL extraction
      const recipeId = recipe.id || recipe._id || recipe.recipe_id;
      
      if (recipeId) {
        console.log("Found recipe ID:", recipeId);
        return recipeId;
      }
      
      // Try to extract ID from URL as last resort
      const urlParts = window.location.pathname.split('/');
      const urlId = urlParts[urlParts.length - 1];
      
      if (urlId && urlId !== 'recipe-details') {
        console.log("Extracted recipe ID from URL:", urlId);
        return urlId;
      }
      
      console.warn("Could not determine recipe ID");
      return "";
    };
  
    if (!recipe || !recipe.name) {
      return null; // Don't render if recipe is missing
    }
  
    const toggleFavorite = async () => {
      if (!userEmail) {
        alert("Please log in to save favorites");
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Debug recipe object
        console.log("Recipe object:", recipe);
        
        // Get recipe ID from any available property
        const recipeId = getRecipeId(recipe);
        console.log("Using recipe ID:", recipeId);
        
        if (!recipeId) {
          alert("Cannot determine recipe ID. Please try again with a different recipe.");
          setIsLoading(false);
          return;
        }
        
        if (isFavorite) {
          // Remove from favorites
          await axios.delete(`http://localhost:8000/user/favorites?user_email=${userEmail}&recipe_id=${recipeId}`);
          setIsFavorite(false);
          alert("Recipe removed from favorites!");
        } else {
          // Add to favorites
          const recipeUrl = window.location.href; // Get current URL
          
          const favoriteData = {
            user_email: userEmail,
            recipe_id: recipeId, // Use the extracted ID
            name: recipe.name || "Unknown Recipe",
            images: Array.isArray(recipe.images) ? recipe.images.map(img => {
              // If the image URL is already a full URL, keep it as is
              if (img && typeof img === 'string' && img.startsWith('http')) {
                return img;
              }
              // If it's a relative path, ensure it has the correct format
              return img && typeof img === 'string' && img.startsWith('/') ? img : `/${img}`;
            }) : [],
            category: recipe.category || "Uncategorized",
            rating: recipe.rating ? recipe.rating.toString() : "",
            prepTime: recipe.prepTime || "",
            cookTime: recipe.cookTime || "",
            protein: recipe.protein ? recipe.protein.toString() : "",
            carbs: recipe.carbs ? recipe.carbs.toString() : "",
            fat: recipe.fat ? recipe.fat.toString() : "",
            instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
            ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
            url: recipeUrl,
            // Add current datetime in ISO format
            created_at: new Date().toISOString()
          };
          
          console.log("Sending favorite data:", favoriteData);
          
          try {
            const response = await axios.post('http://localhost:8000/user/favorites', favoriteData);
            console.log("Favorite added successfully:", response.data);
            setIsFavorite(true);
            alert("Recipe added to favorites!");
          } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
              // Log the full error response for debugging
              console.error("Error response status:", error.response.status);
              console.error("Error response data:", JSON.stringify(error.response.data, null, 2));
              
              let errorMsg = "Unknown validation error";
              
              // Handle different validation error formats
              if (error.response.data?.detail) {
                if (Array.isArray(error.response.data.detail)) {
                  // Handle array of validation errors
                  errorMsg = error.response.data.detail.map((err: any) => 
                    `${err.loc.join('.')} - ${err.msg}`
                  ).join('; ');
                } else if (typeof error.response.data.detail === 'object') {
                  // Handle object format
                  errorMsg = JSON.stringify(error.response.data.detail);
                } else {
                  // Handle string format
                  errorMsg = error.response.data.detail;
                }
              }
              
              alert(`Failed to add favorite: ${errorMsg}`);
            } else {
              console.error("Error adding favorite:", error);
              alert("Failed to add favorite due to an unexpected error");
            }
            return;
          }
          
          // For backward compatibility - update localStorage too
          const savedFavorites: Recipe[] = JSON.parse(localStorage.getItem("favorites") ?? "[]");
          const recipeToSave = {
            ...recipe,
            _id: recipe.id,
            url: recipeUrl
          };
          localStorage.setItem("favorites", JSON.stringify([...savedFavorites, recipeToSave]));
        }
      } catch (error) {
        console.error("Error updating favorites:", error);
        alert("Failed to update favorites. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <IconButton onClick={toggleFavorite} disabled={isLoading}>
        <StarIcon
          style={{
            color: isFavorite ? "gold" : "transparent",
            stroke: "gold",
            strokeWidth: 1,
          }}
        />
      </IconButton>
    );
  };
  
  export default RecipeFavoriteButton;