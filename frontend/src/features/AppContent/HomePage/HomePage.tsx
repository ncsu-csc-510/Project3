import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '../../Themes/themeContext';
// Import images from the photos directory
import first from './photos/first.jpg';
import second from './photos/second.jpg';
import third from './photos/third.jpg';
import fourth from './photos/fourth.jpg';
import fifth from './photos/fifth.jpg';
import sixth from './photos/sixth.jpg';
import seventh from './photos/seventh.jpg';
import eighth from './photos/eighth.jpg';
import nineth from './photos/nineth.jpg';
import tenth from './photos/tenth.jpg';

/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

interface Recipe {
  _id: string;
  name: string;
  description: string;
  category: string;
  ingredients: string[];
  instructions: string[];
  images: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  calories?: string;
  fat?: string;
  protein?: string;
  carbs?: string;
}

const HomePage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load favorite recipes from localStorage
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') ?? '[]');
    setFavoriteRecipes(savedFavorites);
    setIsLoading(false);
  }, []);

  const handleRecipeClick = (recipeId: string) => {
    navigate(`/recipe-details/${recipeId}`);
  };

  return (
    <Box sx={{ backgroundColor: theme.background, color: theme.color, minHeight: '100vh' }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          backgroundColor: theme.headerColor,
          color: theme.color,
          mb: 4,
          py: 8,
          px: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                Discover Delicious Recipes
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4 }}>
                Find the perfect recipe for any occasion, using ingredients you already have.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/recipe-list')}
                sx={{
                  backgroundColor: theme.background,
                  color: theme.headerColor,
                  '&:hover': {
                    backgroundColor: theme.color,
                  },
                }}
              >
                Explore Recipes
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={sixth}
                alt="Featured Recipe"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Favorite Recipes Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}
        >
          Your Favorite Recipes
        </Typography>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : favoriteRecipes.length > 0 ? (
          <Grid container spacing={4}>
            {favoriteRecipes.map((recipe) => (
              <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out',
                    backgroundColor: theme.background,
                    borderColor: theme.headerColor,
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderRadius: 2,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                      cursor: 'pointer',
                    },
                  }}
                  onClick={() => handleRecipeClick(recipe._id)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={recipe.images && recipe.images.length > 0 ? recipe.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={recipe.name}
                    sx={{ 
                      objectFit: 'cover',
                      borderBottom: `2px solid ${theme.headerColor}`,
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3">
                      {recipe.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {recipe.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
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
            <Typography variant="h5" gutterBottom>
              No favorite recipes yet
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Start adding your favorite recipes to create your personal cookbook!
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/recipe-list')}
              sx={{
                backgroundColor: theme.headerColor,
                color: theme.color,
                '&:hover': {
                  backgroundColor: theme.color,
                  color: theme.headerColor,
                },
              }}
            >
              Browse Recipes
            </Button>
          </Paper>
        )}
      </Container>

      {/* Recipe Gallery Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}
        >
          Recipe Gallery
        </Typography>
        <Grid container spacing={2}>
          {[seventh, eighth, nineth, tenth].map((image, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                component="img"
                src={image}
                alt={`Recipe ${index + 1}`}
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 2,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
