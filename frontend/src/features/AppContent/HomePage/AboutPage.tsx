import React from 'react'

/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

import './HomePage.css';
import { useTheme } from '../../Themes/themeContext'
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  List, 
  ListItem, 
  ListItemText,
  Divider
} from '@mui/material';

const AboutPage = () => {
  const { theme } = useTheme();
  
  const aboutPoints = [
    "Most of us might have been in a situation where you are craving for something to eat and due to some reason it won't be delivered to your place. And then you decide to cook it yourself you can't find a recipe with the ingredients you have.",
    "In this fast-paced world, we are often confused about what can be cooked with the ingredients that are available right away.",
    "CookBook addresses this issue and is designed to suggest recipes to you which would use the key ingredients that are available with you.",
    "It not only suggests the recipe based on the ingredients entered by you, it also gives the ratings, step-by-step cooking instructions and other granular details about the recipe.",
    "Apart from giving the user a smooth and a stress-free experience, it also serves as a platform to find recipes across multiple cuisines and cultures.",
    "CookBook is very simple to use. You just have to enter the available ingredients in the search bar and click on the proceed icon to get a list of suggestions for recipes."
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
          About CookBook
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              mb: 2,
              color: theme.headerColor
            }}
          >
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph>
            CookBook is your ultimate companion in the kitchen, designed to make cooking easier and more enjoyable. 
            We understand the challenges of finding the right recipe with the ingredients you have, and we're here to help.
          </Typography>
        </Box>

        <Divider sx={{ my: 3, borderColor: theme.headerColor }} />

        <Box>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom 
            sx={{ 
              mb: 3,
              color: theme.headerColor
            }}
          >
            What We Offer
          </Typography>
          <List>
            {aboutPoints.map((point, index) => (
              <ListItem key={index} sx={{ mb: 2 }}>
                <ListItemText 
                  primary={
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        lineHeight: 1.6,
                        '&:hover': {
                          color: theme.headerColor,
                          transition: 'color 0.3s ease'
                        }
                      }}
                    >
                      {point}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutPage;
