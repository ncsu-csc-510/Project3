import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Paper,
  CircularProgress,
  Divider,
  Chip,
  Stack,
  Alert,
  Snackbar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useTheme } from '../../Themes/themeContext';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SaveIcon from '@mui/icons-material/Save';
import { httpGetRequest, httpPostRequest } from '../../apiMethods';

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

interface AIRecommendation {
  response: string;
}

const WhatToEatPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingDaily, setIsLoadingDaily] = useState<boolean>(false);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<string>('');
  const [dailyRecommendations, setDailyRecommendations] = useState<string>('');
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [preferenceType, setPreferenceType] = useState<string>('personalized');
  const [userQuery, setUserQuery] = useState<string>('');

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    fetchUserRecipes();
  }, []);

  const fetchUserRecipes = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        showSnackbar('User email not found. Please log in again.', 'error');
        navigate('/login');
        return;
      }

      const response = await httpGetRequest(`http://localhost:8000/recipe/recipes?email=${userEmail}`);
      if (response && Array.isArray(response.recipes)) {
        setUserRecipes(response.recipes);
      } else {
        console.error('Invalid response format:', response);
        showSnackbar('Failed to load your recipes', 'error');
      }
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      showSnackbar('Error loading your recipes', 'error');
    }
  };

  const getPersonalizedRecommendations = async () => {
    try {
      setIsLoading(true);
      setAiRecommendations('');
      setRecommendedRecipes([]);

      // Create a context with user's recipes and preferences
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName');
      
      if (!userEmail || !userName) {
        showSnackbar('User information not found. Please log in again.', 'error');
        navigate('/login');
        return;
      }

      // Create a context with user's recipes
      const recipeContext = userRecipes.length > 0 
        ? `The user has ${userRecipes.length} saved recipes including: ${userRecipes.slice(0, 5).map(r => r.name).join(', ')}. `
        : 'The user has no saved recipes yet. ';

      // Create the query based on user preference
      let query = '';
      if (preferenceType === 'personalized') {
        query = `I'm ${userName} and I'm looking for personalized recipe recommendations based on my cooking history and preferences.`;
      } else if (preferenceType === 'quick') {
        query = `I need quick and easy recipes that take less than 30 minutes to prepare.`;
      } else if (preferenceType === 'healthy') {
        query = `I'm looking for healthy, nutritious recipes that are low in calories and high in protein.`;
      } else if (preferenceType === 'comfort') {
        query = `I'm in the mood for some comfort food recipes that are hearty and satisfying.`;
      } else if (preferenceType === 'vegetarian') {
        query = `I'm looking for vegetarian recipes that are flavorful and filling.`;
      } else if (preferenceType === 'custom' && userQuery) {
        query = userQuery;
      } else {
        query = `I'm looking for recipe recommendations.`;
      }

      // Add user's saved recipes to the context
      const context = `${recipeContext} Please provide 3-5 specific recipe recommendations with detailed instructions, ingredients, and cooking times.`;

      const response = await httpPostRequest('http://localhost:8000/recipe/recommend-recipes/', {
        query,
        context
      });

      if (response && response.response) {
        // Store the raw response for debugging if needed
        setAiRecommendations(response.response);
        
        // Parse the response to extract recipe information
        const recipes = parseRecipesFromResponse(response.response);
        setRecommendedRecipes(recipes);
        
        showSnackbar('AI recommendations generated successfully!', 'success');
      } else {
        showSnackbar('Failed to generate recommendations', 'error');
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      showSnackbar('Error generating recommendations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getDailyRecommendations = async () => {
    try {
      setIsLoadingDaily(true);
      setDailyRecommendations('');
      setRecommendedRecipes([]);

      // Get current date and determine season
      const now = new Date();
      const month = now.getMonth() + 1; // JavaScript months are 0-indexed
      let season = '';
      
      if (month >= 3 && month <= 5) {
        season = 'spring';
      } else if (month >= 6 && month <= 8) {
        season = 'summer';
      } else if (month >= 9 && month <= 11) {
        season = 'fall';
      } else {
        season = 'winter';
      }

      // Create a query for seasonal recommendations
      const query = `Today is ${now.toLocaleDateString()} and it's ${season}. I'm looking for seasonal recipe recommendations for today.`;
      const context = `Please provide 3-5 seasonal recipe recommendations for ${season} with detailed instructions, ingredients, and cooking times. Include information about why these recipes are good for the current season.`;

      const response = await httpPostRequest('http://localhost:8000/recipe/recommend-recipes/', {
        query,
        context
      });

      if (response && response.response) {
        // Store the raw response for debugging if needed
        setDailyRecommendations(response.response);
        
        // Parse the response to extract recipe information
        const recipes = parseRecipesFromResponse(response.response);
        setRecommendedRecipes(recipes);
        
        showSnackbar('Daily recommendations generated successfully!', 'success');
      } else {
        showSnackbar('Failed to generate daily recommendations', 'error');
      }
    } catch (error) {
      console.error('Error getting daily recommendations:', error);
      showSnackbar('Error generating daily recommendations', 'error');
    } finally {
      setIsLoadingDaily(false);
    }
  };

  // Helper function to parse recipes from AI response
  const parseRecipesFromResponse = (response: string): Recipe[] => {
    const recipes: Recipe[] = [];
    
    // Try to find recipe sections in the response
    // Look for patterns like "Recipe 1:", "1.", or just recipe names followed by ingredients
    const recipePatterns = [
      /Recipe \d+:\s*([^\n]+)/g,
      /\d+\.\s+([^\n]+)/g,
      /([A-Z][a-z\s]+(?:[A-Z][a-z\s]+)*):\s*(?:Ingredients:|Instructions:)/g
    ];
    
    let recipeSections: string[] = [];
    
    // Try each pattern until we find matches
    for (let i = 0; i < recipePatterns.length; i++) {
      const pattern = recipePatterns[i];
      // Use a more compatible approach instead of spread operator with matchAll
      const matches: RegExpExecArray[] = [];
      let match;
      const regex = new RegExp(pattern);
      while ((match = regex.exec(response)) !== null) {
        matches.push(match);
      }
      
      if (matches.length > 0) {
        // Extract the recipe names
        const recipeNames = matches.map(match => match[1].trim());
        
        // Split the response by recipe names
        let remainingText = response;
        for (let j = 0; j < recipeNames.length; j++) {
          const name = recipeNames[j];
          const parts = remainingText.split(name);
          if (parts.length > 1) {
            // Find the next recipe name or end of text
            let nextRecipeIndex = -1;
            for (let k = 0; k < recipeNames.length; k++) {
              const nextName = recipeNames[k];
              if (nextName !== name) {
                const index = parts[1].indexOf(nextName);
                if (index !== -1 && (nextRecipeIndex === -1 || index < nextRecipeIndex)) {
                  nextRecipeIndex = index;
                }
              }
            }
            
            // Extract the recipe section
            const recipeSection = name + (nextRecipeIndex !== -1 
              ? parts[1].substring(0, nextRecipeIndex) 
              : parts[1]);
            
            recipeSections.push(recipeSection);
            
            // Update remaining text
            if (nextRecipeIndex !== -1) {
              remainingText = parts[1].substring(nextRecipeIndex);
            } else {
              remainingText = '';
            }
          }
        }
        
        // If we found recipe sections, break the loop
        if (recipeSections.length > 0) {
          break;
        }
      }
    }
    
    // If no recipe sections were found, try a simpler approach
    if (recipeSections.length === 0) {
      // Split by double newlines and look for sections that might be recipes
      const sections = response.split(/\n\s*\n/).filter(Boolean);
      
      // Look for sections that contain both "ingredients" and "instructions"
      recipeSections = sections.filter(section => 
        section.toLowerCase().includes('ingredient') && 
        section.toLowerCase().includes('instruction')
      );
      
      // If still no recipes found, just take the first few sections
      if (recipeSections.length === 0 && sections.length > 0) {
        recipeSections = sections.slice(0, 5);
      }
    }
    
    // Process each recipe section
    recipeSections.forEach((section, index) => {
      const lines = section.split('\n').filter(Boolean);
      
      // Extract recipe name (first line or after "Recipe X:")
      let name = '';
      let description = '';
      let ingredients: string[] = [];
      let instructions: string[] = [];
      let prepTime = '';
      let cookTime = '';
      let servings = '';
      
      // Try to find the recipe name
      if (lines.length > 0) {
        // Check if the first line contains a recipe name pattern
        const nameMatch = lines[0].match(/^(?:Recipe \d+:\s*)?([^:]+)(?::|$)/);
        if (nameMatch) {
          name = nameMatch[1].trim();
        } else {
          name = lines[0].trim();
        }
        
        // Try to find a description (next line if it doesn't look like ingredients or instructions)
        if (lines.length > 1 && 
            !lines[1].toLowerCase().includes('ingredient') && 
            !lines[1].toLowerCase().includes('instruction')) {
          description = lines[1].trim();
        }
      }
      
      // If we couldn't find a name, generate a generic one
      if (!name) {
        name = `Recipe ${index + 1}`;
      }
      
      // Extract ingredients and instructions
      let isIngredientsSection = false;
      let isInstructionsSection = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.toLowerCase().includes('ingredient')) {
          isIngredientsSection = true;
          isInstructionsSection = false;
          continue;
        }
        
        if (line.toLowerCase().includes('instruction') || line.toLowerCase().includes('step')) {
          isIngredientsSection = false;
          isInstructionsSection = true;
          continue;
        }
        
        if (isIngredientsSection && line) {
          // Remove bullet points or numbers
          const ingredient = line.replace(/^[-•\d.)\s]+/, '').trim();
          if (ingredient) {
            ingredients.push(ingredient);
          }
        }
        
        if (isInstructionsSection && line) {
          // Remove bullet points or numbers
          const instruction = line.replace(/^[-•\d.)\s]+/, '').trim();
          if (instruction) {
            instructions.push(instruction);
          }
        }
        
        // Try to extract prep time, cook time, and servings
        if (line.toLowerCase().includes('prep') || line.toLowerCase().includes('preparation')) {
          const timeMatch = line.match(/(\d+)\s*(minute|hour|hr)/i);
          if (timeMatch) {
            prepTime = `${timeMatch[1]} ${timeMatch[2].toLowerCase()}s`;
          } else {
            prepTime = '30 minutes';
          }
        }
        
        if (line.toLowerCase().includes('cook') || line.toLowerCase().includes('cooking')) {
          const timeMatch = line.match(/(\d+)\s*(minute|hour|hr)/i);
          if (timeMatch) {
            cookTime = `${timeMatch[1]} ${timeMatch[2].toLowerCase()}s`;
          } else {
            cookTime = '30 minutes';
          }
        }
        
        if (line.toLowerCase().includes('serving') || line.toLowerCase().includes('yield')) {
          const servingMatch = line.match(/(\d+)/);
          if (servingMatch) {
            servings = `${servingMatch[1]} servings`;
          } else {
            servings = '4 servings';
          }
        }
      }
      
      // If we couldn't find ingredients or instructions, try to extract them from the whole section
      if (ingredients.length === 0 && instructions.length === 0) {
        // Look for lines that might be ingredients (shorter lines, often with measurements)
        const possibleIngredients = lines.filter(line => 
          line.length < 50 && 
          (line.includes('cup') || line.includes('tbsp') || line.includes('tsp') || 
           line.includes('oz') || line.includes('pound') || line.includes('lb') ||
           line.includes('g') || line.includes('ml') || line.includes('piece'))
        );
        
        if (possibleIngredients.length > 0) {
          ingredients = possibleIngredients.map(line => line.replace(/^[-•\d.)\s]+/, '').trim());
        }
        
        // Look for lines that might be instructions (longer lines, often with verbs)
        const possibleInstructions = lines.filter(line => 
          line.length > 30 && 
          (line.toLowerCase().includes('heat') || line.toLowerCase().includes('add') || 
           line.toLowerCase().includes('mix') || line.toLowerCase().includes('stir') ||
           line.toLowerCase().includes('cook') || line.toLowerCase().includes('bake'))
        );
        
        if (possibleInstructions.length > 0) {
          instructions = possibleInstructions.map(line => line.replace(/^[-•\d.)\s]+/, '').trim());
        }
      }
      
      // If we still don't have ingredients or instructions, add some defaults
      if (ingredients.length === 0) {
        ingredients = ['Ingredient 1', 'Ingredient 2', 'Ingredient 3'];
      }
      
      if (instructions.length === 0) {
        instructions = ['Step 1: Prepare ingredients', 'Step 2: Cook according to recipe', 'Step 3: Serve and enjoy'];
      }
      
      // Create a recipe object
      const recipe: Recipe = {
        _id: `recommended-${index}`,
        name,
        description: description || `A delicious ${name.toLowerCase()} recipe`,
        category: 'Recommended',
        ingredients,
        instructions,
        images: ['https://via.placeholder.com/300x200?text=Recipe'],
        prepTime: prepTime || '30 minutes',
        cookTime: cookTime || '30 minutes',
        servings: servings || '4 servings',
      };
      
      recipes.push(recipe);
    });
    
    return recipes;
  };

  const handlePreferenceChange = (event: SelectChangeEvent) => {
    setPreferenceType(event.target.value);
  };

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserQuery(event.target.value);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRecipe(null);
  };

  const handleSaveRecipe = async () => {
    if (!selectedRecipe) return;
    
    try {
      setIsSaving(true);
      
      // Get user email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        showSnackbar('User information not found. Please log in again.', 'error');
        navigate('/login');
        return;
      }
      
      // Create a recipe object to save
      const recipeToSave = {
        name: selectedRecipe.name,
        description: selectedRecipe.description,
        category: selectedRecipe.category || 'Other',
        ingredients: selectedRecipe.ingredients,
        instructions: selectedRecipe.instructions,
        images: selectedRecipe.images,
        prepTime: selectedRecipe.prepTime,
        cookTime: selectedRecipe.cookTime,
        servings: selectedRecipe.servings,
        calories: selectedRecipe.calories,
        fat: selectedRecipe.fat,
        protein: selectedRecipe.protein,
        carbs: selectedRecipe.carbs,
        tags: [],
        ingredientQuantities: []
      };
      
      // Send the recipe to the backend using the correct endpoint
      const response = await httpPostRequest(`http://localhost:8000/recipe?email=${userEmail}`, recipeToSave);
      
      if (response && response._id) {
        showSnackbar('Recipe saved successfully!', 'success');
        
        // Update the selected recipe with the new ID
        setSelectedRecipe({
          ...selectedRecipe,
          _id: response._id
        });
        
        // Refresh the user's recipes
        fetchUserRecipes();
      } else {
        showSnackbar('Failed to save recipe', 'error');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      showSnackbar('Error saving recipe', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ 
      backgroundColor: theme.background, 
      color: theme.color, 
      minHeight: '100vh', 
      py: 4,
      px: { xs: 2, sm: 4 }
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            background: `linear-gradient(45deg, ${theme.headerColor}, ${theme.background})`,
            color: theme.color,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            What Should I Eat?
          </Typography>
          <Typography 
            variant="h6" 
            paragraph 
            sx={{ 
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto',
              opacity: 0.9,
            }}
          >
            Get personalized recipe recommendations based on your preferences, cooking history, and the current season.
          </Typography>
        </Paper>

        {/* Preference Selection */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            backgroundColor: theme.background,
            border: `1px solid ${theme.headerColor}`,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              textAlign: 'center',
              color: theme.color,
            }}
          >
            Choose Your Preference
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel 
                  id="preference-type-label"
                  sx={{ color: theme.color }}
                >
                  Recommendation Type
                </InputLabel>
                <Select
                  labelId="preference-type-label"
                  value={preferenceType}
                  label="Recommendation Type"
                  onChange={handlePreferenceChange}
                  sx={{
                    color: theme.color,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.headerColor,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.color,
                    },
                  }}
                >
                  <MenuItem value="personalized">Personalized (Based on your history)</MenuItem>
                  <MenuItem value="quick">Quick & Easy</MenuItem>
                  <MenuItem value="healthy">Healthy & Nutritious</MenuItem>
                  <MenuItem value="comfort">Comfort Food</MenuItem>
                  <MenuItem value="vegetarian">Vegetarian</MenuItem>
                  <MenuItem value="custom">Custom Query</MenuItem>
                </Select>
              </FormControl>
              
              {preferenceType === 'custom' && (
                <TextField
                  fullWidth
                  label="What kind of recipes are you looking for?"
                  variant="outlined"
                  value={userQuery}
                  onChange={handleQueryChange}
                  sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      color: theme.color,
                      '& fieldset': {
                        borderColor: theme.headerColor,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.color,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.color,
                    },
                  }}
                />
              )}
              
              <Button
                variant="contained"
                size="large"
                onClick={getPersonalizedRecommendations}
                disabled={isLoading || (preferenceType === 'custom' && !userQuery)}
                startIcon={<RestaurantIcon />}
                sx={{
                  backgroundColor: theme.headerColor,
                  color: theme.color,
                  width: '100%',
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: theme.color,
                    color: theme.background,
                  },
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Get Personalized Recommendations'}
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ color: theme.color }}
              >
                Daily Seasonal Recommendations
              </Typography>
              <Typography 
                variant="body1" 
                paragraph
                sx={{ color: theme.color, opacity: 0.9 }}
              >
                Get recipe recommendations based on the current season and trending ingredients.
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                onClick={getDailyRecommendations}
                disabled={isLoadingDaily}
                startIcon={<CalendarTodayIcon />}
                sx={{
                  backgroundColor: theme.headerColor,
                  color: theme.color,
                  width: '100%',
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: theme.color,
                    color: theme.background,
                  },
                }}
              >
                {isLoadingDaily ? <CircularProgress size={24} color="inherit" /> : 'Get Daily Recommendations'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* AI Recommendations Section */}
        {(recommendedRecipes.length > 0) && (
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              backgroundColor: theme.background,
              border: `1px solid ${theme.headerColor}`,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                mb: 3,
                textAlign: 'center',
                color: theme.color,
              }}
            >
              {preferenceType === 'personalized' ? 'Personalized Recommendations' : 'Daily Recommendations'}
            </Typography>
            
            {/* Recommended Recipes Tiles */}
            <Grid container spacing={3}>
              {recommendedRecipes.map((recipe) => (
                <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease-in-out',
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
                    onClick={() => handleRecipeClick(recipe)}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={recipe.images && recipe.images.length > 0 ? recipe.images[0] : 'https://via.placeholder.com/300x200?text=Recipe'}
                      alt={recipe.name}
                      sx={{ 
                        objectFit: 'cover',
                        borderBottom: `2px solid ${theme.headerColor}`,
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography 
                        gutterBottom 
                        variant="h6" 
                        component="h3"
                        sx={{ 
                          fontWeight: 600,
                          color: theme.color,
                          mb: 1,
                          textAlign: 'center',
                        }}
                      >
                        {recipe.name}
                      </Typography>
                      <Stack 
                        direction="row" 
                        spacing={1} 
                        mb={1}
                        justifyContent="center"
                        flexWrap="wrap"
                      >
                        {recipe.prepTime && (
                          <Chip
                            icon={<AccessTimeIcon />}
                            label={recipe.prepTime}
                            size="small"
                            sx={{
                              backgroundColor: theme.headerColor,
                              color: theme.color,
                              m: 0.5,
                            }}
                          />
                        )}
                        {recipe.cookTime && (
                          <Chip
                            icon={<LocalDiningIcon />}
                            label={recipe.cookTime}
                            size="small"
                            sx={{
                              backgroundColor: theme.headerColor,
                              color: theme.color,
                              m: 0.5,
                            }}
                          />
                        )}
                        {recipe.servings && (
                          <Chip
                            icon={<PeopleIcon />}
                            label={recipe.servings}
                            size="small"
                            sx={{
                              backgroundColor: theme.headerColor,
                              color: theme.color,
                              m: 0.5,
                            }}
                          />
                        )}
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.color,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          opacity: 0.9,
                        }}
                      >
                        {recipe.description || 'No description available'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* User's Saved Recipes Section */}
        {userRecipes.length > 0 && (
          <Paper
            elevation={3}
            sx={{
              p: 4,
              backgroundColor: theme.background,
              border: `1px solid ${theme.headerColor}`,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                mb: 3,
                textAlign: 'center',
                color: theme.color,
              }}
            >
              Your Saved Recipes
            </Typography>
            <Grid container spacing={3}>
              {userRecipes.map((recipe) => (
                <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease-in-out',
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
                    onClick={() => handleRecipeClick(recipe)}
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
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography 
                        gutterBottom 
                        variant="h6" 
                        component="h3"
                        sx={{ 
                          fontWeight: 600,
                          color: theme.color,
                          mb: 1,
                          textAlign: 'center',
                        }}
                      >
                        {recipe.name}
                      </Typography>
                      <Stack 
                        direction="row" 
                        spacing={1} 
                        mb={1}
                        justifyContent="center"
                        flexWrap="wrap"
                      >
                        {recipe.prepTime && (
                          <Chip
                            icon={<AccessTimeIcon />}
                            label={recipe.prepTime}
                            size="small"
                            sx={{
                              backgroundColor: theme.headerColor,
                              color: theme.color,
                              m: 0.5,
                            }}
                          />
                        )}
                        {recipe.cookTime && (
                          <Chip
                            icon={<LocalDiningIcon />}
                            label={recipe.cookTime}
                            size="small"
                            sx={{
                              backgroundColor: theme.headerColor,
                              color: theme.color,
                              m: 0.5,
                            }}
                          />
                        )}
                        {recipe.servings && (
                          <Chip
                            icon={<PeopleIcon />}
                            label={recipe.servings}
                            size="small"
                            sx={{
                              backgroundColor: theme.headerColor,
                              color: theme.color,
                              m: 0.5,
                            }}
                          />
                        )}
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.color,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          opacity: 0.9,
                        }}
                      >
                        {recipe.description || 'No description available'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {userRecipes.length > 6 && (
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/recipe-list')}
                  sx={{
                    borderColor: theme.headerColor,
                    color: theme.headerColor,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: theme.color,
                      backgroundColor: theme.headerColor,
                      color: theme.color,
                    },
                  }}
                >
                  View All Your Recipes
                </Button>
              </Box>
            )}
          </Paper>
        )}
      </Container>

      {/* Recipe Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.background,
            color: theme.color,
            borderRadius: 2,
          }
        }}
      >
        {selectedRecipe && (
          <>
            <DialogTitle sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: `1px solid ${theme.headerColor}`,
            }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {selectedRecipe.name}
              </Typography>
              <IconButton 
                onClick={handleCloseDialog}
                sx={{ color: theme.color }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <img
                    src={selectedRecipe.images && selectedRecipe.images.length > 0 ? selectedRecipe.images[0] : 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={selectedRecipe.name}
                    style={{
                      width: '100%',
                      height: '300px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography paragraph>{selectedRecipe.description}</Typography>
                  
                  <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
                    {selectedRecipe.prepTime && (
                      <Chip
                        icon={<AccessTimeIcon />}
                        label={`${selectedRecipe.prepTime} prep`}
                        sx={{
                          backgroundColor: theme.headerColor,
                          color: theme.color,
                          m: 0.5,
                        }}
                      />
                    )}
                    {selectedRecipe.cookTime && (
                      <Chip
                        icon={<LocalDiningIcon />}
                        label={`${selectedRecipe.cookTime} cook`}
                        sx={{
                          backgroundColor: theme.headerColor,
                          color: theme.color,
                          m: 0.5,
                        }}
                      />
                    )}
                    {selectedRecipe.servings && (
                      <Chip
                        icon={<PeopleIcon />}
                        label={`${selectedRecipe.servings} servings`}
                        sx={{
                          backgroundColor: theme.headerColor,
                          color: theme.color,
                          m: 0.5,
                        }}
                      />
                    )}
                  </Stack>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Ingredients
                  </Typography>
                  <List>
                    {selectedRecipe.ingredients?.map((ingredient: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={ingredient} 
                          sx={{ color: theme.color }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Instructions
                  </Typography>
                  <List>
                    {selectedRecipe.instructions?.map((instruction: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemText 
                          primary={`${index + 1}. ${instruction}`}
                          sx={{ color: theme.color }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.headerColor}` }}>
              <Button 
                onClick={handleCloseDialog}
                sx={{ 
                  color: theme.color,
                  '&:hover': {
                    backgroundColor: theme.headerColor,
                  },
                }}
              >
                Close
              </Button>
              
              {selectedRecipe && selectedRecipe._id.startsWith('recommended-') && (
                <Button 
                  variant="contained"
                  onClick={handleSaveRecipe}
                  disabled={isSaving}
                  startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{
                    backgroundColor: theme.headerColor,
                    color: theme.color,
                    '&:hover': {
                      backgroundColor: theme.color,
                      color: theme.background,
                    },
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Recipe'}
                </Button>
              )}
              
              {selectedRecipe && !selectedRecipe._id.startsWith('recommended-') && (
                <Button 
                  variant="contained"
                  onClick={() => {
                    handleCloseDialog();
                    navigate(`/recipe-details/${selectedRecipe._id}`);
                  }}
                  sx={{
                    backgroundColor: theme.headerColor,
                    color: theme.color,
                    '&:hover': {
                      backgroundColor: theme.color,
                      color: theme.background,
                    },
                  }}
                >
                  View Full Recipe
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            backgroundColor: theme.background,
            color: theme.color,
            '& .MuiAlert-icon': {
              color: theme.color,
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WhatToEatPage; 