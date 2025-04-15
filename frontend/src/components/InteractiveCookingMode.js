import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, CircularProgress, Paper } from '@mui/material';
import { Timer, NavigateNext, NavigateBefore } from '@mui/icons-material';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const InteractiveCookingMode = ({ recipe, onClose }) => {
  console.log('InteractiveCookingMode rendered with recipe:', recipe); // Enhanced debug log

  const [currentStep, setCurrentStep] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [autoMode, setAutoMode] = useState(true); // Auto mode is enabled by default
  const [error, setError] = useState(null); // Add error state
  const timerRef = useRef(null);
  const speechSynthesis = window?.speechSynthesis;
  
  const commands = [
    {
      command: 'next step',
      callback: () => {
        if (currentStep < steps.length - 1) {
          handleNextStep();
        }
      }
    },
    {
      command: 'previous step',
      callback: () => {
        if (currentStep > 0) {
          handlePreviousStep();
        }
      }
    },
    {
      command: 'stop cooking',
      callback: () => {
        onClose();
      }
    },
    {
      command: 'pause',
      callback: () => {
        setAutoMode(false);
        stopTimer();
        if (speechSynthesis) {
          speechSynthesis.pause();
        }
      }
    },
    {
      command: 'resume',
      callback: () => {
        setAutoMode(true);
        if (steps[currentStep]?.duration_seconds && timeLeft > 0) {
          startTimer(timeLeft);
        }
        if (speechSynthesis) {
          speechSynthesis.resume();
        }
      }
    }
  ];
  
  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands });

  // Convert recipe instructions into steps with default duration if not provided
  const steps = recipe?.instructions?.map((instruction, index) => ({
    step_number: index + 1,
    description: instruction,
    // If no duration is specified, default to 60 seconds per step
    duration_seconds: 60
  })) || [];

  console.log('Converted steps:', steps); // Debug log

  const speak = (text) => {
    try {
      if (!speechSynthesis) {
        console.warn('Speech synthesis not supported in this browser');
        return;
      }

      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      
      // When speech ends in auto mode, move to next step after a brief pause
      if (autoMode) {
        utterance.onend = () => {
          // If no timer for this step, wait 2 seconds and move to next step
          if (!steps[currentStep]?.duration_seconds) {
            setTimeout(() => {
              if (currentStep < steps.length - 1) {
                handleNextStep();
              }
            }, 2000);
          }
          // If there's a timer, it will handle moving to the next step
        };
      }
      
      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Error in speak function:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    try {
      // Start cooking immediately when component mounts
      if (steps.length > 0) {
        console.log('Starting cooking mode with first step');
        speakCurrentStep();
        // If the step has a duration, start the timer
        if (steps[0]?.duration_seconds) {
          startTimer(steps[0].duration_seconds);
        }
      } else {
        console.error('No steps available:', steps);
        setError('No recipe steps found. Please try another recipe.');
      }
      
      // Start voice recognition for commands if supported
      if (browserSupportsSpeechRecognition) {
        try {
          SpeechRecognition.startListening({ continuous: true });
          console.log('Speech recognition started');
        } catch (err) {
          console.error('Failed to start speech recognition:', err);
        }
      } else {
        console.warn('Speech recognition not supported in this browser');
      }
      
      // Cleanup
      return () => {
        if (browserSupportsSpeechRecognition) {
          try {
            SpeechRecognition.stopListening();
          } catch (err) {
            console.error('Error stopping speech recognition:', err);
          }
        }
        if (speechSynthesis) {
          speechSynthesis.cancel();
        }
        clearInterval(timerRef.current);
      };
    } catch (err) {
      console.error('Error in initial useEffect:', err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    try {
      // When current step changes, speak the new step and start its timer
      if (currentStep > 0) { // Skip for initial mount as it's handled in the first useEffect
        console.log('Changing to step:', currentStep);
        speakCurrentStep();
        if (steps[currentStep]?.duration_seconds) {
          startTimer(steps[currentStep].duration_seconds);
        }
      }
    } catch (err) {
      console.error('Error in currentStep useEffect:', err);
      setError(err.message);
    }
  }, [currentStep]);

  useEffect(() => {
    try {
      if (timerActive && timeLeft > 0) {
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => prev - 1);
        }, 1000);
      } else if (timeLeft === 0 && timerActive) {
        stopTimer();
        // Automatically move to next step when timer ends (if in auto mode)
        if (autoMode && currentStep < steps.length - 1) {
          handleNextStep();
        } else if (currentStep === steps.length - 1) {
          // Last step completed
          speak("Cooking complete! Enjoy your meal.");
        }
      }
      return () => clearInterval(timerRef.current);
    } catch (err) {
      console.error('Error in timer useEffect:', err);
      setError(err.message);
    }
  }, [timerActive, timeLeft, autoMode]);

  const startTimer = (duration) => {
    clearInterval(timerRef.current);
    setTimeLeft(duration);
    setTimerActive(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
    clearInterval(timerRef.current);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const speakCurrentStep = () => {
    try {
      const step = steps[currentStep];
      if (!step) {
        console.error('No step found at index:', currentStep);
        return;
      }
      
      let text = `Step ${step.step_number}. ${step.description}`;
      if (step.duration_seconds) {
        const minutes = Math.floor(step.duration_seconds / 60);
        const seconds = step.duration_seconds % 60;
        text += ` This step will take ${minutes} minutes and ${seconds} seconds.`;
      }
      speak(text);
    } catch (err) {
      console.error('Error in speakCurrentStep:', err);
      setError(err.message);
    }
  };

  const handleNextStep = () => {
    stopTimer(); // Stop the current timer before moving
    setCurrentStep(prev => prev + 1);
    // The useEffect will handle speaking and timer
  };

  const handlePreviousStep = () => {
    stopTimer(); // Stop the current timer before moving
    setCurrentStep(prev => prev - 1);
    // The useEffect will handle speaking and timer
  };

  // Show error if no valid steps or if an error occurred
  if (error || !recipe || !recipe.instructions || steps.length === 0) {
    console.error('Error or invalid recipe data:', error, recipe);
    return (
      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4, position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, backgroundColor: 'white' }}>
        <Typography variant="h6" color="error">
          {error || "Error: Invalid recipe data"}
        </Typography>
        <Button onClick={onClose} variant="contained" sx={{ mt: 2 }}>
          Close
        </Button>
      </Paper>
    );
  }

  console.log('Rendering step:', currentStep, 'of', steps.length);
  
  // Make sure we have steps before trying to render
  if (!steps[currentStep]) {
    return (
      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4, position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, backgroundColor: 'white' }}>
        <Typography variant="h6" color="error">
          Error: Could not find step {currentStep}
        </Typography>
        <Button onClick={onClose} variant="contained" sx={{ mt: 2 }}>
          Close
        </Button>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ 
      p: 3, 
      maxWidth: 600, 
      mx: 'auto', 
      mt: 4, 
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)', 
      zIndex: 9999, 
      backgroundColor: 'white',
      border: '2px solid #1976d2',
      boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.3)'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Interactive Cooking Mode</Typography>
        <Button onClick={onClose} variant="contained" color="error">Close</Button>
      </Box>

      <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="h6">Step {steps[currentStep].step_number} of {steps.length}</Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>{steps[currentStep].description}</Typography>
      </Box>

      <Box sx={{ mb: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
        <Typography variant="h6">Timer</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
          <Timer color="primary" />
          <Typography variant="h4">{formatTime(timeLeft)}</Typography>
        </Box>
      </Box>

      {/* Navigation buttons for manual control */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button 
          variant="contained" 
          onClick={handlePreviousStep}
          disabled={currentStep === 0}
          startIcon={<NavigateBefore />}
          sx={{ width: '48%' }}
        >
          Previous Step
        </Button>
        <Button 
          variant="contained" 
          onClick={handleNextStep}
          disabled={currentStep === steps.length - 1}
          endIcon={<NavigateNext />}
          sx={{ width: '48%' }}
        >
          Next Step
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button 
          variant={autoMode ? "contained" : "outlined"} 
          onClick={() => setAutoMode(true)}
          disabled={autoMode}
          sx={{ width: '48%' }}
        >
          Auto Mode
        </Button>
        <Button 
          variant={!autoMode ? "contained" : "outlined"} 
          onClick={() => setAutoMode(false)}
          disabled={!autoMode}
          sx={{ width: '48%' }}
        >
          Manual Mode
        </Button>
      </Box>

      {/* Only show speech recognition UI if supported */}
      {browserSupportsSpeechRecognition && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="h6">Voice Commands</Typography>
          <Typography variant="body2" color="text.secondary">
            Available commands: "next step", "previous step", "pause", "resume", "stop cooking"
          </Typography>
          {listening ? (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography variant="body2">Listening for commands...</Typography>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                try {
                  SpeechRecognition.startListening({ continuous: true });
                } catch (err) {
                  console.error('Error starting speech recognition:', err);
                }
              }}
              sx={{ mt: 1 }}
            >
              Start Listening
            </Button>
          )}
          {transcript && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              You said: {transcript}
            </Typography>
          )}
        </Box>
      )}

      {/* Show a message if speech recognition is not supported */}
      {!browserSupportsSpeechRecognition && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ffcc80' }}>
          <Typography variant="body2" color="warning.main">
            Voice commands are not supported in this browser. You can use the buttons to navigate.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default InteractiveCookingMode;