import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux';
import axios from "axios";
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
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import ClearIcon from "@mui/icons-material/Clear";

type Recipe = {
  name: string;
  cookTime: string;
  prepTime: string;
  totalTime: string;
  description: string;
  images: string[];
  category: string;
  tags: string[];
  ingredientQuantities: string[];
  ingredients: string[];
  rating: number;
  calories: number;
  fat: number;
  saturatedFat: number;
  cholesterol: number;
  sodium: number;
  carbs: number;
  fiber: number;
  sugar: number;
  protein: number;
  servings: number;
  instructions: string[];
};

const AddRecipe: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [recipe, setRecipe] = useState<Recipe>({
    name: "",
    cookTime: "",
    prepTime: "",
    totalTime: "",
    description: "",
    images: [],
    category: "",
    tags: [],
    ingredientQuantities: [],
    ingredients: [],
    rating: 0,
    calories: 0,
    fat: 0,
    saturatedFat: 0,
    cholesterol: 0,
    sodium: 0,
    carbs: 0,
    fiber: 0,
    sugar: 0,
    protein: 0,
    servings: 0,
    instructions: [],
  });

  const [currentInstruction, setCurrentInstruction] = useState<string>("");
  const [currentIngredient, setCurrentIngredient] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({ 
      ...prev, 
      [name]: name.match(/rating|calories|fat|saturatedFat|cholesterol|sodium|carbs|fiber|sugar|protein|servings/) 
        ? Number(value) 
        : value 
    }));
  };

  const handleAddItem = (field: keyof Recipe, value: string) => {
    if (value.trim() !== "") {
      setRecipe((prev) => ({
        ...prev,
        [field]: [...prev[field] as string[], value.trim()],
      }));
    }
  };

  const handleRemoveItem = (field: keyof Recipe, index: number) => {
    setRecipe((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("http://localhost:8000/recipe/add-recipe/", recipe);
      if (response.status === 201) {
        setMessage("Recipe added successfully! 🎉");
        setError(false);
        setOpenSnackbar(true);
        navigate('/favorites'); // Navigate to favorites after successful addition
      }
    } catch (err) {
      setMessage("Failed to add recipe. Please try again.");
      setError(true);
      setOpenSnackbar(true);
    }
  };

  return (
    <Stack spacing={3} padding={4}>
      <Typography variant="h4" fontWeight="bold">
        Add a New Recipe 🍽️
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Recipe Name"
                name="name"
                value={recipe.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={recipe.category}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Times */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cook Time"
                name="cookTime"
                value={recipe.cookTime}
                onChange={handleChange}
                placeholder="e.g., 30M"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Prep Time"
                name="prepTime"
                value={recipe.prepTime}
                onChange={handleChange}
                placeholder="e.g., 15M"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Servings"
                name="servings"
                type="number"
                value={recipe.servings}
                onChange={handleChange}
              />
            </Grid>

            {/* Nutritional Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Nutritional Information
              </Typography>
            </Grid>
            {['calories', 'protein', 'carbs', 'fat'].map((field) => (
              <Grid item xs={6} sm={3} key={field}>
                <TextField
                  fullWidth
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  name={field}
                  type="number"
                  value={recipe[field as keyof Recipe]}
                  onChange={handleChange}
                />
              </Grid>
            ))}

            {/* Instructions */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Instruction"
                value={currentInstruction}
                onChange={(e) => setCurrentInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && currentInstruction.trim()) {
                    handleAddItem("instructions", currentInstruction);
                    setCurrentInstruction("");
                  }
                }}
              />
              <Stack spacing={1} mt={2}>
                {recipe.instructions.map((instruction, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ backgroundColor: "#f5f5f5", p: 1, borderRadius: 1 }}
                  >
                    <Typography>{`${index + 1}. ${instruction}`}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveItem("instructions", index)}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </Grid>

            {/* Images */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Image URL"
                value=""
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter" && (e.currentTarget as HTMLInputElement).value.trim()) {
                      handleAddItem("images", (e.currentTarget as HTMLInputElement).value.trim());
                      (e.currentTarget as HTMLInputElement).value = "";
                    }
                  }}                  
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <AddPhotoAlternateIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                {recipe.images.map((img, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{
                      backgroundColor: "#f0f0f0",
                      borderRadius: 2,
                      padding: "5px 10px",
                      margin: "5px",
                    }}
                  >
                    <Typography>{img}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveItem("images", index)}
                    >
                      <ClearIcon />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </Grid>

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

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={error ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default AddRecipe;
