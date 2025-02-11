/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

/**
 * File name: features.reducer.ts
 * Task - It does the task of combining all the reducers for all the features and forms the state tree object
 * that contains the data of the application
 * @author Priyanka Ambawane - dearpriyankasa@gmail.com
 */
import { combineReducers } from 'redux';
import getIngredientsAppState from "../features/GetIngredients/getIngredients.reducer";
import getRecipeInfoAppState from './AppContent/RecipeInformation/getRecipeInformation.reducer';
import getRecipeListAppState from './AppContent/RecipeList/getRecipeList.reducer';
import getTagListAppState from "./AppContent/Tag/getTags.reducer";
const combineReducer = combineReducers({ getIngredientsAppState, getRecipeListAppState, getRecipeInfoAppState, getTagListAppState })
 
export default combineReducer;