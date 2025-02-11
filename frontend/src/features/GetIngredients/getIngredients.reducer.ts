/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

/**
 * File name: getIngredients.reducer.ts
 * Task - Contains a normal function that performs state update based on API call output - SUCCESS/FAIL
 * @author Priyanka Ambawane - dearpriyankasa@gmail.com
 */
import * as ACTION_TYPES from './getIngredients.actionTypes'
import { ActionTypes } from '../apiMethods'

const initialState = {
  isGetIngredientsLoading: false,
  isGetIngredientsSuccess: false,
  isGetIngredientsFailure: false,
  getIngredientsData: [],
  getIngredientsError: [],
}

export default function getIngredientsAppState(
  state = initialState,
  action: ActionTypes
) {
  switch (action.type) {
    case ACTION_TYPES.LOADING_GET_INGREDIENTS:
      return {
        ...state,
        isGetIngredientsLoading: true,
      }
    case ACTION_TYPES.SUCCESS_GET_INGREDIENTS:
      return {
        ...state,
        isGetIngredientsLoading: false,
        isGetIngredientsSuccess: true,
        isGetIngredientsFailure: false,
        getIngredientsData: action.payload,
      }
    case ACTION_TYPES.FAILURE_GET_INGREDIENTS:
      return {
        ...state,
        isGetIngredientsLoading: false,
        isGetIngredientsSuccess: false,
        isGetIngredientsFailure: true,
        getIngredientsError: action.payload,
      }
    default:
      return state
  }
}
