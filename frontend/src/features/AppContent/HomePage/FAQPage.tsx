import React from 'react'
import {
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import './HomePage.css'
import { useTheme } from '../../Themes/themeContext'

const FAQPage = () => {
  const { theme } = useTheme();

  return (
    <div className="faq" style={{ backgroundColor: theme.background, color: theme.color }}>
      <h2 className="faq-title" style={{ color: theme.headerColor }}>Frequently Asked Questions</h2>
      <Paper
        elevation={5}
        sx={{
          marginRight: '5%',
          marginLeft: '5%',
          bgcolor: theme.headerColor, // Apply background from theme
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: 'auto',
          padding: '2rem',
          color: theme.color
        }}
      >
        {/* FAQ entries */}
        <div className="faq-entry" >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontFamily: 'RobotoThin',
              fontWeight: 600,
              fontSize: '20px',
             color: theme.color,
            }}
          >
            1. What is CookBook?
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{
              fontFamily: 'RobotoThin',
              fontSize: '20px',
              color: theme.color, // Apply general text color
            }}
          >
            CookBook is a platform designed to suggest recipes based on the
            ingredients you already have at home. It not only provides recipe
            suggestions but also gives detailed instructions, ratings,
            nutritional information, and more. It aims to help users cook
            efficiently with the ingredients available to them.
          </Typography>
        </div>

        <div className="faq-entry">
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontFamily: 'RobotoThin',
              fontWeight: 600,
              fontSize: '20px',
              color: theme.headerColor, // Apply headerColor for headers
            }}
          >
            2. How do I use CookBook?
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            paragraph
            sx={{
              fontFamily: 'RobotoThin',
              fontSize: '20px',
              color: theme.color, // Apply general text color
            }}
          >
            Using CookBook is easy. Simply enter the ingredients you have in the
            search bar, and CookBook will suggest a list of recipes that can be
            made with those ingredients. You can then follow the step-by-step
            instructions to make the recipe at home.
          </Typography>
        </div>

        <div className="faq-entry">
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontFamily: 'RobotoThin',
              fontWeight: 600,
              fontSize: '20px',
              color: theme.headerColor, // Apply headerColor for headers
            }}
          >
            3. How can I share a recipe?
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            paragraph
            sx={{
              fontFamily: 'RobotoThin',
              fontSize: '20px',
              color: theme.color, // Apply general text color
            }}
          >
            Once you’ve selected a recipe, you can share it with others via
            WhatsApp, Discord, or Slack. Simply click on the respective button
            to share the recipe URL.
          </Typography>
        </div>

        <div className="faq-entry">
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontFamily: 'RobotoThin',
              fontWeight: 600,
              fontSize: '20px',
              color: theme.headerColor, // Apply headerColor for headers
            }}
          >
            4. What types of recipes can I find on CookBook?
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            paragraph
            sx={{
              fontFamily: 'RobotoThin',
              fontSize: '20px',
              color: theme.color, // Apply general text color
            }}
          >
            CookBook offers a wide variety of recipes from multiple cuisines and
            cultures. Whether you're in the mood for Italian pasta, Indian
            curry, or a quick snack, CookBook has got you covered.
          </Typography>
        </div>

        {/* Collapsible FAQ entries */}
        <Accordion
          sx={{
            backgroundColor: theme.headerColor, // Apply background color from theme
            color: theme.color, // Apply text color from theme
            width: '100%',
            borderColor: theme.color,
                  borderWidth: '2px', // Set the desired border thickness
                  borderStyle: 'solid', 
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: theme.color, borderColor: theme.color,
              borderWidth: '2px', // Set the desired border thickness
              borderStyle: 'solid', }} />} // Apply icon color from theme
            id="faq1"
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'RobotoThin',
                fontSize: '20px',
                fontWeight: 600,
                color: theme.headerColor, // Apply headerColor for headers
                
              }}
            >
              5. Can I add my own recipes to CookBook?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{
                fontFamily: 'RobotoThin',
                fontSize: '20px',
                color: theme.color, // Apply general text color
                
              }}
            >
              Currently, users cannot upload their own recipes to the platform.
              future updates.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion
          sx={{
            backgroundColor: theme.headerColor, // Apply background color from theme
            color: theme.color, // Apply text color from theme
            width: '100%',
            borderColor: theme.color,
            borderWidth: '2px', // Set the desired border thickness
            borderStyle: 'solid', 
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: theme.color,  borderColor: theme.color,
              borderWidth: '2px', // Set the desired border thickness
              borderStyle: 'solid',  }} />} // Apply icon color from theme
            id="faq2"
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'RobotoThin',
                fontSize: '20px',
                fontWeight: 600,
                color: theme.headerColor, // Apply headerColor for headers
              }}
            >
              6. Is CookBook available on mobile devices?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body1"
              color= {theme.headerColor}
              sx={{
                fontFamily: 'RobotoThin',
                fontSize: '20px',
                color: theme.color, // Apply general text color
              }}
            >
              Yes, CookBook is fully responsive and can be used on any mobile
              device or tablet. Simply visit our website from your mobile
              browser, and you can enjoy all the features on-the-go.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </div>
  );
}

export default FAQPage;
