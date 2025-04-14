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
  Slider
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
  const { theme } = useTheme();
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
        
        <div className="recipe-header">
          <Typography 
            variant="h3" 
            component="h1" 
            style={{
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.color}, ${theme.headerColor})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '10px'
            }}
          >
            {recipe.name}
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <StarIcon sx={{ color: '#FFD700' }} />
            <Typography variant="h6" style={{ color: theme.color }}>
              {recipe.rating}/5.0
            </Typography>
          </div>
        </div>
        
        <div style={{ 
          marginBottom: '30px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <select
            style={{
              backgroundColor: 'transparent',
              color: theme.color,
              border: `2px solid ${theme.headerColor}`,
              borderRadius: '8px',
              padding: '12px 20px',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              outline: 'none'
            }}
            onChange={(e) => setSelectedDayIndex(Number(e.target.value))}
            value={selectedDayIndex}
          >
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
              <option 
                key={index} 
                value={index} 
                style={{
                  backgroundColor: theme.background,
                  color: theme.color,
                  fontSize: '16px',
                  padding: '8px'
                }}
              >
                {day}
              </option>
            ))}
          </select>
          
          <Button
            variant="contained"
            style={{
              backgroundColor: theme.headerColor,
              color: theme.color,
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.background;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.headerColor;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => handleAddToMealPlan(recipe, selectedDayIndex)}
          >
            Add to Meal Plan
          </Button>
          
          <Button
            variant="outlined"
            style={{
              borderColor: theme.headerColor,
              color: theme.headerColor,
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              transition: 'all 0.3s ease',
              textTransform: 'none',
              borderWidth: '2px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.color;
              e.currentTarget.style.borderColor = theme.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.headerColor;
              e.currentTarget.style.borderColor = theme.headerColor;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => navigate('/meal')}
          >
            View Meal Plan
          </Button>
        </div>

        <div className="recipe-container">
          <div className="recipe-summary-column">
            <Paper 
              elevation={0} 
              className="summary-paper" 
              style={{ 
                background: theme.background,
                color: theme.color,
                border: `1px solid ${theme.headerColor}30`
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <div style={{ 
                    marginBottom: '30px',
                    padding: '20px',
                    background: `${theme.headerColor}10`,
                    borderRadius: '12px'
                  }}>
                    <Typography variant="h6" gutterBottom style={{ marginBottom: '15px' }}>
                      Servings: {servings}
                    </Typography>
                    <Slider
                      value={servings}
                      min={1}
                      max={10}
                      step={1}
                      onChange={(_, value) => setServings(value as number)}
                      sx={{
                        color: theme.headerColor,
                        '& .MuiSlider-thumb': {
                          width: 20,
                          height: 20,
                          backgroundColor: theme.headerColor,
                          '&:hover, &.Mui-focusVisible': {
                            boxShadow: `0 0 0 8px ${theme.headerColor}20`
                          }
                        },
                        '& .MuiSlider-rail': {
                          opacity: 0.3
                        }
                      }}
                    />
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    padding: '15px',
                    background: `${theme.headerColor}10`,
                    borderRadius: '12px'
                  }}>
                    <Typography variant="h5">
                      Recipe Details
                    </Typography>
                    <RecipeFavoriteButton recipe={recipe} />
                  </div>
                </Grid>
                <Grid item xs={12} textAlign={'left'} style={{ background: theme.background, color: theme.color }}>
                  <div style={{ 
                    padding: '20px',
                    background: `${theme.headerColor}10`,
                    borderRadius: '12px',
                    marginBottom: '20px'
                  }}>
                    <Typography 
                      variant="h6" 
                      style={{
                        marginBottom: '15px',
                        borderBottom: `2px solid ${theme.headerColor}30`,
                        paddingBottom: '10px'
                      }}
                    >
                      Ingredients
                    </Typography>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '12px'
                    }}>
                      {recipe?.ingredients?.map((ele: string, idx: number) => {
                        const match = ele.match(/^([\d/.]+)\s+(.*)/);
                        let updatedIngredient = ele;

                        if (match) {
                          const quantityStr = match[1];
                          const rest = match[2];
                          let quantity: number;

                          try {
                            if (quantityStr.includes('/')) {
                              const parts = quantityStr.split('/');
                              quantity = parseFloat(parts[0]) / parseFloat(parts[1]);
                            } else {
                              quantity = parseFloat(quantityStr);
                            }

                            const newQuantity = (quantity * servings).toFixed(2);
                            updatedIngredient = `${newQuantity} ${rest}`;
                          } catch (e) {
                            updatedIngredient = ele;
                          }
                        }

                        return (
                          <div
                            key={idx}
                            style={{
                              padding: '10px 15px',
                              background: theme.background,
                              border: `1px solid ${theme.headerColor}30`,
                              borderRadius: '8px',
                              fontSize: '0.95rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <span style={{ 
                              width: '6px', 
                              height: '6px', 
                              borderRadius: '50%', 
                              background: theme.headerColor,
                              flexShrink: 0
                            }} />
                            {updatedIngredient}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Grid>
                
                <Grid item xs={6}>
                  <Stack direction="column" spacing={2} paddingBottom="20px" textAlign={'left'}>
                    <Typography variant="h6">
                      Rating:
                      <Typography variant="subtitle1" gutterBottom>
                        {Array.from({ length: Math.floor(Number(recipe?.rating)) }).map((_, idx) => (
                          <StarIcon key={idx} fontSize="small" />
                        ))}
                      </Typography>
                    </Typography>
                    <Typography variant="h6">
                      Prep Time:
                      <Typography variant="subtitle1" gutterBottom>
                        {recipe?.prepTime}
                      </Typography>
                    </Typography>
                    <Typography variant="h6">
                      Sugar:
                      <Typography variant="subtitle1" gutterBottom>
                        {(recipe?.sugar * servings).toFixed(2)}g
                      </Typography>
                    </Typography>
                    <Typography variant="h6">
                      Carbs:
                      <Typography variant="subtitle1" gutterBottom>
                        {(recipe?.carbs * servings).toFixed(2)}g
                      </Typography>
                    </Typography>
                    <Typography variant="h6">
                      Proteins:
                      <Typography variant="subtitle1" gutterBottom>
                        {(recipe?.protein * servings).toFixed(2)}g
                      </Typography>
                    </Typography>
                  </Stack>
                </Grid>
                
                <Grid item xs={6}>
                  <Stack direction="column" spacing={2} paddingBottom="20px" textAlign={'left'}>
                    <Typography variant="h6">
                      Cuisine:
                      <Typography variant="subtitle1" gutterBottom>
                        {recipe?.category}
                      </Typography>
                    </Typography>
                    <Typography variant="h6">
                      Servings:
                      <Typography variant="subtitle1" gutterBottom>
                        {recipe?.servings}
                      </Typography>
                    </Typography>
                    <Typography variant="h6">
                      Cook Time:
                      <Typography variant="subtitle1" gutterBottom>
                        {recipe?.cookTime}
                      </Typography>
                    </Typography>
                    <Typography variant="h6">
                      Cholesterol:
                      <Typography variant="subtitle1" gutterBottom>
                        {recipe?.cholesterol}mg/dl
                      </Typography>
                    </Typography>
                    <Typography variant="h6">
                      Fats:
                      <Typography variant="subtitle1" gutterBottom>
                        {recipe?.fat}g
                      </Typography>
                    </Typography>
                  </Stack>
                </Grid>
                
                <Grid item xs={12}>
                  <div className="sharing-buttons">
                    <button
                      onClick={() => shareOnWhatsApp(window.location.href)}
                      style={{
                        backgroundColor: '#25D366',
                        color: 'white',
                        padding: '10px 15px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <FaWhatsapp style={{ marginRight: '5px', fontSize: '1.2em' }} />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => handleShareClick(window.location.href, 'slack')}
                      style={{
                        backgroundColor: '#7C3085',
                        color: 'white',
                        padding: '10px 15px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <FaSlack style={{ marginRight: '5px', fontSize: '1.2em' }} />
                      Slack
                    </button>
                    <button
                      onClick={() => handleShareClick(window.location.href, 'discord')}
                      style={{
                        backgroundColor: '#5865F2',
                        color: 'white',
                        padding: '10px 15px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      <FaDiscord style={{ marginRight: '5px', fontSize: '1.2em' }} />
                      Discord
                    </button>
                  </div>
                </Grid>
              </Grid>
            </Paper>
          </div>
          
          {/* Steps Column */}
          <div className="recipe-steps-column">
            <Paper 
              elevation={0} 
              style={{ 
                background: theme.background,
                color: theme.color,
                border: `1px solid ${theme.headerColor}30`,
                borderRadius: '15px',
                padding: '25px'
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom 
                style={{
                  marginBottom: '25px',
                  borderBottom: `2px solid ${theme.headerColor}30`,
                  paddingBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                Cooking Instructions
                <Button
                  variant="contained"
                  onClick={startInteractiveCooking}
                  style={{
                    backgroundColor: theme.headerColor,
                    color: theme.color,
                    textTransform: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Start Cooking
                </Button>
              </Typography>

              <div style={{ marginBottom: '20px' }}>
                <div className="voice-selector-container">
                  <Typography variant="body1" style={{ marginRight: '15px' }}>
                    Select Voice:
                  </Typography>
                  <select
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const voice = availableVoices.find(v => v.name === e.target.value);
                      setSelectedVoice(voice || null);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.headerColor}30`,
                      background: 'transparent',
                      color: theme.color,
                      fontSize: '0.9rem'
                    }}
                  >
                    {availableVoices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {recipe?.instructions?.map((step: string, index: number) => (
                <div
                  key={index}
                  className="step"
                  onClick={() => speakInstructions(step)}
                  style={{
                    position: 'relative',
                    padding: '20px 25px',
                    background: `${theme.headerColor}10`,
                    borderRadius: '12px',
                    marginBottom: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: `1px solid ${theme.headerColor}20`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(10px)';
                    e.currentTarget.style.background = `${theme.headerColor}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.background = `${theme.headerColor}10`;
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    left: '-10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '24px',
                    height: '24px',
                    background: theme.headerColor,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.background,
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>
                  <Typography style={{ paddingLeft: '20px' }}>
                    {step}
                  </Typography>
                </div>
              ))}
            </Paper>
          </div>
          
          {/* Images Column */}
          <div className="recipe-images-column">
            <Paper 
              elevation={0} 
              style={{ 
                background: theme.background,
                color: theme.color,
                border: `1px solid ${theme.headerColor}30`,
                borderRadius: '15px',
                padding: '25px',
                height: '100%'
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom 
                style={{
                  marginBottom: '25px',
                  borderBottom: `2px solid ${theme.headerColor}30`,
                  paddingBottom: '15px'
                }}
              >
                Recipe Gallery
              </Typography>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '20px',
                maxHeight: 'calc(100vh - 250px)',
                overflowY: 'auto',
                padding: '5px',
                scrollbarWidth: 'thin',
                scrollbarColor: `${theme.headerColor}30 transparent`
              }}>
                {recipe?.images?.length > 0 ? (
                  recipe.images.map((image: string, index: number) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      <img
                        src={image || noImage}
                        alt={`Recipe step ${index + 1}`}
                        className="recipe-image"
                        style={{
                          width: '100%',
                          height: '250px',
                          objectFit: 'cover',
                          margin: 0
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '15px',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                        color: '#fff'
                      }}>
                        <Typography variant="subtitle1">
                          Step {index + 1}
                        </Typography>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    padding: '30px',
                    textAlign: 'center',
                    background: `${theme.headerColor}10`,
                    borderRadius: '12px',
                    border: `1px dashed ${theme.headerColor}30`
                  }}>
                    <Typography variant="body1" style={{ opacity: 0.7 }}>
                      No images available for this recipe
                    </Typography>
                  </div>
                )}
              </div>

              <div style={{
                marginTop: '25px',
                padding: '20px',
                background: `${theme.headerColor}10`,
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <Typography variant="h6" gutterBottom>
                  Share Recipe
                </Typography>
                <div className="sharing-buttons">
                  <IconButton
                    onClick={() => shareOnWhatsApp(`https://cookbook-alpha.vercel.app/recipe-details/${id}`)}
                    style={{
                      background: theme.background,
                      border: `1px solid ${theme.headerColor}30`,
                      padding: '12px'
                    }}
                  >
                    <FaWhatsapp size={20} color={theme.headerColor} />
                  </IconButton>
                  <IconButton
                    onClick={() => shareOnPlatform(`https://cookbook-alpha.vercel.app/recipe-details/${id}`, 'slack')}
                    style={{
                      background: theme.background,
                      border: `1px solid ${theme.headerColor}30`,
                      padding: '12px'
                    }}
                  >
                    <FaSlack size={20} color={theme.headerColor} />
                  </IconButton>
                  <IconButton
                    onClick={() => shareOnPlatform(`https://cookbook-alpha.vercel.app/recipe-details/${id}`, 'discord')}
                    style={{
                      background: theme.background,
                      border: `1px solid ${theme.headerColor}30`,
                      padding: '12px'
                    }}
                  >
                    <FaDiscord size={20} color={theme.headerColor} />
                  </IconButton>
                </div>
              </div>
            </Paper>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '30px' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => startInteractiveCooking()}
            sx={{ 
              backgroundColor: theme.headerColor,
              color: theme.color,
              padding: '10px 20px',
              '&:hover': {
                backgroundColor: theme.color,
                color: theme.background,
              }
            }}
          >
            Start Interactive Cooking Mode
          </Button>
        </div>

        {showInteractiveMode && (
          <InteractiveCookingMode
            recipe={recipe}
            onClose={() => setShowInteractiveMode(false)}
          />
        )}
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
