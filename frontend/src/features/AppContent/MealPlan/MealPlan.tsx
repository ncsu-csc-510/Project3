import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Card, CardActionArea, CardMedia, CardContent, Typography, Box } from '@mui/material';
import Star from '@mui/icons-material/Star';
import { Theme } from '@mui/material/styles';

const MealPlanCard = ({ day, recipe }: { day: string; recipe: any }) => {
  const theme = useTheme() as Theme;
  const navigate = useNavigate();

  // Debug logging
  console.log('MealPlanCard rendering with recipe:', recipe);
  console.log('Recipe images:', recipe?.images);

  // Get the first image URL or use default
  const getImageUrl = () => {
    if (!recipe?.images?.length) {
      console.log('No images found, using default image');
      return '/no-image.png';
    }

    const firstImage = recipe.images[0];
    console.log('First image:', firstImage);

    if (firstImage.startsWith('http')) {
      console.log('Using full URL:', firstImage);
      return firstImage;
    }

    const url = `http://localhost:8000${firstImage}`;
    console.log('Constructed URL:', url);
    return url;
  };

  const imageUrl = getImageUrl();

  return (
    <Card
      sx={{
        width: '100%',
        mb: 2,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.primary.main}30`,
        '&:hover': {
          transform: 'scale(1.02)',
          transition: 'transform 0.2s ease-in-out',
        },
      }}
    >
      <CardActionArea onClick={() => navigate(`/recipe-details/${recipe._id}`)}>
        <CardMedia
          component="img"
          height="200"
          image={imageUrl}
          alt={recipe.name}
          sx={{ objectFit: 'cover' }}
          onError={(e) => {
            console.error('Error loading image:', e);
            e.currentTarget.src = '/no-image.png';
          }}
        />
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {day}
          </Typography>
          <Typography variant="h5" gutterBottom>
            {recipe.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {recipe.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Star sx={{ color: '#FFD700', mr: 1 }} />
            <Typography variant="body2">
              {recipe.rating}/5.0
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Typography variant="body2">
              Prep: {recipe.prepTime}
            </Typography>
            <Typography variant="body2">
              Cook: {recipe.cookTime}
            </Typography>
            <Typography variant="body2">
              Servings: {recipe.servings}
            </Typography>
          </Box>
          {/* Nutritional information */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="body2">
              Calories: {recipe.calories}
            </Typography>
            <Typography variant="body2">
              Protein: {recipe.protein}g
            </Typography>
            <Typography variant="body2">
              Fat: {recipe.fat}g
            </Typography>
            <Typography variant="body2">
              Sugar: {recipe.sugar}g
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default MealPlanCard; 