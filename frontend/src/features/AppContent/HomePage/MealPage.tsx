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
  Tabs,
  Tab,
} from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import { useTheme } from '../../Themes/themeContext'
import axios from 'axios'
import noImage from '../RecipeInformation/no-image.png'
import MealPlanGenerator from '../../../components/MealPlanGenerator'
import DragDropMealPlan from './DragDropMealPlan'

const MealPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [mealPlan, setMealPlan] = useState<any[]>(Array(7).fill(null))
  const [loading, setLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        setLoading(true)
        const response = await axios.get('http://localhost:8000/recipes/meal-plan/')
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
      await axios.delete(`http://localhost:8000/recipes/meal-plan/${dayIndex}`)
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
        const response = await axios.post('http://localhost:8000/shopping-list/update', shoppingItems);
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

  const handleGenerateClick = () => {
    setIsGenerateDialogOpen(true);
  };

  const handleGenerateClose = () => {
    setIsGenerateDialogOpen(false);
  };

  const handleGenerateSubmit = async (preferences: any) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/recipes/generate-meal-plan/', preferences);
      
      // Refresh the meal plan after generation
      const updatedResponse = await axios.get('http://localhost:8000/recipes/meal-plan/');
      const updatedMealPlan = Array(7).fill(null);
      
      updatedResponse.data.forEach((entry: any, index: number) => {
        if (entry && entry.recipe) {
          updatedMealPlan[index] = entry.recipe;
        }
      });
      
      setMealPlan(updatedMealPlan);
      handleGenerateClose();
    } catch (error) {
      console.error('Error generating meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderNutritionalInfo = (recipe: any) => {
    if (!recipe) return null;
    
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
        <Chip
          label={`${recipe.sugar || 0}g sugar`}
          size="small"
          sx={{
            backgroundColor: theme.headerColor,
            color: theme.color,
            fontWeight: 'bold',
          }}
        />
        <Chip
          label={`${recipe.sodium || 0}mg sodium`}
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
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          sx={{
            borderBottom: `2px solid ${theme.headerColor}`,
            pb: 2,
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
            }}
          >
            My Meal Plan
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<RestaurantIcon />}
              onClick={handleGenerateClick}
              sx={{
                backgroundColor: theme.headerColor,
                color: theme.color,
                fontWeight: 'bold',
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: theme.color,
                  color: theme.headerColor,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                },
              }}
            >
              Generate Plan
            </Button>
            <Button
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={handleExportToShoppingList}
              sx={{
                backgroundColor: theme.headerColor,
                color: theme.color,
                fontWeight: 'bold',
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: theme.color,
                  color: theme.headerColor,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                },
              }}
            >
              Export to Shopping List
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{
                backgroundColor: theme.headerColor,
                color: theme.color,
                fontWeight: 'bold',
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: theme.color,
                  color: theme.headerColor,
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                },
              }}
            >
              Print
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: theme.headerColor,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                '&.Mui-selected': {
                  color: theme.color,
                  backgroundColor: theme.headerColor,
                },
              },
            }}
          >
            <Tab label="Calendar View" />
            <Tab label="Drag & Drop View" />
          </Tabs>
        </Box>

        {activeTab === 0 ? (
          <Grid container spacing={3}>
            {days.map((day, index) => (
              <Grid item xs={12} key={day}>
                <Card
                  sx={{
                    backgroundColor: theme.background,
                    border: `1px solid ${theme.headerColor}`,
                    borderRadius: 2,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                      sx={{
                        borderBottom: `1px solid ${theme.headerColor}`,
                        pb: 1,
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: theme.headerColor,
                        }}
                      >
                        {day}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Add Recipe">
                          <IconButton
                            onClick={() => handleAddRecipe(index)}
                            sx={{
                              color: theme.headerColor,
                              '&:hover': { 
                                color: theme.color,
                                transform: 'scale(1.1)',
                                transition: 'transform 0.2s ease-in-out',
                              },
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
                                '&:hover': { 
                                  color: theme.color,
                                  transform: 'scale(1.1)',
                                  transition: 'transform 0.2s ease-in-out',
                                },
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
                        sx={{ 
                          cursor: 'pointer',
                        }}
                      >
                        <Grid item xs={12}>
                          <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{
                              fontWeight: 'bold',
                              color: theme.headerColor,
                            }}
                          >
                            {mealPlan[index].name}
                          </Typography>
                          <Stack direction="row" spacing={1} mb={1}>
                            <Chip
                              label={`${mealPlan[index].prepTime} prep`}
                              size="small"
                              sx={{
                                backgroundColor: theme.headerColor,
                                color: theme.color,
                                fontWeight: 'bold',
                              }}
                            />
                            <Chip
                              label={`${mealPlan[index].servings} servings`}
                              size="small"
                              sx={{
                                backgroundColor: theme.headerColor,
                                color: theme.color,
                                fontWeight: 'bold',
                              }}
                            />
                          </Stack>
                          {renderNutritionalInfo(mealPlan[index])}
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              fontStyle: 'italic',
                              mt: 1,
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
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            borderColor: theme.color,
                            backgroundColor: 'rgba(0,0,0,0.02)',
                          },
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ 
                            color: theme.headerColor,
                            fontStyle: 'italic',
                          }}
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
        ) : (
          <DragDropMealPlan />
        )}

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
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            },
          }}
        >
          {selectedRecipe && (
            <>
              <DialogTitle 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderBottom: `1px solid ${theme.headerColor}`,
                }}
              >
                <Typography 
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: theme.headerColor,
                  }}
                >
                  {selectedRecipe.name}
                </Typography>
                <IconButton 
                  onClick={handleCloseDialog} 
                  sx={{ 
                    color: theme.headerColor,
                    '&:hover': {
                      color: theme.color,
                      transform: 'scale(1.1)',
                      transition: 'transform 0.2s ease-in-out',
                    },
                  }}
                >
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
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        fontWeight: 'bold',
                        color: theme.headerColor,
                      }}
                    >
                      Description
                    </Typography>
                    <Typography 
                      paragraph
                      sx={{
                        fontStyle: 'italic',
                      }}
                    >
                      {selectedRecipe.description}
                    </Typography>
                    
                    <Stack direction="row" spacing={2} mb={2}>
                      <Chip
                        label={`${selectedRecipe.prepTime} prep`}
                        sx={{
                          backgroundColor: theme.headerColor,
                          color: theme.color,
                          fontWeight: 'bold',
                        }}
                      />
                      <Chip
                        label={`${selectedRecipe.cookTime} cook`}
                        sx={{
                          backgroundColor: theme.headerColor,
                          color: theme.color,
                          fontWeight: 'bold',
                        }}
                      />
                      <Chip
                        label={`${selectedRecipe.servings} servings`}
                        sx={{
                          backgroundColor: theme.headerColor,
                          color: theme.color,
                          fontWeight: 'bold',
                        }}
                      />
                    </Stack>

                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        fontWeight: 'bold',
                        color: theme.headerColor,
                      }}
                    >
                      Nutritional Information
                    </Typography>
                    <Grid container spacing={2} mb={3}>
                      <Grid item xs={6} sm={3}>
                        <Paper 
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="h6" color={theme.headerColor}>
                            {selectedRecipe.calories || 0}
                          </Typography>
                          <Typography variant="body2">Calories</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper 
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="h6" color={theme.headerColor}>
                            {selectedRecipe.protein || 0}g
                          </Typography>
                          <Typography variant="body2">Protein</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper 
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="h6" color={theme.headerColor}>
                            {selectedRecipe.sugar || 0}g
                          </Typography>
                          <Typography variant="body2">Sugar</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper 
                          elevation={0}
                          sx={{
                            p: 2,
                            textAlign: 'center',
                            backgroundColor: 'rgba(0,0,0,0.05)',
                            borderRadius: 2,
                          }}
                        >
                          <Typography variant="h6" color={theme.headerColor}>
                            {selectedRecipe.sodium || 0}mg
                          </Typography>
                          <Typography variant="body2">Sodium</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        fontWeight: 'bold',
                        color: theme.headerColor,
                      }}
                    >
                      Ingredients
                    </Typography>
                    <List>
                      {selectedRecipe.ingredients?.map((ingredient: string, index: number) => (
                        <ListItem 
                          key={index}
                          sx={{
                            borderBottom: `1px solid ${theme.headerColor}`,
                            '&:last-child': {
                              borderBottom: 'none',
                            },
                          }}
                        >
                          <ListItemText 
                            primary={ingredient}
                            sx={{
                              '& .MuiListItemText-primary': {
                                fontStyle: 'italic',
                              },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{
                        fontWeight: 'bold',
                        color: theme.headerColor,
                      }}
                    >
                      Instructions
                    </Typography>
                    <List>
                      {selectedRecipe.instructions?.map((instruction: string, index: number) => (
                        <ListItem 
                          key={index}
                          sx={{
                            borderBottom: `1px solid ${theme.headerColor}`,
                            '&:last-child': {
                              borderBottom: 'none',
                            },
                          }}
                        >
                          <ListItemText 
                            primary={`${index + 1}. ${instruction}`}
                            sx={{
                              '& .MuiListItemText-primary': {
                                fontStyle: 'italic',
                              },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions
                sx={{
                  borderTop: `1px solid ${theme.headerColor}`,
                  p: 2,
                }}
              >
                <Button 
                  onClick={handleCloseDialog} 
                  sx={{ 
                    color: theme.headerColor,
                    '&:hover': {
                      color: theme.color,
                      backgroundColor: 'rgba(0,0,0,0.05)',
                    },
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Generate Meal Plan Dialog */}
        <Dialog
          open={isGenerateDialogOpen}
          onClose={handleGenerateClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: theme.background,
              color: theme.color,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: `1px solid ${theme.headerColor}`,
            },
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${theme.headerColor}`,
            pb: 2,
            '& .MuiTypography-root': {
              color: theme.headerColor,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            },
          }}>
            Generate New Meal Plan
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <MealPlanGenerator onGenerate={handleGenerateSubmit} />
          </DialogContent>
          <DialogActions sx={{ 
            p: 3,
            borderTop: `1px solid ${theme.headerColor}`,
          }}>
            <Button
              onClick={handleGenerateClose}
              sx={{
                color: theme.headerColor,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.05)',
                },
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  )
}

export default MealPage
