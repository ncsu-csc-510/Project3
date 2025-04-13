import React, { useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Divider,
  useTheme as useMuiTheme,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import './HomePage.css'
import { useTheme } from '../../Themes/themeContext'

const FAQPage = () => {
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqItems = [
    {
      question: "What is CookBook?",
      answer: "CookBook is a platform designed to suggest recipes based on the ingredients you already have at home. It not only provides recipe suggestions but also gives detailed instructions, ratings, nutritional information, and more. It aims to help users cook efficiently with the ingredients available to them."
    },
    {
      question: "How do I use CookBook?",
      answer: "Using CookBook is easy. Simply enter the ingredients you have in the search bar, and CookBook will suggest a list of recipes that can be made with those ingredients. You can then follow the step-by-step instructions to make the recipe at home."
    },
    {
      question: "How can I share a recipe?",
      answer: "Once you've selected a recipe, you can share it with others via WhatsApp, Discord, or Slack. Simply click on the respective button to share the recipe URL."
    },
    {
      question: "What types of recipes can I find on CookBook?",
      answer: "CookBook offers a wide variety of recipes from multiple cuisines and cultures. Whether you're in the mood for Italian pasta, Indian curry, or a quick snack, CookBook has got you covered."
    },
    {
      question: "Can I add my own recipes to CookBook?",
      answer: "Currently, users cannot upload their own recipes to the platform. This feature will be available in future updates."
    },
    {
      question: "Is CookBook available on mobile devices?",
      answer: "Yes, CookBook is fully responsive and can be used on any mobile device or tablet. Simply visit our website from your mobile browser, and you can enjoy all the features on-the-go."
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          backgroundColor: theme.background, 
          color: theme.color,
          borderRadius: 2
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            textAlign: 'center',
            mb: 4,
            fontWeight: 'bold',
            color: theme.headerColor
          }}
        >
          Frequently Asked Questions
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="body1" 
            paragraph 
            sx={{ 
              textAlign: 'center',
              color: theme.color,
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          >
            Find answers to common questions about CookBook and how to make the most of our platform.
          </Typography>
        </Box>

        <Divider sx={{ my: 3, borderColor: theme.headerColor }} />

        {faqItems.map((item, index) => (
          <Accordion
            key={index}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
            sx={{
              backgroundColor: theme.background,
              color: theme.color,
              mb: 2,
              '&:before': {
                display: 'none',
              },
              border: `1px solid ${theme.headerColor}`,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: theme.headerColor,
                '& .MuiAccordionSummary-root': {
                  color: theme.background,
                },
                '& .MuiSvgIcon-root': {
                  color: theme.background,
                }
              },
              transition: 'all 0.3s ease'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: theme.color }} />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  my: 2
                }
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: theme.color,
                  fontSize: '1.1rem'
                }}
              >
                {item.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                sx={{
                  color: theme.color,
                  fontSize: '1rem',
                  lineHeight: 1.6
                }}
              >
                {item.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Container>
  );
}

export default FAQPage;
