import React, { useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

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
    id: string;
  };

interface Props {
    recipe: Recipe | null; // Handle possible null values
}  

const RecipeFavoriteButton: React.FC<Props> = ({ recipe }) => {
    const [favorites, setFavorites] = useState<Recipe[]>([]);
  
    useEffect(() => {
      const savedFavorites: Recipe[] = JSON.parse(localStorage.getItem("favorites") ?? "[]");
      setFavorites(savedFavorites.filter((fav) => fav && fav.name)); // Filter out null values
    }, []);
  
    if (!recipe || !recipe.name) {
      return null; // Don't render if recipe is missing
    }
  
    const toggleFavorite = () => {
      let updatedFavorites: Recipe[];
      
      if (favorites.some((fav) => fav.name === recipe.name)) {
        // Remove from favorites
        updatedFavorites = favorites.filter((fav) => fav.name !== recipe.name);
        alert("Recipe removed from favorites!");
      } else {
        // Add to favorites
        const recipeToSave = {
          ...recipe,
          _id: recipe.id, // Ensure we have the correct ID field
          images: recipe.images.map(img => {
            // If the image URL is already a full URL, keep it as is
            if (img.startsWith('http')) {
              return img;
            }
            // If it's a relative path, ensure it has the correct format
            return img.startsWith('/') ? img : `/${img}`;
          })
        };
        updatedFavorites = [...favorites, recipeToSave];
        alert("Recipe added to favorites!");
      }
  
      setFavorites(updatedFavorites);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    };
  
    return (
      <IconButton onClick={toggleFavorite}>
        <StarIcon
          style={{
            color: favorites.some((fav) => fav.name === recipe.name) ? "gold" : "transparent",
            stroke: "gold",
            strokeWidth: 1,
          }}
        />
      </IconButton>
    );
  };
  
  export default RecipeFavoriteButton;