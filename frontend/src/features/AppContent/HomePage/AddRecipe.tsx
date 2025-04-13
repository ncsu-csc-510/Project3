import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import {
  TextField,
  Button,
  Stack,
  Typography,
  Grid,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Divider,
  Paper,
  SelectChangeEvent,
} from '@mui/material'
import Swal from 'sweetalert2'
import ClearIcon from '@mui/icons-material/Clear'
import { RECIPE_CATEGORIES } from '../RecipeList/recipeCategories'
import { useTheme } from '../../Themes/themeContext'

type RecipeField = keyof typeof initialRecipeState

const initialRecipeState = {
  name: '',
  cookTime: '',
  prepTime: '',
  totalTime: '',
  description: '',
  images: [],
  category: '',
  tags: [],
  ingredientQuantities: [],
  ingredients: [],
  rating: '',
  calories: '',
  fat: '',
  saturatedFat: '',
  cholesterol: '',
  sodium: '',
  carbs: '',
  fiber: '',
  sugar: '',
  protein: '',
  servings: '',
  instructions: [],
}

const steps = ['Basic Information', 'Ingredients', 'Nutrition', 'Instructions']

const AddRecipe = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [recipe, setRecipe] = useState(initialRecipeState)
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [activeStep, setActiveStep] = useState(0)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRecipe((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target
    setRecipe((prev) => ({ ...prev, [name]: value }))
  }

  const handleArrayInputChange = (field: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddItem = (field: RecipeField) => {
    const value = inputValues[field]
    if (value && value.trim()) {
      setRecipe((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()],
      }))
      setInputValues((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleRemoveItem = (field: RecipeField, index: number) => {
    setRecipe((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }))
  }

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit()
    } else {
      setActiveStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        navigate('/login');
        return;
      }

      // Format the recipe data to match the backend model
      const formattedRecipe = {
        name: recipe.name,
        category: recipe.category,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        description: recipe.description,
        cookTime: recipe.cookTime,
        prepTime: recipe.prepTime,
        totalTime: recipe.totalTime,
        images: recipe.images,
        tags: recipe.tags,
        ingredientQuantities: recipe.ingredientQuantities,
        rating: recipe.rating,
        calories: recipe.calories,
        fat: recipe.fat,
        saturatedFat: recipe.saturatedFat,
        cholesterol: recipe.cholesterol,
        sodium: recipe.sodium,
        carbs: recipe.carbs,
        fiber: recipe.fiber,
        sugar: recipe.sugar,
        protein: recipe.protein,
        servings: recipe.servings
      };

      const response = await axios.post(
        `http://localhost:8000/recipe?email=${userEmail}`,
        formattedRecipe
      );
      
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: 'Recipe added successfully! 🎉',
          severity: 'success',
        });
        setTimeout(() => {
          navigate('/recipe-list');
        }, 2000);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to add recipe. Please try again.',
        severity: 'error',
      });
      console.error('Failed to add recipe.', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recipe Name"
                name="name"
                value={recipe.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={recipe.description}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Prep Time"
                name="prepTime"
                value={recipe.prepTime}
                onChange={handleChange}
                placeholder="e.g., 30 minutes"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cook Time"
                name="cookTime"
                value={recipe.cookTime}
                onChange={handleChange}
                placeholder="e.g., 1 hour"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Total Time"
                name="totalTime"
                value={recipe.totalTime}
                onChange={handleChange}
                placeholder="e.g., 1 hour 30 minutes"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={recipe.category}
                  onChange={handleSelectChange}
                  label="Category"
                >
                  {RECIPE_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Servings"
                name="servings"
                value={recipe.servings}
                onChange={handleChange}
                type="number"
              />
            </Grid>
          </Grid>
        )
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Ingredient"
                value={inputValues.ingredients || ''}
                onChange={(e) => handleArrayInputChange('ingredients', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddItem('ingredients')
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button onClick={() => handleAddItem('ingredients')}>Add</Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                <Stack spacing={1}>
                  {recipe.ingredients.map((ingredient, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1,
                        bgcolor: theme.headerColor,
                        borderRadius: 1,
                      }}
                    >
                      <Typography>{ingredient}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem('ingredients', index)}
                      >
                        <ClearIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Calories"
                name="calories"
                value={recipe.calories}
                onChange={handleChange}
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Protein (g)"
                name="protein"
                value={recipe.protein}
                onChange={handleChange}
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Carbs (g)"
                name="carbs"
                value={recipe.carbs}
                onChange={handleChange}
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fat (g)"
                name="fat"
                value={recipe.fat}
                onChange={handleChange}
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fiber (g)"
                name="fiber"
                value={recipe.fiber}
                onChange={handleChange}
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sugar (g)"
                name="sugar"
                value={recipe.sugar}
                onChange={handleChange}
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sodium (mg)"
                name="sodium"
                value={recipe.sodium}
                onChange={handleChange}
                type="number"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cholesterol (mg)"
                name="cholesterol"
                value={recipe.cholesterol}
                onChange={handleChange}
                type="number"
              />
            </Grid>
          </Grid>
        )
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Instruction Step"
                value={inputValues.instructions || ''}
                onChange={(e) => handleArrayInputChange('instructions', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddItem('instructions')
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button onClick={() => handleAddItem('instructions')}>Add</Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                <Stack spacing={2}>
                  {recipe.instructions.map((instruction, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        p: 2,
                        bgcolor: theme.headerColor,
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ minWidth: 30 }}>
                        {index + 1}.
                      </Typography>
                      <Typography sx={{ flex: 1 }}>{instruction}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem('instructions', index)}
                      >
                        <ClearIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )
      default:
        return null
    }
  }

  return (
    <Stack spacing={3} padding={4} sx={{ backgroundColor: theme.background, minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ color: theme.color }}>
        Add a New Recipe <span role="img" aria-label="recipe">👨‍🍳</span>
      </Typography>
      
      <Card sx={{ borderRadius: 3, boxShadow: 3, bgcolor: theme.background }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 2, mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{
                bgcolor: theme.headerColor,
                color: theme.color,
                '&:hover': {
                  bgcolor: theme.background,
                },
              }}
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

export default AddRecipe
