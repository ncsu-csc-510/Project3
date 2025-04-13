import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Paper,
} from '@mui/material';

/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

import first from './photos/first.jpg'
import second from './photos/second.jpg'
import third from './photos/third.jpg'
import fourth from './photos/fourth.jpg'
import fifth from './photos/fifth.jpg'
import sixth from './photos/sixth.jpg'
import seventh from './photos/seventh.jpg'
import eighth from './photos/eighth.jpg'
import nineth from './photos/nineth.jpg'
import tenth from './photos/tenth.jpg'
import { useTheme } from '../../Themes/themeContext'

const HomePage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const featuredRecipes = [
    { image: first, title: 'Italian Pasta' },
    { image: second, title: 'Fresh Salad' },
    { image: third, title: 'Grilled Steak' },
    { image: fourth, title: 'Vegetable Curry' },
    { image: fifth, title: 'Seafood Platter' },
  ];

  return (
    <Box sx={{ backgroundColor: theme.background, color: theme.color, minHeight: '100vh' }}>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          backgroundColor: theme.headerColor,
          color: theme.color,
          mb: 4,
          py: 8,
          px: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                Discover Delicious Recipes
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4 }}>
                Find the perfect recipe for any occasion, using ingredients you already have.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/recipe-list')}
                sx={{
                  backgroundColor: theme.background,
                  color: theme.headerColor,
                  '&:hover': {
                    backgroundColor: theme.color,
                  },
                }}
              >
                Explore Recipes
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={sixth}
                alt="Featured Recipe"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Featured Recipes Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}
        >
          Featured Recipes
        </Typography>
        <Grid container spacing={4}>
          {featuredRecipes.map((recipe, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={recipe.image}
                  alt={recipe.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3">
                    {recipe.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Recipe Gallery Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}
        >
          Recipe Gallery
        </Typography>
        <Grid container spacing={2}>
          {[seventh, eighth, nineth, tenth].map((image, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                component="img"
                src={image}
                alt={`Recipe ${index + 1}`}
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 2,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
