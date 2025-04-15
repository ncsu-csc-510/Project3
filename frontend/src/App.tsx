import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import applicationStore from './store';
import './App.css';
import GetIngredients from './features/GetIngredients/GetIngredients';
import Header from './features/Header/Header';
import AppContent from './features/AppContent/AppContent';
import GetTags from './features/AppContent/Tag/GetTags';
import CustomizedAccordions from './features/AppContent/NutritionFilter/CustomizedAccordions';
import { ThemeProvider, useTheme } from './features/Themes/themeContext';
import Footer from './features/Footer/Footer';
import theme from './theme';

/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

/**
 * File name: App.tsx
 * Task - This is the parent component of the application. It creates the basic UI skeleton
 * viz the header, the search component and the app contents
 * Header and Search component remain static and app contents change according to the state of the application
 * @author Priyanka Ambawane - dearpriyankasa@gmail.com
 */

const store = applicationStore();

// Separate function for the main application content
const AppContentLayout: React.FC = () => {
  const { theme: customTheme } = useTheme();
  const location = useLocation();

  // Only show nutrition filter on recipe list and home pages
  const showNutritionFilter = ['/recipe-list', '/home'].includes(location.pathname);

  return (
    <div className="App" style={{ backgroundColor: customTheme.background, color: customTheme.color }}>
      <div className="App-header" data-testid="header-comp-43" style={{ backgroundColor: customTheme.background }}>
        <Header />
      </div>
      <div className="search-helper" data-testid="search-comp-43" style={{ backgroundColor: customTheme.background }}>
        <GetIngredients />
      </div>
      <div className="search-helper" data-testid="header-comp-44" style={{ backgroundColor: customTheme.background }}>
        <GetTags />
      </div>
      {showNutritionFilter && (
        <div className="search-helper" data-testid="header-comp-45" style={{ backgroundColor: customTheme.background }}>
          <CustomizedAccordions />
        </div>
      )}
      <div className="App-body" data-testid="body-comp-43" style={{ backgroundColor: customTheme.background }}>
        <AppContent />
      </div>
      <Footer />
    </div>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <MuiThemeProvider theme={theme}>
          <ThemeProvider>
            <AppContentLayout />
          </ThemeProvider>
        </MuiThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
