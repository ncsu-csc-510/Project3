import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Select, 
  MenuItem, 
  FormControl,
  InputLabel
} from '@mui/material';
import { useTheme } from '../features/Themes/themeContext';

interface InteractiveCookingModeProps {
  recipe: any;
  onClose: () => void;
}

const InteractiveCookingMode: React.FC<InteractiveCookingModeProps> = ({ 
  recipe, 
  onClose
}) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const instructions = recipe.instructions;
  
  useEffect(() => {
    const loadVoices = () => {
      if (window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (voices.length > 0) {
          // Try to find a female English voice first (common preference for cooking instructions)
          const preferredVoice = voices.find(voice => 
            voice.name.includes('Samantha') || 
            (voice.lang.includes('en') && voice.name.includes('Female'))
          ) || voices[0];
          
          setSelectedVoice(preferredVoice);
        }
      }
    };
    
    loadVoices();
    
    if (typeof window.speechSynthesis !== "undefined") {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);
  
  const speakCurrentStep = () => {
    if (window.speechSynthesis && selectedVoice && !isSpeaking && instructions[currentStep]) {
      const utterance = new SpeechSynthesisUtterance(instructions[currentStep]);
      utterance.voice = selectedVoice;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onstart = () => setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };
  
  useEffect(() => {
    speakCurrentStep();
  }, [currentStep]);
  
  const handleNext = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleVoiceChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const voiceName = event.target.value as string;
    const voice = availableVoices.find(v => v.name === voiceName);
    setSelectedVoice(voice || null);
  };
  
  const handleStopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };
  
  const handleRepeat = () => {
    handleStopSpeaking();
    setTimeout(speakCurrentStep, 100);
  };
  
  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        style: {
          backgroundColor: theme.background,
          color: theme.color,
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.headerColor}` }}>
        <Typography variant="h5">
          Interactive Cooking Mode
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {recipe.name}
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            Follow along with these step-by-step instructions. The current step will be read aloud.
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2, mb: 3 }}>
            <InputLabel id="voice-selector-label" sx={{ color: theme.color }}>Voice</InputLabel>
            <Select
              labelId="voice-selector-label"
              value={selectedVoice?.name || ''}
              onChange={handleVoiceChange}
              label="Voice"
              sx={{ 
                color: theme.color,
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.headerColor,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.color,
                },
              }}
            >
              {availableVoices.map((voice) => (
                <MenuItem key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Box 
          sx={{ 
            p: 3, 
            borderRadius: 2, 
            border: `2px solid ${theme.headerColor}`,
            backgroundColor: theme.background,
            mb: 3,
            minHeight: '200px',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Step {currentStep + 1} of {instructions.length}
          </Typography>
          <Typography variant="body1">
            {instructions[currentStep]}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
            sx={{ 
              backgroundColor: theme.headerColor,
              color: theme.color,
              '&:hover': {
                backgroundColor: theme.color,
                color: theme.background,
              },
              '&.Mui-disabled': {
                backgroundColor: '#ccc',
                color: '#666',
              }
            }}
          >
            Previous Step
          </Button>
          
          <Button 
            variant="contained"
            onClick={handleRepeat}
            sx={{ 
              backgroundColor: theme.headerColor,
              color: theme.color,
              '&:hover': {
                backgroundColor: theme.color,
                color: theme.background,
              }
            }}
          >
            Repeat
          </Button>
          
          {isSpeaking ? (
            <Button 
              variant="contained"
              onClick={handleStopSpeaking}
              sx={{ 
                backgroundColor: '#f44336',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#d32f2f',
                }
              }}
            >
              Stop Speaking
            </Button>
          ) : (
            <Button 
              variant="contained"
              onClick={speakCurrentStep}
              sx={{ 
                backgroundColor: '#4CAF50',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#388E3C',
                }
              }}
            >
              Speak
            </Button>
          )}
          
          <Button 
            variant="contained"
            onClick={handleNext}
            disabled={currentStep === instructions.length - 1}
            sx={{ 
              backgroundColor: theme.headerColor,
              color: theme.color,
              '&:hover': {
                backgroundColor: theme.color,
                color: theme.background,
              },
              '&.Mui-disabled': {
                backgroundColor: '#ccc',
                color: '#666',
              }
            }}
          >
            Next Step
          </Button>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ borderTop: `1px solid ${theme.headerColor}`, p: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            color: theme.color,
            borderColor: theme.headerColor,
            '&:hover': {
              borderColor: theme.color,
              backgroundColor: 'rgba(255,255,255,0.1)',
            }
          }}
          variant="outlined"
        >
          Exit Cooking Mode
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InteractiveCookingMode; 