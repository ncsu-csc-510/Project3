/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

/**
 * File name: getRecipeList.action.ts
 * Task - Contains action handlers (LOAD, SUCCESS, FAIL) for getting the list of recipes from the DB.
 */

import * as ACTION_TYPES from './getTagList.actionTypes'
import {initiateGetTagListRequest} from "./getTags.saga";

export const getTagListInitiator = (apiURL: string, body: any) => {
  return {
    type: ACTION_TYPES.LOADING_GET_TAG_LIST,
    payload: { apiURL: apiURL, body: body },
  }
}

export const getTagListSuccess = (data: any) => {
  return {
    type: ACTION_TYPES.SUCCESS_GET_TAG_LIST,
    payload: data,
  }
}

export const getTagListFailure = (error: any) => {
  return {
    type: ACTION_TYPES.FAILURE_GET_TAG_LIST,
    payload: error,
  }
}
