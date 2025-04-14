import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import StarIcon from '@mui/icons-material/Star'
import {
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CardActionArea,
  Pagination,
  CircularProgress,
  SelectChangeEvent,
  Box,
  FormHelperText,
} from '@mui/material'
import { getRecipeInfoInitiator } from '../RecipeInformation/getRecipeInformation.action'
import { getRecipeListInitiator } from './getRecipeList.action'
import './RecipeList.css'
import { RECIPE_CATEGORIES, RECIPE_COOKTIME } from './recipeCategories'
import { useTheme } from '../../Themes/themeContext'

/**
 * File name: RecipeList.tsx
 * Task - This component displays a list of recipes based on the ingredients inputed.
 * This component is a dynamic component and is seen only when you click on a recipe from the recipe list.
 */

interface RecipeListData {
  id: string
  name: string
  description: string
  cookTime: string
  prepTime: string
  category: string
  rating: string
}

interface Recipe {
  _id: string
  name: string
  description: string
  category: string
  images: string[]
}

const RecipeList = () => {
  const { theme } = useTheme()

  const dispatch = useDispatch()
  const navigateTo = useNavigate()

  const [recipeList, setRecipeList] = useState<readonly RecipeListData[]>([])
  const [filtedRecipeList, setFilteredRecipeList] = useState<
    readonly RecipeListData[]
  >([])
  const [page, setPage] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedCookTime, setSelectedCookTime] = useState<string>('')
  const [hidden, setHidden] = useState<boolean>(false)
  const [recipes, setRecipes] = useState<Recipe[]>([])

  const getRecipeListState = useSelector(
    (state: any) => state.getRecipeListAppState
  )

  function convertToMinutes(timeString: string) {
    timeString = timeString.replace(/\s+/g, '').replace('<', '')
    const match = timeString.match(/(\d+)H(?:\s*(\d+)M)?|(\d+)M/)
    if (match) {
      const hours = match[1] ? parseInt(match[1], 10) : 0
      const minutes = match[2]
        ? parseInt(match[2], 10)
        : match[3]
        ? parseInt(match[3], 10)
        : 0
      return hours * 60 + minutes
    } else {
      return 0
    }
  }

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail')
        if (!userEmail) {
          navigateTo('/login')
          return
        }

        const response = await axios.get(`http://localhost:8000/recipes?email=${userEmail}`)
        setRecipes(response.data)
      } catch (error) {
        console.error('Error fetching recipes:', error)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigateTo('/login')
        }
      }
    }

    fetchRecipes()
  }, [navigateTo])

  useEffect(() => {
    let recipes = getRecipeListState.getRecipeListData['recipes']
    if (Array.isArray(recipes)) {
      recipes.forEach((item: any, index: number) => {
        setRecipeList((list) =>
          list.concat({
            id: item._id,
            name: item.name,
            description: item.description,
            cookTime: item.cookTime,
            prepTime: item.prepTime,
            category: item.category,
            rating: item.rating,
          })
        )
      })
      setTotalCount(getRecipeListState.getRecipeListData['count'])
      setPage(getRecipeListState.getRecipeListData['page'])
    }
    return () => {
      setRecipeList([])
      setTotalCount(0)
      setPage(1)
    }
  }, [getRecipeListState.getRecipeListData, selectedCategory])

  useEffect(() => {
    setLoading(getRecipeListState.isGetRecipeListLoading)
  }, [getRecipeListState])

  useEffect(() => {
    if (selectedCategory) {
      let filtered = recipeList.filter(
        (recipe) => recipe.category === selectedCategory
      )
      setFilteredRecipeList(filtered)

      if (selectedCookTime) {
        setHidden(true)
        const comp = convertToMinutes(selectedCookTime)
        let f1 = filtered.filter(
          (recipe) => convertToMinutes(recipe.cookTime) < comp
        )
        if (f1.length === 0) {
          setHidden(false)
        } else {
          filtered = f1
        }
      }

      setFilteredRecipeList(filtered)
    } else {
      setFilteredRecipeList(recipeList)
    }
  }, [selectedCategory, selectedCookTime, recipeList])

  const gotoRecipe = (id: string) => {
    dispatch(getRecipeInfoInitiator('http://localhost:8000/recipes/' + id))
    navigateTo('/recipe-details/' + id)
  }

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    const ingredientsArray = JSON.parse(
      sessionStorage.getItem('ingredients') || '[]'
    )
    dispatch(
      getRecipeListInitiator('http://localhost:8000/recipes/search/', {
        ingredients: ingredientsArray,
        page: value,
      })
    )
    setSelectedCategory('')
  }

  // Handle category change
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value)
  }

  const handleCookTimeChange = (event: SelectChangeEvent<string>) => {
    setSelectedCookTime(event.target.value)
  }

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          m: 2,
          backgroundColor: theme.headerColor, // Theme background
          color: theme.color, // Theme color
        }}
      >
        <Box />
        <Pagination
          page={page}
          count={Math.ceil(totalCount / 10)}
          onChange={handlePageChange}
          color="secondary"
          variant="outlined"
          shape="rounded"
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            color: theme.background,
          }}
        />
        {totalCount > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between', // Ensures space between both components
              alignItems: 'center', // Vertically aligns the components in the middle
              width: '100%', // Ensures the Box takes the full width
            }}
          >
            {/* Category FormControl */}
            <FormControl
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                color: theme.color,
                backgroundColor: theme.headerColor,
                marginTop: '15px',
                marginBottom: '10px',
                width: '48%', // Adjust width to fit both components in the same row
              }}
              size="small"
            >
              <InputLabel
                sx={{
                  color: theme.color,
                  fontSize: '18px',
                  '&.Mui-focused': {
                    color: theme.color,
                  },
                }}
              >
                Category
              </InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Category"
                sx={{
                  color: theme.color,
                  fontSize: '15px',
                  marginTop: '3px',
                  height: '30px',
                  width: '100%',
                  '.MuiSelect-icon': {
                    color: theme.color,
                    backgroundColor: theme.headerColor,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.color,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.color,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 200,
                      overflowY: 'auto',
                      marginTop: '8px',
                      backgroundColor: theme.background,
                      color: theme.color,
                    },
                  },
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {RECIPE_CATEGORIES.map((category, index) => (
                  <MenuItem
                    key={index}
                    value={category}
                    sx={{
                      backgroundColor: theme.background,
                      color: theme.color,
                      '&:hover': {
                        backgroundColor: theme.headerColor,
                        color: theme.color,
                      },
                    }}
                  >
                    {category}
                  </MenuItem>
                ))}
              </Select>
              {selectedCategory && filtedRecipeList.length === 0 && (
                <FormHelperText sx={{ color: '#f44336', marginTop: '8px' }}>
                  No recipes found in this category.
                </FormHelperText>
              )}
            </FormControl>

            {/* Cook Time FormControl */}
            {selectedCategory !== '' && filtedRecipeList.length > 0 && (
              <FormControl
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  color: theme.color,
                  backgroundColor: theme.headerColor,
                  marginTop: '15px',
                  marginBottom: '10px',
                  width: '48%', // Adjust width to fit both components in the same row
                }}
                size="small"
              >
                <InputLabel
                  sx={{
                    color: theme.color,
                    fontSize: '18px',
                    '&.Mui-focused': {
                      color: theme.color,
                    },
                  }}
                >
                  Cook Time
                </InputLabel>
                <Select
                  value={selectedCookTime}
                  onChange={handleCookTimeChange}
                  label="Cook Time"
                  sx={{
                    color: theme.color,
                    fontSize: '15px',
                    marginTop: '3px',
                    height: '30px',
                    width: '100%',
                    '.MuiSelect-icon': {
                      color: theme.color,
                      backgroundColor: theme.headerColor,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.color,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.color,
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 200,
                        overflowY: 'auto',
                        marginTop: '8px',
                        backgroundColor: theme.background,
                        color: theme.color,
                      },
                    },
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {RECIPE_COOKTIME.map((time, index) => (
                    <MenuItem
                      key={index}
                      value={time}
                      sx={{
                        backgroundColor: theme.background,
                        color: theme.color,
                        '&:hover': {
                          backgroundColor: theme.headerColor,
                          color: theme.color,
                        },
                      }}
                    >
                      {time}
                    </MenuItem>
                  ))}
                </Select>
                {selectedCookTime && !hidden && (
                  <FormHelperText sx={{ color: '#f44336', marginTop: '8px' }}>
                    No recipes found in selected cooktime.
                  </FormHelperText>
                )}
              </FormControl>
            )}
          </Box>
        )}
      </Box>
      {!loading ? (
        totalCount > 0 ? (
          (selectedCategory && filtedRecipeList.length > 0
            ? filtedRecipeList
            : recipeList
          ).map((data: any, index: number) => {
            return (
              <Card
                variant="outlined"
                sx={{
                  width: 4 / 5,
                  m: 1,
                  backgroundColor: theme.background, // Card background from theme
                  color: theme.color, // Card text color
                  borderColor: theme.headerColor,
                  borderWidth: '2px', // Set the desired border thickness
                  borderStyle: 'solid', // Ensure the border style is solid
                }}
                key={index}
              >
                <CardActionArea onClick={() => gotoRecipe(data.id)}>
                  <CardContent>
                    <div className="d-flex flex-row">
                      <Typography
                        sx={{ fontWeight: 600, color: theme.color }} // Theme color for text
                        gutterBottom
                        variant="h5"
                        component="div"
                      >
                        {data.name} |{' '}
                        <StarIcon
                          sx={{ color: '#dede04' }} // Star icon color
                          fontSize="medium"
                        />{' '}
                        {data.rating}/5.0
                      </Typography>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="span"
                        className="supplemental-info"
                        sx={{ color: theme.color }} // Theme color for text
                      >
                        {data.category}
                      </Typography>
                    </div>
                    <Typography
                      sx={{ textAlign: 'left', color: theme.color }} // Theme color for text
                      variant="subtitle2"
                    >
                      Prep Time : {data.prepTime} | Cook Time : {data.cookTime}
                    </Typography>

                    <Typography
                      sx={{
                        textAlign: 'left',
                        marginTop: 2,
                        fontStyle: 'italic',
                        color: theme.color, // Theme color for text
                      }}
                      variant="body2"
                    >
                      {data.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            )
          })
        ) : (
          <Typography
            variant="h5"
            component="div"
            sx={{ m: 4, color: theme.color }} // Theme color for no recipes found
            className="no-recipe-found"
          >
            Currently our database does not have any recipes with the selected
            ingredients. Check back in later for any updates.
          </Typography>
        )
      ) : (
        <CircularProgress
          style={{ color: theme.color, margin: '50px' }} // Theme color for loader
        />
      )}
      <Pagination
        page={page}
        count={Math.ceil(totalCount / 10)}
        sx={{
          m: 2,
          backgroundColor: theme.headerColor,
          color: theme.color, // Theme color for pagination
        }}
        onChange={handlePageChange}
        color="secondary"
        variant="outlined"
        shape="rounded"
      />
    </>
  )
}

export default RecipeList
