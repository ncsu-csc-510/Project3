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
    dispatch(getRecipeInfoInitiator('http://localhost:8000/recipe/' + id))
  }, [dispatch, id])

  if (recipeInfo.isGetRecipeInfoLoading) {
    return <div data-testid="loading-spinner"> Loading ... </div>
  }  else if (recipeInfo.isGetRecipeInfoError) {
    return <div data-testid="error-message">Failed to load recipe data</div>;
  } else if (recipeInfo.isGetRecipeInfoSuccess) {
    const recipe = recipeInfo.getRecipeInfoData // The recipe object containing all necessary information

    const handleAddToMealPlan = async (recipee: any, dayIndex: number) => {
      try {
        const responsee = await axios.post("http://localhost:8000/recipe/meal-plan/", {
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
        style={{ width: '100%', color: theme.color, paddingTop: '20px', background: theme.background }}
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
        <Typography variant="h4" gutterBottom className="recipe-header">
          {recipe.name}
        </Typography>
        
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <select
            style={{
              backgroundColor: theme.headerColor,
              color: theme.color,
              border: `1px solid ${theme.headerColor}`,
              borderRadius: '4px',
              padding: '8px 12px',
              marginRight: '10px',
              fontSize: '16px',
              transition: 'transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
              cursor: 'pointer',
            }}
            onChange={(e) => setSelectedDayIndex(Number(e.target.value))}
            value={selectedDayIndex}
          >
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
              <option key={index} value={index} style={{
                backgroundColor: theme.background,
                color: theme.color,
                fontSize: '16px',
              }}>
                {day}
              </option>
            ))}
          </select>
          <Button
            variant="contained"
            style={{
              backgroundColor: theme.headerColor,
              color: theme.color,
              marginRight: '10px',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = theme.background)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = theme.headerColor)
            }
            onClick={() => handleAddToMealPlan(recipe, selectedDayIndex)}
          >
            Add to Meal Plan
          </Button>
          <Button
            variant="outlined"
            style={{
              borderColor: theme.headerColor,
              color: theme.headerColor,
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.color;
              e.currentTarget.style.borderColor = theme.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.headerColor;
              e.currentTarget.style.borderColor = theme.headerColor;
            }}
            onClick={() => navigate('/meal')}
          >
            Go to Meal Plan
          </Button>
        </div>

        <div className="recipe-container">
          {/* Summary Column */}
          <div className="recipe-summary-column">
            <Paper elevation={24} className="summary-paper" style={{ background: theme.background, color: theme.color }}>
              <Grid container spacing={3}>
                <Grid item xs={12} style={{ textAlign: 'center' }}>
                  <Typography variant="h5" gutterBottom style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    Summary
                    <RecipeFavoriteButton recipe={recipe} />
                  </Typography>
                </Grid>
                
                <Grid item xs={12} textAlign={'left'}>
                  <Typography variant="h6">
                    Ingredients:
                    <Typography variant="subtitle1" gutterBottom>
                      {recipe?.ingredients?.map((ele: any, idx: number) => (
                        <React.Fragment key={idx}>
                          {ele}
                          {recipe?.ingredients?.length - 1 === idx ? `` : `, `}
                        </React.Fragment>
                      ))}
                    </Typography>
                  </Typography>
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
                        {recipe?.sugar}g
                      </Typography>
                    </Typography>
                    <Typography variant="h6">
                      Carbs:
                      <Typography variant="subtitle1" gutterBottom>
                        {recipe?.carbs}g
                      </Typography>
                    </Typography>
                    <Typography variant="h6">
                      Proteins:
                      <Typography variant="subtitle1" gutterBottom>
                        {recipe?.protein}g
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
            <div className="helper-text" style={{ color: theme.color }}>
              Tap on any step below to hear the instructions read aloud. Follow along with the recipe as you cook, and feel free to pause or repeat any step!
            </div>
            
            <div className="voice-selector-container">
              <label htmlFor="voiceSelector" style={{ marginRight: '10px', color: theme.color }}>
                Select Voice:
              </label>
              <select
                id="voiceSelector"
                style={{ 
                  backgroundColor: theme.headerColor, 
                  color: theme.color, 
                  borderColor: theme.color,
                  padding: '8px 15px',
                  borderRadius: '5px',
                  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                }}
                onChange={(e) => {
                  const selected = availableVoices.find((voice) => voice.name === e.target.value);
                  setSelectedVoice(selected || null);
                }}
                value={selectedVoice?.name || ''}
              >
                {availableVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
            
            {Array.isArray(recipe?.instructions) && recipe.instructions.map((inst: string, idx: number) => (
              <div
                key={idx}
                className="step"
                style={{
                  backgroundColor: theme.background,
                  color: theme.color,
                  borderColor: theme.headerColor,
                  borderWidth: '2px',
                  borderStyle: 'solid',
                }}
                onClick={() => speakInstructions(inst)}
              >
                <Typography variant="h6">
                  Step {idx + 1}:
                  <Typography variant="subtitle1" gutterBottom>
                    {inst}
                  </Typography>
                </Typography>
              </div>
            ))}
          </div>
          
          {/* Images Column */}
          <div className="recipe-images-column" style={{ backgroundColor: theme.headerColor }}>
            <div style={{ padding: '20px' }}>
              {recipe?.images?.length > 0 && recipe?.images[0] !== '' ? (
                <Stack direction="column" spacing={2}>
                  {recipe.images
                    .reverse()
                    .slice(0, 3)
                    .map((imageLink: string, idx: number) => {
                      imageLink = imageLink.replaceAll('"', '');
                      return (
                        <img
                          key={idx}
                          src={imageLink}
                          alt={`Recipe image ${idx + 1}`}
                          className="recipe-image"
                        />
                      );
                    })}
                </Stack>
              ) : (
                <img src={noImage} alt="No image available" className="recipe-image" />
              )}
            </div>
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
