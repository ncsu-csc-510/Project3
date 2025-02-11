/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

/**
 * File name: features.saga.ts
 * Task - It does the task of combining all the middlewares for all the features and triggers them to
 * be in the listenning mode. So that when a action is dispatched, it can listen to the type and start the
 * execution if there is type match
 * @author Priyanka Ambawane - dearpriyankasa@gmail.com
 */
import { all } from 'redux-saga/effects';
import { getRecipeInfoSaga } from './AppContent/RecipeInformation/getRecipeInformation.saga';
import { getRecipeListSaga } from './AppContent/RecipeList/getRecipeList.saga';
import { getIngredientsSaga } from "./GetIngredients/getIngredients.saga";
import { getTagListSaga} from "./AppContent/Tag/getTags.saga";

export default function* combinedSagas() {
  yield all([
    getIngredientsSaga(),
    getRecipeListSaga(),
    getRecipeInfoSaga(),
    getTagListSaga()
  ]);
}