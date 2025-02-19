import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { getRecipeInfoInitiator } from '../RecipeInformation/getRecipeInformation.action'
import noImage from '../RecipeInformation/no-image.png'
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Stack,
  CardActions,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

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
  _id: string;
};

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const dispatch = useDispatch()
  const navigateTo = useNavigate()

  useEffect(() => {
    const savedFavorites: Recipe[] = JSON.parse(localStorage.getItem("favorites") ?? "[]");
    setFavorites(savedFavorites);
  }, []);

  const gotoRecipe = (id: string) => {
      dispatch(getRecipeInfoInitiator('http://localhost:8000/recipe/' + id))
      navigateTo('/recipe-details/' + id)
    }

  if (favorites.length === 0) {
    return (
      <Stack alignItems="center" justifyContent="center" height="50vh" spacing={2}>
        <Typography variant="h3">👨‍🍳</Typography>
        <Typography variant="h5" fontWeight="bold">
          No favorite recipes yet
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Start adding your favorite recipes to create your personal cookbook!
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2} padding={0}>
      <Typography variant="h4" fontWeight="bold">
        Your Favorite Recipes
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Click on a recipe to view details
      </Typography>

      <Grid container spacing={2} justifyContent="center">
        {favorites.map((recipe, index) => (
          <Grid item key={index} xs={12} sm={6} md={4} lg={3}> 
            <Card 
            sx={{ 
              width: "100%", 
              height: "100%", 
              display: "flex", 
              flexDirection: "column", 
              justifyContent: "space-between",
              borderRadius: 3, 
              overflow: "hidden",
              transition: "transform 0.3s ease-in-out",
              "&:hover": { transform: "scale(1.05)", boxShadow: 6 }
            }}
            onClick={() => {
              console.log(recipe);
              gotoRecipe(recipe._id)
            }}
            >
            <CardActionArea>
              <CardMedia
                  component="img"
                  height="200"
                  image={recipe?.images?.length > 0 && recipe?.images[0]?.trim() !== '' 
                    ? recipe.images[0].split('"').join('') 
                    : noImage} // Handle missing images
                  alt={recipe.name}
                  sx={{ width: "100%", height: 250, objectFit: "cover" }} 
                />
                <CardContent>
                    <Typography variant="h6" fontWeight="bold" textAlign="center" sx={{ color: "#333", mb: 1 }}>
                    {recipe.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ fontStyle: "italic", mb: 1 }}>
                    {recipe.category} • {recipe.instructions.length} steps
                  </Typography>
                  <Typography variant="body2" textAlign="center" sx={{ color: "#555" }}>
                    {recipe.servings} servings • {recipe.prepTime} prep time
                  </Typography>
                  <Typography variant="body1" color="textSecondary" textAlign="center">
                    {recipe.protein}g protein • {recipe.carbs}g carbs • {recipe.fat}g fat
                  </Typography>
                </CardContent>
            </CardActionArea>
              <CardActions sx={{ display: "flex", justifyContent: "center" }}>
                <IconButton color="error" onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Are you sure you want to remove this recipe from your favorites?")) {
                    const updatedFavorites = favorites.filter(fav => fav._id !== recipe._id);
                    setFavorites(updatedFavorites);
                    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
                  }
                }}>
                  <CloseIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default Favorites;
