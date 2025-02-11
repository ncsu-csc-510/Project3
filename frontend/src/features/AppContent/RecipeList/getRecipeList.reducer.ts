/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

import * as ACTION_TYPES from './getRecipeList.actionTypes'
import { ActionTypes } from '../../apiMethods'
/*
 * File name: getRecipeList.reducer.ts
 * Task - Contains a normal function that performs state update based on API call output - SUCCESS/FAIL
 */
const initialState = {
  isGetRecipeListLoading: false,
  isGetRecipeListSuccess: false,
  isGetRecipeListFailure: false,
  getRecipeListData: [],
  getRecipeListError: [],
  ingredientsList: [],
}

export default function getRecipeListAppState(
  state = initialState,
  action: ActionTypes
) {
  switch (action.type) {
    case ACTION_TYPES.LOADING_GET_RECIPE_LIST:
      return {
        ...state,
        isGetRecipeListLoading: true,
      }
    case ACTION_TYPES.SUCCESS_GET_RECIPE_LIST:
      return {
        ...state,
        isGetRecipeListLoading: false,
        isGetRecipeListSuccess: true,
        isGetRecipeListFailure: false,
        getRecipeListData: action.payload.resp,
        ingredientsList: action.payload.ingredientsList
      }
    case ACTION_TYPES.FAILURE_GET_RECIPE_LIST:
      return {
        ...state,
        isGetRecipeListLoading: false,
        isGetRecipeListSuccess: false,
        isGetRecipeListFailure: true,
        getRecipeListError: action.payload,
      }
    default:
      return state
  }
}
