/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

import { takeEvery, put, call } from 'redux-saga/effects'
import * as ACTIONS from './getTagList.action'
import * as ACTION_TYPES from './getTagList.actionTypes'
import { ActionTypes, httpPostRequest } from '../../apiMethods'

/**
 * File name: getRecipeList.saga.ts
 * Task - It is a middleware, that handles the async logic in the data flow based on the action that
 * has been dispatched.
 */

export function* initiateGetTagListRequest(action: ActionTypes) {
  try {
    // @ts-ignore
    const resp: any = yield call(
      httpPostRequest,
      action.payload.apiURL,
      action.payload.body
    )
    yield put(ACTIONS.getTagListSuccess({resp: resp, ingredientsList: action.payload.body}))
  } catch (err) {
    yield put(ACTIONS.getTagListFailure(err))
  }
}

export function* getTagListSaga() {
  yield takeEvery(
    ACTION_TYPES.LOADING_GET_TAG_LIST,
    initiateGetTagListRequest
  )
}
