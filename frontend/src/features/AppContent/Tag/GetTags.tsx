import React from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import { getRecipeListInitiator } from '../RecipeList/getRecipeList.action'
import { useTheme } from '../../Themes/themeContext'

/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

/**
 * File name: GetIngredients.tsx
 * Task - This component has the logic to accept input i.e. ingredients for the user
 * It displays the inputted ingredients in the form of chips. On submit press, it triggers an API call
 * to retrieve a list of recipes that could be made from the inputted ingredients.
 * Search component remain static throughout the application
 * @author Priyanka Ambawane - dearpriyankasa@gmail.c               om
 */

const GetTags = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch()
  const navigateTo = useNavigate()
  const receiptList = [
    'beef',
    'milk',
    'pork',
    'blueberries',
    'butter',
    'cheese',
    'chicken',
    'corn',
    'eggs',
    'eggplant',
    'grapefruits',
    'lobster',
    'lamb',
    'onion',
    'potato',
    'turkey',
  ]
  
  const getReciptButton = (name: string, key: number) => {
    const onSubmit = () => {
      let ingredientsArray: Array<string> = []
      ingredientsArray.push(name.toLocaleLowerCase())
      if (ingredientsArray.length > 0) {
        sessionStorage.setItem('ingredients', JSON.stringify(ingredientsArray))
        dispatch(
          getRecipeListInitiator('http://localhost:8000/recipe/search/', {
            ingredients: ingredientsArray,
            page: 1,
          })
        )
        navigateTo('/recipe-list')
      }
    }

    return (
      <Button
        sx={{ m: 0.5, backgroundColor: theme.headerColor,
          color: theme.color,
          '&:hover': {
            backgroundColor: theme.background,
          }, }}
        size="small"
        key={key}
        onClick={onSubmit}
        type="submit"
        variant="contained"
      >
        {name}
      </Button>
    )
  }

  return <div>{receiptList.map((v, i) => getReciptButton(v, i))}</div>
}

export default GetTags
