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
} from '@mui/material'
import Swal from 'sweetalert2'
import ClearIcon from '@mui/icons-material/Clear'

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

const AddRecipe = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [recipe, setRecipe] = useState(initialRecipeState)
  const [inputValues, setInputValues] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8000/recipe/add-recipe/',
        recipe
      )
      if (response.status === 201) {
        Swal.fire({
          title: 'Success!',
          text: 'Recipe added successfully! 🎉',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then(() => {
          navigate(0);
        })
      }
    } catch (err) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add recipe. Please try again.',
        icon: 'error',
        confirmButtonText: 'Retry',
      })
      console.error('Failed to add recipe.', err)
    }
  }

  return (
    <Stack spacing={3} padding={4}>
      <Typography variant="h4" fontWeight="bold">
        Add a New Recipe 🍽️
      </Typography>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {Object.entries(recipe).map(([key, value]) => (
              <Grid item xs={12} md={6} key={key}>
                {Array.isArray(value) ? (
                  <>
                    <TextField
                      fullWidth
                      label={`Add to ${key}`}
                      name={key}
                      value={inputValues[key] || ''}
                      onChange={(e) =>
                        handleArrayInputChange(key, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddItem(key as RecipeField)
                        }
                      }}
                      placeholder={`Press Enter to add to ${key}`}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              onClick={() => handleAddItem(key as RecipeField)}
                            >
                              Add
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                      {(value as string[]).map((item, index) => (
                        <Stack
                          key={index}
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          sx={{
                            backgroundColor: '#f0f0f0',
                            borderRadius: 2,
                            padding: '5px 10px',
                          }}
                        >
                          <Typography>{item}</Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setRecipe((prev) => ({
                                ...prev,
                                [key as keyof typeof initialRecipeState]: (prev[
                                  key as keyof typeof initialRecipeState
                                ] as string[]).filter((_, i) => i !== index),
                              }))
                            }
                          >
                            <ClearIcon />
                          </IconButton>
                        </Stack>
                      ))}
                    </Stack>
                  </>
                ) : (
                  <TextField
                    fullWidth
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    placeholder={`Enter ${key}`}
                  />
                )}
              </Grid>
            ))}
            <Grid item xs={12} textAlign="center">
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
                sx={{ px: 5, borderRadius: 2 }}
              >
                Add Recipe
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default AddRecipe
