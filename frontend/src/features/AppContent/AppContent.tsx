import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './HomePage/HomePage'
import About from './HomePage/AboutPage'
import Contact from './HomePage/ContactPage'
import FAQPage from './HomePage/FAQPage'
import RecipeInformation from './RecipeInformation/RecipeInformation'
import RecipeList from './RecipeList/RecipeList'
import Login from "./HomePage/Login"
import Profile from "./HomePage/Profile"
import Signup from "./HomePage/Signup"
import Favorite from "./HomePage/Favorite"
import MealPage from './HomePage/MealPage'
import AddRecipe from './HomePage/AddRecipe'
import SmartShoppingList from '../ShoppingList/SmartShoppingList'
import ProtectedRoute from './ProtectedRoute'
import WhatToEatPage from './HomePage/WhatToEatPage'

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

const AppContent = () => {
  const userEmail = localStorage.getItem('userEmail');

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={userEmail ? <Navigate to="/home" replace /> : <HomePage />} />
      <Route path="/login" element={userEmail ? <Navigate to="/home" replace /> : <Login />} />
      <Route path="/signup" element={userEmail ? <Navigate to="/home" replace /> : <Signup />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQPage />} />

      {/* Protected routes */}
      <Route path="/home" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="/recipe-list" element={
        <ProtectedRoute>
          <RecipeList />
        </ProtectedRoute>
      } />
      <Route path="/recipe-details/:id" element={
        <ProtectedRoute>
          <RecipeInformation />
        </ProtectedRoute>
      } />
      <Route path="/meal" element={
        <ProtectedRoute>
          <MealPage />
        </ProtectedRoute>
      } />
      <Route path="/shoppinglist" element={
        <ProtectedRoute>
          <SmartShoppingList />
        </ProtectedRoute>
      } />
      <Route path="/favorites" element={
        <ProtectedRoute>
          <Favorite />
        </ProtectedRoute>
      } />
      <Route path="/add-recipe" element={
        <ProtectedRoute>
          <AddRecipe />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/what-to-eat" element={
        <ProtectedRoute>
          <WhatToEatPage />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default AppContent
