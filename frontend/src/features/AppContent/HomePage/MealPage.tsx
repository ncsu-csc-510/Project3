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
} from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useTheme } from '../../Themes/themeContext'
import axios from 'axios'
import noImage from '../RecipeInformation/no-image.png'

const MealPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [mealPlan, setMealPlan] = useState<any[]>(Array(7).fill(null))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        setLoading(true)
        const response = await axios.get('http://localhost:8000/recipe/meal-plan/')
        const updatedMealPlan = Array(7).fill(null)
        response.data.forEach((entry: any) => {
          if (entry.recipe) {
            updatedMealPlan[entry.day] = entry.recipe
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
                    <Grid container spacing={2}>
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
    </Container>
  )
}

export default MealPage
