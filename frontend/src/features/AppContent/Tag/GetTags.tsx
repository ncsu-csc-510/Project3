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
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Chip, Grid, Stack, TextField } from '@mui/material'
import { getRecipeListInitiator } from '../RecipeList/getRecipeList.action'
import { styled } from '@mui/material/styles'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import { useTheme } from '../../Themes/themeContext'

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}))

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}))

interface ChipData {
  key: string
  label: string
}
const GetTags = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch()
  const navigateTo = useNavigate()
  const [expanded, setExpanded] = React.useState<string | false>('panel1')
  const [chipData, setChipData] = useState<readonly ChipData[]>([])
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
        sx={{ m: 0.5, backgroundColor: theme.headerColor, // Theme button background
          color: theme.color, // Theme button text color
          '&:hover': {
            backgroundColor: theme.background, // Theme button hover background
          }, }}
        size="small"
        key={key}
        onClick={onSubmit}
        type="submit"
        variant="contained"
        
      >
        {' '}
        {name}{' '}
      </Button>
    )
  }

  // handler to trigger the API call to get the list of recipes according to the user's ingredient's input
  const onSubmit1 = () => {
    let ingredientsArray: Array<string> = []
    ingredientsArray.push('butter'.toLocaleLowerCase())
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
  const handleChange = (panel: string) => (
    event: React.SyntheticEvent,
    newExpanded: boolean
  ) => {
    setExpanded(newExpanded ? panel : false)
  }
  //  let buttonStyles = {
  //   backgroundColor: '#f2f4f4',
  //   marginTop: '20px',
  //   padding: '20px',
  //   marginLeft: '30px',
  //   marginRight: '30px'
  // }

  return <div>{receiptList.map((v, i) => getReciptButton(v, i))}</div>
}

export default GetTags
