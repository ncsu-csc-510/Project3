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
 * @author Priyanka Ambawane - dearpriyankasa@gmail.com
 */
import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Autocomplete, Box, Button, Chip, Grid, TextField } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import Send from '@mui/icons-material/Send'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import { getIngredientsInitiator } from './getIngredients.action'
import { getRecipeListInitiator } from '../AppContent/RecipeList/getRecipeList.action'
import { useTheme } from '../Themes/themeContext'

interface ChipData {
  key: string
  label: string
}
interface ListData {
  key: string
  label: string
}

// Extracted out Autocomplete input field to allow ingredients suggestions to the user
const InputField = ({
  field,
  label,
  id,
  onChangeField,
  onChangeTextField,
  listData,
}: any) => {
  return (
    <Autocomplete
      freeSolo
      {...field}
      id="free-solo-2-demo"
      disableClearable
      options={listData.map((option: any) => option.label)}
      onChange={(event, val: string) => {
        onChangeField(val)
      }}
      renderInput={(params: any) => {
        return (
          <TextField
            {...params}
            id={id}
            label={label}
            onChange={(event) => onChangeTextField(event.target.value)}
            InputProps={{
              ...params.InputProps,
              type: 'search',
            }}
          />
        )
      }}
    />
  )
}

const GetIngredients = () => {
  const dispatch = useDispatch()
  const { control } = useForm()
  const navigateTo = useNavigate()
  const { theme } = useTheme() // Access the theme object

  const [chipData, setChipData] = useState<readonly ChipData[]>([])
  const [listData, setListData] = useState<readonly ListData[]>([])
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // accesses the state of the component from the app's store
  const getIngredientsState = useSelector(
    (state: any) => state.getIngredientsAppState
  )
  
  useEffect(() => {
    let ingredients = getIngredientsState.getIngredientsData
    if (Array.isArray(ingredients)) {
      ingredients.forEach((item: string, index: number) => {
        setListData((list) => list.concat({ key: item, label: item }))
      })
    }
    return () => {
      setListData([])
    }
  }, [getIngredientsState.getIngredientsData])

  // Debounced function to get ingredients suggestions
  const onChangeTextField = useCallback((val: string) => {
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // Only make API call after 500ms of inactivity and if input is 3+ chars
    if (val.length >= 3) {
      const timeout = setTimeout(() => {
        dispatch(
          getIngredientsInitiator(
            'http://localhost:8000/recipes/ingredients/' + val
          )
        )
      }, 500) // 500ms delay
      
      setSearchTimeout(timeout)
    }
  }, [dispatch, searchTimeout])

  // Clean up the timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  // on enter or ingredient selection from suggestion list, this function stores the input in the chipData state
  const onChangeField = (val: string) => {
    setChipData((chips) => chips.concat({ key: val, label: val }))
  }

  // handler to delete the ingredient
  const handleDelete = (chipToDelete: ChipData) => () => {
    setChipData((chips) =>
      chips.filter((chip) => chip.key !== chipToDelete.key)
    )
  }

  // handler to trigger the API call to get the list of recipes according to the user's ingredient's input
  const onSubmit = () => {
    let ingredientsArray: Array<string> = []
    chipData.forEach((chip) => ingredientsArray.push(chip.label.toLocaleLowerCase()))
    if (ingredientsArray.length > 0) {
      sessionStorage.setItem('ingredients', JSON.stringify(ingredientsArray))
      dispatch(
        getRecipeListInitiator('http://localhost:8000/recipes/search/', {
          ingredients: ingredientsArray,
          page: 1,
        })
      )
      navigateTo('/recipe-list')
    }
  }

  return (
    <>
      <br />
      <Grid container spacing={3} style={{ backgroundColor: theme.background }}>
        <Grid item xs={1} style={{ backgroundColor: theme.background }}></Grid>
        <Grid item xs={10} style={{ backgroundColor: theme.background }}>
          <Controller

            render={({ field }) => (
              <InputField
              style={{ backgroundColor: theme.background, color: theme.color }}
                field={field}
                label="Type to select Ingredients"
                id="outlined-size-normal"
                listData={listData}
                onChangeField={onChangeField}
                onChangeTextField={onChangeTextField}
                
              />
            )}
            name="ingredients"
            control={control}
          />
        </Grid>
        <Grid item xs={1} container justifyContent="flex-start" style={{ backgroundColor: theme.background, color:theme.color }}>
          <Button
            onClick={onSubmit}
            type="submit"
            style={{
              borderRadius: '50%',
              height: '100%',
              width: '0%',
              padding: '5px',
              color: theme.color,
              backgroundColor: theme.headerColor, // Use headerColor from theme
            }}
            variant="contained"
            endIcon={<Send fontSize="large" style={{ marginRight: '10px' }} />}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}style={{ backgroundColor: theme.background }}>
        <Grid item xs={12} style={{ backgroundColor: theme.background }}>
          <Box paddingTop={'20px'} style={{ backgroundColor: theme.background }}>
            {chipData.map((data) => {
              return (
                <Chip
                  key={data.key}
                  label={data.label}
                  onDelete={handleDelete(data)}
                  deleteIcon={
                    <HighlightOffIcon
                      fontSize="large"
                      style={{ color: theme.color }} // Apply theme color for delete icon
                    />
                  }
                  style={{
                    margin: '5px',
                    backgroundColor: theme.headerColor, // Use headerColor for chip background
                    color: theme.color, // Use theme color for chip text
                  }}
                />
              )
            })}
          </Box>
        </Grid>
      </Grid>
    </>
  )
}

export default GetIngredients