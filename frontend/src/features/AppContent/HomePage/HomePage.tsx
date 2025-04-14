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
  IconButton,
  Divider,
} from '@mui/material';
import { useTheme } from '../../Themes/themeContext';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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

  const features = [
    {
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      title: 'Smart Search',
      description: 'Find recipes based on ingredients you have',
    },
    {
      icon: <FavoriteIcon sx={{ fontSize: 40 }} />,
      title: 'Save Favorites',
      description: 'Create your personal collection of beloved recipes',
    },
    {
      icon: <RestaurantIcon sx={{ fontSize: 40 }} />,
      title: 'Meal Planning',
      description: 'Plan your weekly meals with ease',
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      title: 'Quick Recipes',
      description: 'Perfect for busy weeknight dinners',
    },
  ];

  return (
    <Box sx={{ backgroundColor: theme.background, color: theme.color }}>
      {/* Hero Section with Gradient */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.headerColor} 0%, ${theme.background} 100%)`,
          color: theme.color,
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 14 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 800,
                    mb: 3,
                    letterSpacing: '-0.5px',
                    lineHeight: 1.2,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  Your Personal
                  <br />
                  Recipe Assistant
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    maxWidth: '500px',
                    lineHeight: 1.6,
                  }}
                >
                  Discover, cook, and share delicious recipes tailored to your ingredients and preferences.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/recipe-list')}
                  sx={{
                    py: 2,
                    px: 4,
                    fontSize: '1.1rem',
                    backgroundColor: theme.background,
                    color: theme.headerColor,
                    '&:hover': {
                      backgroundColor: theme.color,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Start Cooking
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: 4,
                  },
                }}
              >
                <Box
                  component="img"
                  src={sixth}
                  alt="Featured Recipe"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    transform: 'perspective(1000px) rotateY(-5deg)',
                    transition: 'transform 0.5s ease',
                    '&:hover': {
                      transform: 'perspective(1000px) rotateY(0deg)',
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  textAlign: 'center',
                  backgroundColor: 'transparent',
                  border: `2px solid ${theme.headerColor}`,
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 8px 24px rgba(0,0,0,0.15)`,
                    borderColor: theme.color,
                  },
                }}
              >
                <IconButton
                  sx={{
                    mb: 2,
                    color: theme.headerColor,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                  }}
                >
                  {feature.icon}
                </IconButton>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Favorite Recipes Section */}
      <Box sx={{ backgroundColor: `${theme.headerColor}15`, py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            sx={{
              textAlign: 'center',
              mb: 6,
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
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
                      transition: 'all 0.3s ease',
                      backgroundColor: theme.background,
                      border: 'none',
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                      },
                    }}
                    onClick={() => handleRecipeClick(recipe._id)}
                  >
                    <CardMedia
                      component="img"
                      height="240"
                      image={recipe.images && recipe.images.length > 0 ? recipe.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={recipe.name}
                      sx={{ 
                        objectFit: 'cover',
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                        {recipe.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {recipe.description}
                      </Typography>
                      {recipe.prepTime && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            {recipe.prepTime}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper 
              elevation={0}
              sx={{ 
                p: 6,
                mt: 4,
                mb: 4,
                borderRadius: 3,
                backgroundColor: theme.background,
                color: theme.color,
                textAlign: 'center',
                border: `2px dashed ${theme.headerColor}40`,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                No favorite recipes yet
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
                Start exploring our collection and save your favorite recipes to create your personal cookbook!
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/recipe-list')}
                sx={{
                  py: 2,
                  px: 4,
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
      </Box>

      {/* Recipe Gallery Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h2"
          component="h2"
          gutterBottom
          sx={{
            textAlign: 'center',
            mb: 6,
            fontWeight: 800,
            fontSize: { xs: '2rem', md: '2.5rem' },
          }}
        >
          Recipe Gallery
        </Typography>
        <Grid container spacing={3}>
          {[seventh, eighth, nineth, tenth].map((image, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  position: 'relative',
                  paddingTop: '100%',
                  overflow: 'hidden',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    '& img': {
                      transform: 'scale(1.1)',
                    },
                  },
                }}
              >
                <Box
                  component="img"
                  src={image}
                  alt={`Recipe ${index + 1}`}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
