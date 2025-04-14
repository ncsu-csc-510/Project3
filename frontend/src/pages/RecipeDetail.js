import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import InteractiveCookingMode from '../components/InteractiveCookingMode';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInteractiveMode, setShowInteractiveMode] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        console.log('Fetching recipe with id:', id);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/recipe/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch recipe: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Recipe data received:', data);
        
        if (!data.instructions || data.instructions.length === 0) {
          console.warn('Recipe has no instructions:', data);
        }
        
        setRecipe(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleStartInteractiveMode = () => {
    console.log('Starting interactive mode with recipe:', recipe);
    setShowInteractiveMode(true);
  };

  const handleCloseInteractiveMode = () => {
    console.log('Closing interactive mode');
    setShowInteractiveMode(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
        <Button variant="contained" color="primary" href="/" sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Paper>
    );
  }

  if (!recipe) {
    return (
      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="h6">Recipe not found</Typography>
        <Button variant="contained" color="primary" href="/" sx={{ mt: 2 }}>
          Back to Home
        </Button>
      </Paper>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {recipe.title || recipe.name}
        </Typography>
        <Typography variant="body1" paragraph>
          {recipe.description || "No description available."}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleStartInteractiveMode}
          sx={{ mb: 2 }}
          disabled={!recipe.instructions || recipe.instructions.length === 0}
        >
          Start Interactive Cooking Mode
        </Button>
        {(!recipe.instructions || recipe.instructions.length === 0) && (
          <Typography variant="body2" color="error">
            This recipe doesn't have any instructions for interactive mode.
          </Typography>
        )}
      </Paper>

      {showInteractiveMode && recipe && recipe.instructions && recipe.instructions.length > 0 && (
        <InteractiveCookingMode
          recipe={recipe}
          onClose={handleCloseInteractiveMode}
        />
      )}
    </Box>
  );
};

export default RecipeDetail; 