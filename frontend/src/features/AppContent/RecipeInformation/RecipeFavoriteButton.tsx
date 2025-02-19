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
        updatedFavorites = [...favorites, recipe];
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