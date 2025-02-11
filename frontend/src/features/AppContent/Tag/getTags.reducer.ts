/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

import * as ACTION_TYPES from './getTagList.actionTypes'
import { ActionTypes } from '../../apiMethods'
/*
 * File name: getRecipeList.reducer.ts
 * Task - Contains a normal function that performs state update based on API call output - SUCCESS/FAIL
 */
const initialState = {
  isGetTagListLoading: false,
  isGetTagListSuccess: false,
  isGetTagListFailure: false,
  getTagListData: [],
  getTagListError: [],
  tagList: [],
}

export default function getTagListAppState(
  state = initialState,
  action: ActionTypes
) {
  switch (action.type) {
    case ACTION_TYPES.LOADING_GET_TAG_LIST:
      return {
        ...state,
        isGetTagListLoading: true,
      }
    case ACTION_TYPES.SUCCESS_GET_TAG_LIST:
      return {
        ...state,
        isGetTagListLoading: false,
        isGetTagListSuccess: true,
        isGetTagListFailure: false,
        getTagListData: action.payload.resp,
        TagList: action.payload.TagList
      }
    case ACTION_TYPES.FAILURE_GET_TAG_LIST:
      return {
        ...state,
        isGetTagListLoading: false,
        isGetTagListSuccess: false,
        isGetTagListFailure: true,
        getTagListError: action.payload,
      }
    default:
      return state
  }
}
