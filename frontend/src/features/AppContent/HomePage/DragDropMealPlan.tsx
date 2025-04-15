import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Chip,
  CircularProgress,
  Button,
} from '@mui/material';
import { useTheme } from '../../Themes/themeContext';
import axios from 'axios';
import noImage from '../RecipeInformation/no-image.png';

interface Recipe {
  id: string;
  name: string;
  description: string;
  images: string[];
  prepTime: string;
  servings: number;
  calories: number;
  protein: number;
  sugar: number;
  sodium: number;
}

interface DayPlan {
  day: string;
  recipe: Recipe | null;
}

const DragDropMealPlan = () => {
  const { theme } = useTheme();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedRecipe, setDraggedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:8000/recipes/meal-plan/');
        const mealPlanRecipes = response.data
          .filter((entry: any) => entry && entry.recipe)
          .map((entry: any) => entry.recipe);
        
        if (mealPlanRecipes.length > 0) {
          setRecipes(mealPlanRecipes);
        } else {
          try {
            const suggestionsResponse = await axios.get('http://localhost:8000/recipes/generate-suggestions/');
            setRecipes(suggestionsResponse.data);
          } catch (suggestionsError) {
            console.error('Error fetching suggestions:', suggestionsError);
            setError('Could not fetch recipe suggestions. Please try generating a meal plan first.');
          }
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setError('Could not fetch recipes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  useEffect(() => {
    setMealPlan(days.map(day => ({ day, recipe: null })));
  }, []);

  const handleDragStart = (recipe: Recipe) => {
    setDraggedRecipe(recipe);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dayIndex: number) => {
    if (draggedRecipe) {
      const newMealPlan = [...mealPlan];
      newMealPlan[dayIndex].recipe = draggedRecipe;
      setMealPlan(newMealPlan);
      setDraggedRecipe(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedRecipe(null);
  };

  const renderNutritionalInfo = (recipe: Recipe) => {
    return (
      <Stack direction="row" spacing={1} mt={1}>
        <Chip
          label={`${recipe.calories || 0} cal`}
          size="small"
          sx={{
            backgroundColor: theme.headerColor,
            color: theme.color,
            fontWeight: 'bold',
          }}
        />
        <Chip
          label={`${recipe.protein || 0}g protein`}
          size="small"
          sx={{
            backgroundColor: theme.headerColor,
            color: theme.color,
            fontWeight: 'bold',
          }}
        />
      </Stack>
    );
  };

  return (
    <Grid container spacing={3}>
      {/* Recipe Suggestions */}
      <Grid item xs={12}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            backgroundColor: theme.background,
            color: theme.color,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: theme.headerColor,
              mb: 3,
            }}
          >
            Suggested Recipes
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{
                  backgroundColor: theme.headerColor,
                  color: theme.color,
                  '&:hover': {
                    backgroundColor: theme.color,
                    color: theme.headerColor,
                  },
                }}
              >
                Try Again
              </Button>
            </Box>
          ) : recipes.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ mb: 2 }}>
                No recipes available. Please generate a meal plan first.
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.reload()}
                sx={{
                  backgroundColor: theme.headerColor,
                  color: theme.color,
                  '&:hover': {
                    backgroundColor: theme.color,
                    color: theme.headerColor,
                  },
                }}
              >
                Generate Meal Plan
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: 'auto',
                pb: 2,
                minHeight: '200px',
              }}
            >
              {recipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  draggable
                  onDragStart={() => handleDragStart(recipe)}
                  onDragEnd={handleDragEnd}
                  sx={{
                    minWidth: 200,
                    maxWidth: 200,
                    backgroundColor: theme.background,
                    border: `1px solid ${theme.headerColor}`,
                    borderRadius: 2,
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'grab',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    },
                    '&:active': {
                      cursor: 'grabbing',
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'bold',
                        color: theme.headerColor,
                        mb: 1,
                      }}
                    >
                      {recipe.name}
                    </Typography>
                    {renderNutritionalInfo(recipe)}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      </Grid>

      {/* Meal Plan Calendar */}
      <Grid item xs={12}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            backgroundColor: theme.background,
            color: theme.color,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: theme.headerColor,
              mb: 3,
            }}
          >
            Weekly Meal Plan
          </Typography>
          <Grid container spacing={2}>
            {mealPlan.map((dayPlan, index) => (
              <Grid item xs={12} key={dayPlan.day}>
                <Box
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  sx={{
                    minHeight: 150,
                    border: `2px dashed ${theme.headerColor}`,
                    borderRadius: 2,
                    p: 2,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      borderColor: theme.color,
                      backgroundColor: 'rgba(0,0,0,0.02)',
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: theme.headerColor,
                      mb: 2,
                    }}
                  >
                    {dayPlan.day}
                  </Typography>
                  {dayPlan.recipe ? (
                    <Card
                      sx={{
                        backgroundColor: theme.background,
                        border: `1px solid ${theme.headerColor}`,
                        borderRadius: 2,
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 'bold',
                            color: theme.headerColor,
                          }}
                        >
                          {dayPlan.recipe.name}
                        </Typography>
                        {renderNutritionalInfo(dayPlan.recipe)}
                      </CardContent>
                    </Card>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.headerColor,
                        fontStyle: 'italic',
                      }}
                    >
                      Drag a recipe here
                    </Typography>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DragDropMealPlan; 