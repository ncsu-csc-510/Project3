import React, { useState } from 'react';
import { Typography, Grid, TextField, Box, Tooltip, Card, CardContent, InputAdornment } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TimerIcon from '@mui/icons-material/Timer';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface MealPlanGeneratorProps {
  onGenerate: () => void;
}

const MealPlanGenerator = ({ onGenerate }: MealPlanGeneratorProps) => {
  const theme = useTheme();
  const [ingredients, setIngredients] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [maxCookingTime, setMaxCookingTime] = useState(15);
  const [maxCalories, setMaxCalories] = useState(800);
  const [maxProtein, setMaxProtein] = useState(50);
  const [maxSugar, setMaxSugar] = useState(30);
  const [maxSodium, setMaxSodium] = useState(1000);
  const [days, setDays] = useState(7);

  const handleNumberInput = (value: string, setter: (value: number) => void) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setter(numValue);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            backgroundColor: 'transparent',
            boxShadow: 'none',
            border: `1px solid ${theme.headerColor}`,
            borderRadius: 2,
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: theme.headerColor }}>
                Basic Information
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  label="Available Ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  multiline
                  rows={3}
                  placeholder="e.g., chicken, rice, broccoli, olive oil"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.headerColor,
                        borderWidth: '2px',
                      },
                      '&:hover fieldset': {
                        borderColor: theme.color,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.headerColor,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.headerColor,
                      fontWeight: 'bold',
                    },
                  }}
                />
                <Tooltip title="Enter ingredients you have or want to use">
                  <InfoIcon sx={{ 
                    position: 'absolute', 
                    right: 10, 
                    top: 10, 
                    color: theme.headerColor,
                    opacity: 0.7,
                  }} />
                </Tooltip>
              </Box>

              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  label="Dietary Preferences"
                  value={dietaryPreferences}
                  onChange={(e) => setDietaryPreferences(e.target.value)}
                  placeholder="e.g., vegetarian, gluten-free, low-carb"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: theme.headerColor,
                        borderWidth: '2px',
                      },
                      '&:hover fieldset': {
                        borderColor: theme.color,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.headerColor,
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: theme.headerColor,
                      fontWeight: 'bold',
                    },
                  }}
                />
                <Tooltip title="Specify any dietary restrictions or preferences">
                  <InfoIcon sx={{ 
                    position: 'absolute', 
                    right: 10, 
                    top: 10, 
                    color: theme.headerColor,
                    opacity: 0.7,
                  }} />
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            backgroundColor: 'transparent',
            boxShadow: 'none',
            border: `1px solid ${theme.headerColor}`,
            borderRadius: 2,
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: theme.headerColor }}>
                Nutritional Requirements
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Cooking Time"
                    type="number"
                    value={maxCookingTime}
                    onChange={(e) => handleNumberInput(e.target.value, setMaxCookingTime)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">min</InputAdornment>,
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeIcon sx={{ color: theme.headerColor }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.headerColor,
                          borderWidth: '2px',
                        },
                        '&:hover fieldset': {
                          borderColor: theme.color,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.headerColor,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.headerColor,
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Calories"
                    type="number"
                    value={maxCalories}
                    onChange={(e) => handleNumberInput(e.target.value, setMaxCalories)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">kcal</InputAdornment>,
                      startAdornment: (
                        <InputAdornment position="start">
                          <FitnessCenterIcon sx={{ color: theme.headerColor }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.headerColor,
                          borderWidth: '2px',
                        },
                        '&:hover fieldset': {
                          borderColor: theme.color,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.headerColor,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.headerColor,
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Protein"
                    type="number"
                    value={maxProtein}
                    onChange={(e) => handleNumberInput(e.target.value, setMaxProtein)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">g</InputAdornment>,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalDiningIcon sx={{ color: theme.headerColor }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.headerColor,
                          borderWidth: '2px',
                        },
                        '&:hover fieldset': {
                          borderColor: theme.color,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.headerColor,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.headerColor,
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Sugar"
                    type="number"
                    value={maxSugar}
                    onChange={(e) => handleNumberInput(e.target.value, setMaxSugar)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">g</InputAdornment>,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalDiningIcon sx={{ color: theme.headerColor }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.headerColor,
                          borderWidth: '2px',
                        },
                        '&:hover fieldset': {
                          borderColor: theme.color,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.headerColor,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.headerColor,
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Sodium"
                    type="number"
                    value={maxSodium}
                    onChange={(e) => handleNumberInput(e.target.value, setMaxSodium)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">mg</InputAdornment>,
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalDiningIcon sx={{ color: theme.headerColor }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.headerColor,
                          borderWidth: '2px',
                        },
                        '&:hover fieldset': {
                          borderColor: theme.color,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.headerColor,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.headerColor,
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Days"
                    type="number"
                    value={days}
                    onChange={(e) => handleNumberInput(e.target.value, setDays)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarTodayIcon sx={{ color: theme.headerColor }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: theme.headerColor,
                          borderWidth: '2px',
                        },
                        '&:hover fieldset': {
                          borderColor: theme.color,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.headerColor,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.headerColor,
                        fontWeight: 'bold',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default MealPlanGenerator 