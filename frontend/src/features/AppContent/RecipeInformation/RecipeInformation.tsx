/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

/**
 * File name: RecipeInformation.tsx
 * Task - This component displays images for recipe making, the procedure to make the dish and the
 * trivia and factual info related to it.
 * This component is a dynamic component and is seen only when you click on a recipe from the recipe list
 * @author Priyanka Ambawane - dearpriyankasa@gmail.com
 */
import {
  IconButton,
  Grid,
  Paper,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Slider,
  Box,
  Card,
  CardContent,
  CardMedia
} from '@mui/material'
import { BrowserRouter as Router } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star'
import React, { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import applicationStore from '../../../store'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { getRecipeInfoInitiator } from './getRecipeInformation.action'
import './RecipeInformation.css'
import noImage from './no-image.png'
import { FaWhatsapp, FaSlack, FaDiscord } from 'react-icons/fa'
import InteractiveCookingMode from '../../../components/InteractiveCookingMode';

import axios from 'axios'

import { useTheme } from '../../Themes/themeContext'
import { useNavigate } from 'react-router-dom'; 
import RecipeFavoriteButton from './RecipeFavoriteButton'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'


let triviaPaperStyles = {
  backgroundColor: '#f2f4f4',
  marginTop: '20px',
  padding: '20px',
  marginLeft: '30px',
  marginRight: '30px',
}

const store = applicationStore()

const shareOnWhatsApp = (recipeUrl: string) => {
  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? process.env.REACT_APP_WHATSAPP_URL_PROD ||
        'https://api.whatsapp.com/send?text='
      : process.env.REACT_APP_WHATSAPP_URL_TEST ||
        'https://api.whatsapp.com/send?text='

  const whatsappUrl = `${baseUrl}Check out this recipe: ${encodeURIComponent(
    recipeUrl
  )}`
  window.open(whatsappUrl, '_blank')
  // const whatsappUrl = `https://api.whatsapp.com/send?text=Check out this recipe: ${encodeURIComponent(recipeUrl)}`;
}

const shareOnPlatform = (recipeUrl: string, platform: 'slack' | 'discord') => {
  const baseUrls = {
    slack:
      process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_SLACK_URL_PROD ||
          'https://slack.com/intl/en-us/share?text='
        : process.env.REACT_APP_SLACK_URL_TEST ||
          'https://slack.com/intl/en-us/share?text=',
    discord: 'https://discord.com/channels/@me?message=',
  }

  const encodedRecipe = encodeURIComponent(recipeUrl)
  const shareUrl =
    platform === 'slack'
      ? `${baseUrls.slack}Check out this recipe: ${encodedRecipe}`
      : `${baseUrls.discord}Check out this recipe: ${encodedRecipe}`

  window.open(shareUrl, '_blank')
}

const CopyUrlModal = ({ open, onClose, url, platform }: any) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    onClose()
    shareOnPlatform(url, platform)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Copy URL</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          value={url}
          variant="outlined"
          inputProps={{ readOnly: true }}
          multiline
          rows={2}
          style={{ wordWrap: 'break-word', height: 'auto' }}
        />
        <Typography
          variant="body2"
          color="textSecondary"
          style={{ marginTop: 10 }}
        >
          Click the "COPY" button to copy the URL. Then, Paste it into the
          message box on selected platform.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCopy} color="primary">
          Copy
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const RecipeInformationWrapped = () => {
  const { theme, themeName, toggleTheme } = useTheme();
  const navigate = useNavigate(); // For redirecting to Meal Plan page
  let { id } = useParams()
  const dispatch = useDispatch()
  const [servings, setServings] = useState(1);
  const [input, setInput] = useState('')
  const [response, setResponse] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [selectedPlatform, setSelectedPlatform] = useState('slack')
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [showInteractiveMode, setShowInteractiveMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [userRating, setUserRating] = useState<number>(0);

  // Calculate adjusted nutrition values based on servings
  const calculateAdjustedNutrition = (value: number, originalServings: number) => {
    return Math.round((value / originalServings) * servings);
  };

  const handleShareClick = (urlId: string, platform: 'slack' | 'discord') => {
    setOpenModal(true)
    setSelectedPlatform(platform)
  }

  // accesses the state of the component from the app's store
  const recipeInfo = useSelector((state: any) => state.getRecipeInfoAppState)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const loadVoices = () => {
    if (window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      if (voices.length > 0) {
        setSelectedVoice(voices[0]); // Default to the first voice
      }
    }
  };
  
  // Ensure voices are loaded after the window is loaded
  useEffect(() => {
    const handleVoiceChange = () => loadVoices(); // Re-run on voice change
    if (typeof window.speechSynthesis !== "undefined") {
      window.speechSynthesis.onvoiceschanged = handleVoiceChange; // Event to detect voice changes
      loadVoices(); // Initial load
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speakInstructions = (instruction: string) => {
    if (!isSpeaking && selectedVoice) {
      const synth = window.speechSynthesis
      const utterance = new SpeechSynthesisUtterance(instruction)
      utterance.voice = selectedVoice;
      utterance.onend = () => setIsSpeaking(false);
      synth.speak(utterance);
      setIsSpeaking(true);
    }
  }
  /* the effect hook below does an api call to get the recipe details
      using the recipe id as soon as the compnent gets loaded up */
  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      navigate('/login');
      return;
    }
    dispatch(getRecipeInfoInitiator('http://localhost:8000/recipes/' + id));
  }, [dispatch, id, navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleImageUpload = async () => {
    if (!selectedFile || !id) return

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await axios.post(
        `http://localhost:8000/recipes/${id}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (response.data && response.data.image_url) {
        // Refresh the recipe data to show the new image
        dispatch(getRecipeInfoInitiator(`http://localhost:8000/recipes/${id}`))
      }
    } catch (error) {
      setUploadError('Failed to upload image. Please try again.')
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
      setSelectedFile(null)
    }
  }

  const handleRatingChange = async (newRating: number) => {
    try {
      const response = await fetch(`http://localhost:8000/recipes/${id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: newRating }),
      });

      if (!response.ok) {
        throw new Error('Failed to update rating');
      }

      const data = await response.json();
      setUserRating(data.new_rating);
      // Refresh recipe data to get updated rating
      dispatch(getRecipeInfoInitiator(`http://localhost:8000/recipes/${id}`));
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  if (recipeInfo.isGetRecipeInfoLoading) {
    return <div data-testid="loading-spinner"> Loading ... </div>
  } else if (recipeInfo.isGetRecipeInfoFailure) {
    // Check if the error is authentication related and redirect to login
    const error = recipeInfo.getRecipeInfoError;
    if (error && error.includes('401')) {
      navigate('/login');
      return null;
    }
    return <div data-testid="error-message">Failed to load recipe data</div>;
  } else if (recipeInfo.isGetRecipeInfoSuccess) {
    const recipe = recipeInfo.getRecipeInfoData // The recipe object containing all necessary information

    const handleAddToMealPlan = async (recipee: any, dayIndex: number) => {
      try {
        const responsee = await axios.post("http://localhost:8000/recipes/meal-plan/", {
          day: dayIndex,
          recipe: recipee,
        });
        console.log(responsee.data.message); // Success message
        alert(`${recipee.name} added to the meal plan for ${
          ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayIndex]
        }!`);
      } catch (error) {
        console.error("Error saving meal plan:", error);
        alert("Failed to save the meal plan. Please try again.");
      }
    };

    const startInteractiveCooking = () => {
      setShowInteractiveMode(true);
    };

    return (
      <div
        style={{ 
          width: '100%', 
          color: theme.color, 
          background: theme.background,
          minHeight: '100vh',
          padding: '40px 20px'
        }}
        data-testid="RecipeInfo-comp-43"
      >
        {openModal && (
          <CopyUrlModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            url={`https://cookbook-alpha.vercel.app/recipe-details/${id}`}
            platform={selectedPlatform}
          />
        )}
        
        {/* Header Section */}
        <div className="recipe-header" style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px',
            flexWrap: 'nowrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap' }}>
              <Typography 
                variant="h2" 
                component="h1" 
                style={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.color}, ${theme.headerColor})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.8rem',
                  lineHeight: '1.2',
                  whiteSpace: 'nowrap'
                }}
              >
                {recipe.name}
              </Typography>
              <RecipeFavoriteButton recipe={recipe} />
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              flexWrap: 'nowrap'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <IconButton
                    key={value}
                    onClick={() => handleRatingChange(value)}
                    sx={{ 
                      color: value <= (userRating || Math.floor(Number(recipe?.rating))) ? '#FFD700' : 'gray',
                      '&:hover': { color: '#FFD700' },
                      padding: '2px'
                    }}
                  >
                    <StarIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                ))}
              </Box>
              <Typography variant="h6" style={{ 
                color: theme.color, 
                fontWeight: 500,
                fontSize: '1rem',
                whiteSpace: 'nowrap'
              }}>
                {recipe.rating}/5.0
              </Typography>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <Grid container spacing={4}>
          {/* Left Column - Recipe Details */}
          <Grid item xs={12} md={8}>
            <Paper 
              elevation={0} 
              style={{ 
                background: theme.background,
                color: theme.color,
                border: `1px solid ${theme.headerColor}30`,
                borderRadius: '20px',
                padding: '30px',
                height: '100%'
              }}
            >
              {/* Recipe Image and Upload Section */}
              <Card sx={{ 
                width: '100%', 
                mb: 4,
                borderRadius: '15px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <CardMedia
                  component="img"
                  height="400"
                  image={`http://localhost:8000${recipe?.images?.[recipe.images.length - 1]}` || '/no-image.png'}
                  alt={recipe?.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Upload Recipe Image</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Button
                        variant="contained"
                        component="label"
                        startIcon={<CloudUploadIcon />}
                        disabled={uploading}
                        sx={{
                          backgroundColor: theme.headerColor,
                          '&:hover': { backgroundColor: theme.color }
                        }}
                      >
                        Select Image
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleImageUpload}
                        disabled={!selectedFile || uploading}
                        startIcon={<CloudUploadIcon />}
                        sx={{
                          backgroundColor: theme.headerColor,
                          '&:hover': { backgroundColor: theme.color }
                        }}
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    </Box>
                    {uploadError && (
                      <Typography color="error" variant="body2">
                        {uploadError}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Servings Slider */}
              <Box sx={{ 
                width: '100%', 
                mb: 4,
                p: 1.5,
                background: `${theme.headerColor}10`,
                borderRadius: '15px',
                border: `1px solid ${theme.headerColor}20`
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
                  Adjust Servings
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5,
                  width: '100%',
                  px: 0.5
                }}>
                  <Typography sx={{ minWidth: '16px', fontSize: '0.85rem' }}>1</Typography>
                  <Slider
                    value={servings}
                    onChange={(_, newValue) => setServings(newValue as number)}
                    min={1}
                    max={20}
                    step={1}
                    sx={{
                      flex: 1,
                      color: theme.headerColor,
                      '& .MuiSlider-thumb': {
                        backgroundColor: theme.color,
                        '&:hover': {
                          backgroundColor: theme.headerColor,
                        },
                      },
                    }}
                  />
                  <Typography sx={{ minWidth: '16px', fontSize: '0.85rem' }}>20</Typography>
                  <Typography variant="body2" sx={{ minWidth: '60px', fontWeight: 500 }}>
                    {servings} {servings === 1 ? 'serving' : 'servings'}
                  </Typography>
                </Box>
              </Box>

              {/* Recipe Details */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 3, 
                    background: `${theme.headerColor}10`,
                    borderRadius: '15px',
                    border: `1px solid ${theme.headerColor}20`,
                    height: '100%'
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Recipe Information</Typography>
                    <Stack spacing={2}>
                      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: 500 }}>Category:</span> {recipe?.category}
                      </Typography>
                      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: 500 }}>Prep Time:</span> {recipe?.prepTime}
                      </Typography>
                      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: 500 }}>Cook Time:</span> {recipe?.cookTime}
                      </Typography>
                      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: 500 }}>Servings:</span> {servings}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 3, 
                    background: `${theme.headerColor}10`,
                    borderRadius: '15px',
                    border: `1px solid ${theme.headerColor}20`,
                    height: '100%'
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>Nutrition Facts</Typography>
                    <Stack spacing={2}>
                      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: 500 }}>Calories:</span> {calculateAdjustedNutrition(recipe?.calories || 0, recipe?.servings || 1)}
                      </Typography>
                      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: 500 }}>Protein:</span> {calculateAdjustedNutrition(recipe?.protein || 0, recipe?.servings || 1)}g
                      </Typography>
                      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: 500 }}>Carbs:</span> {calculateAdjustedNutrition(recipe?.carbs || 0, recipe?.servings || 1)}g
                      </Typography>
                      <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: 500 }}>Fat:</span> {calculateAdjustedNutrition(recipe?.fat || 0, recipe?.servings || 1)}g
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              {/* Ingredients Section */}
              <Box sx={{ mt: 6 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Ingredients</Typography>
                <Grid container spacing={2}>
                  {recipe?.ingredients?.map((ingredient: string, index: number) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          background: `${theme.headerColor}10`,
                          borderRadius: '12px',
                          border: `1px solid ${theme.headerColor}20`,
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <Typography>{ingredient}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Share Buttons */}
              <Box sx={{ 
                mt: 4, 
                display: 'flex', 
                gap: 2, 
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <Button
                  variant="contained"
                  onClick={() => shareOnWhatsApp(`https://cookbook-alpha.vercel.app/recipe-details/${id}`)}
                  startIcon={<FaWhatsapp />}
                  sx={{ 
                    backgroundColor: '#25D366',
                    '&:hover': { backgroundColor: '#128C7E' },
                    borderRadius: '12px',
                    padding: '10px 20px'
                  }}
                >
                  Share on WhatsApp
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleShareClick(`https://cookbook-alpha.vercel.app/recipe-details/${id}`, 'slack')}
                  startIcon={<FaSlack />}
                  sx={{ 
                    backgroundColor: '#4A154B',
                    '&:hover': { backgroundColor: '#3C0E3D' },
                    borderRadius: '12px',
                    padding: '10px 20px'
                  }}
                >
                  Share on Slack
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleShareClick(`https://cookbook-alpha.vercel.app/recipe-details/${id}`, 'discord')}
                  startIcon={<FaDiscord />}
                  sx={{ 
                    backgroundColor: '#5865F2',
                    '&:hover': { backgroundColor: '#4752C4' },
                    borderRadius: '12px',
                    padding: '10px 20px'
                  }}
                >
                  Share on Discord
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Cooking Steps */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0}
              style={{ 
                background: theme.background,
                color: theme.color,
                border: `1px solid ${theme.headerColor}30`,
                borderRadius: '20px',
                padding: '30px',
                height: '100%'
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Cooking Instructions</Typography>
              
              {/* Voice Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>Select Voice:</Typography>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = availableVoices.find(v => v.name === e.target.value);
                    setSelectedVoice(voice || null);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.headerColor}30`,
                    background: 'transparent',
                    color: theme.color,
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name}
                    </option>
                  ))}
                </select>
              </Box>

              {/* Steps */}
              {recipe?.instructions?.map((step: string, index: number) => (
                <Box
                  key={index}
                  onClick={() => speakInstructions(step)}
                  sx={{
                    p: 3,
                    mb: 2,
                    background: `${theme.headerColor}10`,
                    borderRadius: '15px',
                    border: `1px solid ${theme.headerColor}20`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `${theme.headerColor}20`,
                      transform: 'translateX(5px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Step {index + 1}
                  </Typography>
                  <Typography>{step}</Typography>
                </Box>
              ))}

              {/* Interactive Cooking Button */}
              <Button
                variant="contained"
                onClick={startInteractiveCooking}
                fullWidth
                sx={{ 
                  mt: 3,
                  backgroundColor: theme.headerColor,
                  color: theme.color,
                  '&:hover': {
                    backgroundColor: theme.color,
                    color: theme.background
                  },
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 500
                }}
              >
                Start Interactive Cooking Mode
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* Start Cooking Button */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            onClick={startInteractiveCooking}
            sx={{ 
              backgroundColor: theme.headerColor,
              color: theme.color,
              padding: '12px 24px',
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: theme.color,
                color: theme.background
              },
              borderRadius: '12px',
              fontWeight: 500
            }}
          >
            Start Cooking
          </Button>
        </Box>

        {showInteractiveMode && (
          <InteractiveCookingMode
            recipe={recipe}
            onClose={() => setShowInteractiveMode(false)}
          />
        )}

        {/* Footer with Theme Selection */}
        <Box sx={{ 
          mt: 6, 
          py: 3, 
          borderTop: `1px solid ${theme.headerColor}20`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="body1" sx={{ color: theme.color }}>
            Select Theme:
          </Typography>
          <select
            value={themeName}
            onChange={(e) => {
              toggleTheme(e.target.value);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${theme.headerColor}30`,
              background: 'transparent',
              color: theme.color,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="cozyKitchen">Cozy Kitchen</option>
            <option value="stainlessStyle">Stainless Style</option>
            <option value="farmersMarket">Farmer's Market</option>
            <option value="literaryLemon">Literary Lemon</option>
            <option value="midnightChef">Midnight Chef</option>
            <option value="countryCharm">Country Charm</option>
            <option value="spiceSplash">Spice Splash</option>
            <option value="freshFocus">Fresh Focus</option>
          </select>
        </Box>
      </div>
    )
  } else {
    return <> Error! Recipe not found! </>
  }
}

const RecipeInformation = () => {
  
  return (
    <Provider store={store}>
      <RecipeInformationWrapped />
    </Provider>
  )
}

export default RecipeInformation
