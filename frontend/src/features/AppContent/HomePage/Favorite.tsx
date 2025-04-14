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
  Container,
  Box,
  Divider,
  Paper,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useTheme } from '../../Themes/themeContext';

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
  const { theme } = useTheme();

  useEffect(() => {
    const savedFavorites: Recipe[] = JSON.parse(localStorage.getItem("favorites") ?? "[]");
    setFavorites(savedFavorites);
  }, []);

  const gotoRecipe = (id: string) => {
      dispatch(getRecipeInfoInitiator('http://localhost:8000/recipes/' + id))
      navigateTo('/recipe-details/' + id)
  }

  if (favorites.length === 0) {
    return (
      <Container maxWidth="md">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            mt: 4, 
            mb: 4, 
            borderRadius: 2,
            backgroundColor: theme.background,
            color: theme.color,
            textAlign: 'center'
          }}
        >
          <Stack alignItems="center" justifyContent="center" spacing={3}>
            <FavoriteIcon sx={{ fontSize: 60, color: '#e91e63' }} />
            <Typography variant="h4" fontWeight="bold">
              No favorite recipes yet
            </Typography>
            <Divider sx={{ width: '50%', my: 2 }} />
            <Typography variant="body1" sx={{ maxWidth: '600px' }}>
              Start adding your favorite recipes to create your personal cookbook! 
              Browse recipes and click the heart icon to add them to your favorites.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: theme.color }}>
          Your Favorite Recipes
        </Typography>
        <Typography variant="body1" sx={{ color: theme.color }}>
          {favorites.length} {favorites.length === 1 ? 'recipe' : 'recipes'} saved
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
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
                transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": { 
                  transform: "translateY(-8px)", 
                  boxShadow: 6 
                },
                backgroundColor: theme.background,
                color: theme.color,
                border: `1px solid ${theme.color}20`
              }}
            >
              <CardActionArea onClick={() => gotoRecipe(recipe._id)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={recipe?.images?.length > 0 && recipe?.images[0]?.trim() !== '' 
                    ? recipe.images[0].split('"').join('') 
                    : noImage}
                  alt={recipe.name}
                  sx={{ 
                    width: "100%", 
                    height: 200, 
                    objectFit: "cover",
                    borderBottom: `1px solid ${theme.color}20`
                  }} 
                />
                <CardContent sx={{ p: 2 }}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    sx={{ 
                      mb: 1, 
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      minHeight: "3.6em"
                    }}
                  >
                    {recipe.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontStyle: "italic", 
                      mb: 1,
                      color: theme.color + "99"
                    }}
                  >
                    {recipe.category} • {recipe.instructions.length} steps
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mt: 1,
                    pt: 1,
                    borderTop: `1px solid ${theme.color}20`
                  }}>
                    <Typography variant="body2">
                      {recipe.servings} servings
                    </Typography>
                    <Typography variant="body2">
                      {recipe.prepTime} prep
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    mt: 1
                  }}>
                    <Typography variant="body2">
                      {recipe.protein}g protein
                    </Typography>
                    <Typography variant="body2">
                      {recipe.carbs}g carbs
                    </Typography>
                    <Typography variant="body2">
                      {recipe.fat}g fat
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
              <CardActions sx={{ 
                display: "flex", 
                justifyContent: "flex-end",
                p: 1,
                borderTop: `1px solid ${theme.color}20`
              }}>
                <IconButton 
                  color="error" 
                  aria-label="remove from favorites" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Are you sure you want to remove this recipe from your favorites?")) {
                      const updatedFavorites = favorites.filter(fav => fav._id !== recipe._id);
                      setFavorites(updatedFavorites);
                      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Favorites;
