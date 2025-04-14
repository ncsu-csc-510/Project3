import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Typography,
  Paper,
  Slider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface MealPlanGeneratorProps {
  onGenerate: (preferences: any) => void;
}

const dietaryOptions = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Low-Carb',
  'Keto',
  'Paleo',
  'Mediterranean',
];

const MealPlanGenerator: React.FC<MealPlanGeneratorProps> = ({ onGenerate }) => {
  const theme = useTheme();
  const [ingredients, setIngredients] = useState<string>('');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [maxCookingTime, setMaxCookingTime] = useState<number>(60);
  const [maxCalories, setMaxCalories] = useState<number>(800);
  const [maxProtein, setMaxProtein] = useState<number>(50);
  const [maxSugar, setMaxSugar] = useState<number>(30);
  const [maxSodium, setMaxSodium] = useState<number>(1000);
  const [days, setDays] = useState<number>(7);

  const handleGenerate = () => {
    const preferences = {
      ingredients: ingredients.split(',').map(ing => ing.trim()),
      dietary_preferences: selectedPreferences,
      max_cooking_time: maxCookingTime,
      max_calories: maxCalories,
      max_protein: maxProtein,
      max_sugar: maxSugar,
      max_sodium: maxSodium,
      days: days,
    };
    onGenerate(preferences);
  };

  return (
    <Paper
      sx={{
        p: 3,
        backgroundColor: theme.background,
        border: `1px solid ${theme.headerColor}`,
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Generate Meal Plan
      </Typography>

      <Stack spacing={3}>
        <TextField
          label="Available Ingredients (comma-separated)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          fullWidth
          multiline
          rows={2}
        />

        <FormControl fullWidth>
          <InputLabel>Dietary Preferences</InputLabel>
          <Select
            multiple
            value={selectedPreferences}
            onChange={(e) => setSelectedPreferences(e.target.value as string[])}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
          >
            {dietaryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <Typography gutterBottom>Maximum Cooking Time (minutes)</Typography>
          <Slider
            value={maxCookingTime}
            onChange={(_, value) => setMaxCookingTime(value as number)}
            min={15}
            max={180}
            step={15}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <Box>
          <Typography gutterBottom>Maximum Calories per Meal</Typography>
          <Slider
            value={maxCalories}
            onChange={(_, value) => setMaxCalories(value as number)}
            min={200}
            max={1500}
            step={100}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <Box>
          <Typography gutterBottom>Maximum Protein per Meal (g)</Typography>
          <Slider
            value={maxProtein}
            onChange={(_, value) => setMaxProtein(value as number)}
            min={10}
            max={100}
            step={5}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <Box>
          <Typography gutterBottom>Maximum Sugar per Meal (g)</Typography>
          <Slider
            value={maxSugar}
            onChange={(_, value) => setMaxSugar(value as number)}
            min={5}
            max={100}
            step={5}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <Box>
          <Typography gutterBottom>Maximum Sodium per Meal (mg)</Typography>
          <Slider
            value={maxSodium}
            onChange={(_, value) => setMaxSodium(value as number)}
            min={200}
            max={2000}
            step={100}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <Box>
          <Typography gutterBottom>Number of Days to Plan</Typography>
          <Slider
            value={days}
            onChange={(_, value) => setDays(value as number)}
            min={1}
            max={7}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        <Button
          variant="contained"
          onClick={handleGenerate}
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
      </Stack>
    </Paper>
  );
};

export default MealPlanGenerator; 