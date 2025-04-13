import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  IconButton,
  Tooltip,
  Divider,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { useTheme } from '../../Themes/themeContext'
import axios from 'axios'
import noImage from '../RecipeInformation/no-image.png'

const MealPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [mealPlan, setMealPlan] = useState<any[]>(Array(7).fill(null))
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        setLoading(true)
        const response = await axios.get('http://localhost:8000/recipe/meal-plan/')
        const updatedMealPlan = Array(7).fill(null)
        
        // The backend returns an array where each element is either null or a meal plan entry
        response.data.forEach((entry: any, index: number) => {
          if (entry && entry.recipe) {
            updatedMealPlan[index] = entry.recipe
          }
        })
        
        setMealPlan(updatedMealPlan)
      } catch (error) {
        console.error('Error fetching meal plan:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMealPlan()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleAddRecipe = (dayIndex: number) => {
    navigate('/recipe-list', { state: { selectedDay: dayIndex } })
  }

  const handleDeleteMeal = async (dayIndex: number) => {
    try {
      await axios.delete(`http://localhost:8000/recipe/meal-plan/${dayIndex}`)
      const updatedMealPlan = [...mealPlan]
      updatedMealPlan[dayIndex] = null
      setMealPlan(updatedMealPlan)
    } catch (error) {
      console.error('Error deleting meal:', error)
    }
  }

  const handleRecipeClick = (recipe: any) => {
    setSelectedRecipe(recipe)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleExportToShoppingList = async () => {
    try {
      console.log('Starting export to shopping list...');  // Debug log
      // Collect all ingredients from the meal plan
      const ingredients = new Map<string, { quantity: number, unit: string }>();
      
      console.log('Current meal plan:', mealPlan);  // Debug log
      
      // Check if meal plan is empty
      if (!mealPlan || mealPlan.length === 0) {
        alert('Your meal plan is empty. Add recipes to your meal plan first.');
        return;
      }
      
      // Count how many recipes have ingredients
      let recipesWithIngredients = 0;
      
      mealPlan.forEach((recipe) => {
        if (recipe && recipe.ingredients && recipe.ingredientQuantities) {
          recipesWithIngredients++;
          console.log('Processing recipe:', recipe.name);  // Debug log
          console.log('Ingredients:', recipe.ingredients);  // Debug log
          console.log('Quantities:', recipe.ingredientQuantities);  // Debug log
          
          recipe.ingredients.forEach((ingredient: string, index: number) => {
            if (!ingredient) return; // Skip empty ingredients
            
            const quantity = recipe.ingredientQuantities[index] || '1';
            // Try to parse quantity and unit
            const match = quantity.match(/^([\d./]+)\s*(.+)$/);
            if (match) {
              const [, amount, unit] = match;
              try {
                const numAmount = parseFloat(eval(amount)); // Using eval to handle fractions like "1/2"
                if (!isNaN(numAmount)) {
                  const existing = ingredients.get(ingredient);
                  if (existing) {
                    existing.quantity += numAmount;
                  } else {
                    ingredients.set(ingredient, { quantity: numAmount, unit });
                  }
                }
              } catch (e) {
                console.error('Error parsing amount:', amount, e);
                // Default to 1 if parsing fails
                const existing = ingredients.get(ingredient);
                if (existing) {
                  existing.quantity += 1;
                } else {
                  ingredients.set(ingredient, { quantity: 1, unit: 'piece' });
                }
              }
            } else {
              // If no unit specified, assume 'piece'
              const numAmount = parseFloat(quantity) || 1;
              const existing = ingredients.get(ingredient);
              if (existing) {
                existing.quantity += numAmount;
              } else {
                ingredients.set(ingredient, { quantity: numAmount, unit: 'piece' });
              }
            }
          });
        }
      });
      
      if (recipesWithIngredients === 0) {
        alert('No recipes with ingredients found in your meal plan.');
        return;
      }

      console.log('Collected ingredients:', Array.from(ingredients.entries()));  // Debug log

      // Convert to shopping list items
      const shoppingItems = Array.from(ingredients.entries()).map(([name, { quantity, unit }]) => ({
        name,
        quantity: Math.ceil(quantity), // Round up to nearest whole number
        unit,
        checked: false
      }));

      console.log('Shopping items to be sent:', shoppingItems);  // Debug log

      // Add to shopping list
      if (shoppingItems.length > 0) {
        const response = await axios.post('http://localhost:8000/recipe/shopping-list/update', shoppingItems);
        console.log('Shopping list update response:', response.data);  // Debug log
        
        if (response.data && response.data.shopping_list) {
          alert(`Successfully added ${shoppingItems.length} ingredients to your shopping list!`);
        } else {
          alert('Ingredients added to shopping list, but there was an issue with the response.');
        }
      } else {
        alert('No ingredients found in meal plan.');
      }
    } catch (error) {
      console.error('Error exporting to shopping list:', error);
      alert('Failed to export ingredients to shopping list. Please try again.');
    }
  };

  const days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          backgroundColor: theme.background,
          color: theme.color,
          borderRadius: 2,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            My Meal Plan
          </Typography>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Export to Shopping List">
              <IconButton
                onClick={handleExportToShoppingList}
                sx={{
                  color: theme.headerColor,
                  '&:hover': { color: theme.color },
                }}
              >
                <ShoppingCartIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print Meal Plan">
              <IconButton
                onClick={handlePrint}
                sx={{
                  color: theme.headerColor,
                  '&:hover': { color: theme.color },
                }}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          {days.map((day, index) => (
            <Grid item xs={12} key={day}>
              <Card
                sx={{
                  backgroundColor: theme.background,
                  border: `1px solid ${theme.headerColor}`,
                  borderRadius: 2,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {day}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Add Recipe">
                        <IconButton
                          onClick={() => handleAddRecipe(index)}
                          sx={{
                            color: theme.headerColor,
                            '&:hover': { color: theme.color },
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      {mealPlan[index] && (
                        <Tooltip title="Delete Meal">
                          <IconButton
                            onClick={() => handleDeleteMeal(index)}
                            sx={{
                              color: theme.headerColor,
                              '&:hover': { color: theme.color },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>

                  {mealPlan[index] ? (
                    <Grid 
                      container 
                      spacing={2} 
                      onClick={() => handleRecipeClick(mealPlan[index])}
                      sx={{ cursor: 'pointer' }}
                    >
                      <Grid item xs={12} sm={4}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={
                            mealPlan[index]?.images?.length > 0
                              ? mealPlan[index].images[0]
                              : noImage
                          }
                          alt={mealPlan[index].name}
                          sx={{
                            borderRadius: 1,
                            objectFit: 'cover',
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <Typography variant="h6" gutterBottom>
                          {mealPlan[index].name}
                        </Typography>
                        <Stack direction="row" spacing={1} mb={1}>
                          <Chip
                            label={`${mealPlan[index].prepTime} prep`}
                            size="small"
                            sx={{
                              backgroundColor: theme.headerColor,
                              color: theme.color,
                            }}
                          />
                          <Chip
                            label={`${mealPlan[index].servings} servings`}
                            size="small"
                            sx={{
                              backgroundColor: theme.headerColor,
                              color: theme.color,
                            }}
                          />
                        </Stack>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {mealPlan[index].description}
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Box
                      sx={{
                        height: 140,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px dashed ${theme.headerColor}`,
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ color: theme.headerColor }}
                      >
                        No meal planned
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Recipe Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.background,
            color: theme.color,
          },
        }}
      >
        {selectedRecipe && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">{selectedRecipe.name}</Typography>
              <IconButton onClick={handleCloseDialog} sx={{ color: theme.color }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      selectedRecipe?.images?.length > 0
                        ? selectedRecipe.images[0]
                        : noImage
                    }
                    alt={selectedRecipe.name}
                    sx={{
                      borderRadius: 1,
                      objectFit: 'cover',
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography paragraph>{selectedRecipe.description}</Typography>
                  
                  <Stack direction="row" spacing={2} mb={2}>
                    <Chip
                      label={`${selectedRecipe.prepTime} prep`}
                      sx={{
                        backgroundColor: theme.headerColor,
                        color: theme.color,
                      }}
                    />
                    <Chip
                      label={`${selectedRecipe.cookTime} cook`}
                      sx={{
                        backgroundColor: theme.headerColor,
                        color: theme.color,
                      }}
                    />
                    <Chip
                      label={`${selectedRecipe.servings} servings`}
                      sx={{
                        backgroundColor: theme.headerColor,
                        color: theme.color,
                      }}
                    />
                  </Stack>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Ingredients
                  </Typography>
                  <List>
                    {selectedRecipe.ingredients?.map((ingredient: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemText primary={ingredient} />
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
                        <ListItemText primary={`${index + 1}. ${instruction}`} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} sx={{ color: theme.color }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  )
}

export default MealPage
