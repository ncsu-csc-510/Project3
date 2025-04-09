/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

/**
 * File name: AppContent.tsx
 * Task - The component defines the routes for the application and decides which component on render on that
 * particular route
 * @author Priyanka Ambawane - dearpriyankasa@gmail.com
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom'
import HomePage from './HomePage/HomePage'
import About from './HomePage/AboutPage'
import Contact from './HomePage/ContactPage'
import FAQPage from './HomePage/FAQPage'
import RecipeInformation from './RecipeInformation/RecipeInformation'
import RecipeList from './RecipeList/RecipeList'
import Login from "./HomePage/Login"; 
import Profile from "./HomePage/Profile";
import Signup from "./HomePage/Signup";
import Favorite from "./HomePage/Favorite";
import MealPage from './HomePage/MealPage'
import AddRecipe from './HomePage/AddRecipe'

import SmartShoppingList from '../ShoppingList/SmartShoppingList'


const AppContent = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/recipe-list" element={<RecipeList />} />
      <Route path="/recipe-details/:id" element={<RecipeInformation />} />
      <Route path="/meal" element={<MealPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/shoppinglist" element={<SmartShoppingList />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/favorites" element={<Favorite />} />
      <Route path='/add-recipe' element={<AddRecipe />} />

        {/* Route for Login */}
        <Route path="/login" element={<Login />} />

        {/* Route for Profile */}
        <Route path="/profile" element={<Profile />} />

        {/* Optional: Route for Home */}
        <Route path="/" element={<HomePage />} />
    </Routes>
  )
}

export default AppContent
