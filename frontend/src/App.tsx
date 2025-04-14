import React from 'react';

import React from 'react';

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
import { Provider } from 'react-redux';
import { BrowserRouter, useLocation } from 'react-router-dom';
import applicationStore from './store';
import './App.css';
import GetIngredients from './features/GetIngredients/GetIngredients';
import Header from './features/Header/Header';
import AppContent from './features/AppContent/AppContent';
import GetTags from './features/AppContent/Tag/GetTags';
import CustomizedAccordions from './features/AppContent/NutritionFilter/CustomizedAccordions';
import { ThemeProvider, useTheme } from './features/Themes/themeContext';
import Footer from './features/Footer/Footer';

const store = applicationStore();

// Separate function for the main application content
const AppContentLayout: React.FC = () => {
  const { theme } = useTheme();
  const location = useLocation();

  // Only show nutrition filter on recipe list and home pages
  const showNutritionFilter = ['/recipe-list', '/home'].includes(location.pathname);

  return (
    <div className="App" style={{ backgroundColor: theme.background, color: theme.color }}>
      <div className="App-header" data-testid="header-comp-43" style={{ backgroundColor: theme.background }}>
        <Header />
      </div>
      <div className="search-helper" data-testid="search-comp-43" style={{ backgroundColor: theme.background }}>
        <GetIngredients />
      </div>
      <div className="search-helper" data-testid="header-comp-44" style={{ backgroundColor: theme.background }}>
        <GetTags />
      </div>
      {showNutritionFilter && (
        <div className="search-helper" data-testid="header-comp-45" style={{ backgroundColor: theme.background }}>
          <CustomizedAccordions />
        </div>
      )}
      <div className="App-body" data-testid="body-comp-43" style={{ backgroundColor: theme.background }}>
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
        <ThemeProvider>
          <AppContentLayout />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
