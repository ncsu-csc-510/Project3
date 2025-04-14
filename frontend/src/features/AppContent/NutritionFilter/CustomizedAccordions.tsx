import * as React from 'react'
import { styled } from '@mui/material/styles'
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import {
  Slider,
  Stack,
  Button,
  Modal,
  Box,
  TextField,
  MenuItem,
} from '@mui/material'
import Swal from 'sweetalert2'
import { getRecipeListInitiator } from '../RecipeList/getRecipeList.action'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
      : theme.palette.background.paper,
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

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
}

export default function CustomizedAccordions() {
  const dispatch = useDispatch()
  const navigateTo = useNavigate()
  const { theme } = useTheme()
  const [expanded, setExpanded] = React.useState<string | false>()
  const [open, setOpen] = React.useState(false)

  const handleChange = (panel: string) => (
    event: React.SyntheticEvent,
    newExpanded: boolean
  ) => setExpanded(newExpanded ? panel : false)

  const defaultValue = 50
  const [cal, setCal] = React.useState<number>(defaultValue)
  const [fat, setFat] = React.useState<number>(defaultValue)
  const [sug, setSug] = React.useState<number>(defaultValue)
  const [pro, setPro] = React.useState<number>(defaultValue)

  const [formData, setFormData] = React.useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    goal: 'lose weight',
    activity_level: 'sedentary',
  })

  const onSearch = () => {
    dispatch(
      getRecipeListInitiator('http://localhost:8000/recipes/search2/', {
        page: 1,
        caloriesUp: cal,
        fatUp: fat,
        sugUp: sug,
        proUp: pro,
      })
    )
    navigateTo('/recipe-list')
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAIHelp = async () => {
    try {
      const response = await fetch(
        'http://localhost:8000/recipes/nutrition-chatbot/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )
      const data = await response.json()
      setCal(data.recommended_calories)
      setFat(data.recommended_fat_g)
      setSug(data.recommended_sugar_g)
      setPro(data.recommended_protein_g)
      setOpen(false)
      // 🎉 SweetAlert2 popup after AI generates recommendations
      Swal.fire({
        title: '🎯 AI Recommendations Applied!',
        html: `
        <p>Your personalized nutritional values have been updated based on your inputs:</p>
        <ul style="text-align: left;">
          <li><strong>Calories:</strong> ${data.recommended_calories} kcal</li>
          <li><strong>Fat:</strong> ${data.recommended_fat_g} g</li>
          <li><strong>Sugar:</strong> ${data.recommended_sugar_g} g</li>
          <li><strong>Protein:</strong> ${data.recommended_protein_g} g</li>
        </ul>
        <p>You're all set to explore recipes tailored to your needs! 🍽️</p>
      `,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Awesome! Let\'s Go 🚀',
      })
    } catch (err) {
      console.error('AI recommendation failed:', err)
      Swal.fire({
        title: '⚠️ Oops!',
        text:
          'Something went wrong while fetching AI recommendations. Please try again.',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Try Again',
      })
    }
  }

  return (
    <div style={{ backgroundColor: theme.background, color: theme.color }}>
      <br />

      <Accordion
        expanded={expanded === 'panel1'}
        onChange={handleChange('panel1')}
      >
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Typography style={{ color: theme.headerColor }}>
            Nutrition Filter
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <Button
              size="medium"
              variant="outlined"
              onClick={() => setOpen(true)}
              sx={{ backgroundColor: theme.headerColor, color: 'white' }}
            >
              Get Help from AI
            </Button>
          </Stack>
          <Stack spacing={2} direction="row" alignItems="center">
            <Typography style={{ color: theme.color }}>Calories:</Typography>
            <Slider
              aria-label="Calories"
              value={cal}
              onChange={(e, v) => setCal(v as number)}
              max={4000}
            />
            <Typography style={{ color: theme.color }}>Fat:</Typography>
            <Slider
              aria-label="Fat"
              value={fat}
              onChange={(e, v) => setFat(v as number)}
              max={140}
            />
            <Typography style={{ color: theme.color }}>Sugar:</Typography>
            <Slider
              aria-label="Sugar"
              value={sug}
              onChange={(e, v) => setSug(v as number)}
              max={150}
            />
            <Typography style={{ color: theme.color }}>Protein:</Typography>
            <Slider
              aria-label="Protein"
              value={pro}
              onChange={(e, v) => setPro(v as number)}
              max={250}
            />
          </Stack>
          <Typography>
            Calorie: {cal} - Fat: {fat} - Sugar: {sug} - Protein: {pro}
          </Typography>
          <Button
            variant="contained"
            onClick={onSearch}
            sx={{ backgroundColor: theme.headerColor }}
          >
            Search
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Modal for AI Chatbot */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6">AI Nutrition Assistant</Typography>
          <Stack spacing={2}>
            <TextField
              label="Weight (kg)"
              name="weight"
              value={formData.weight}
              onChange={handleFormChange}
            />
            <TextField
              label="Height (cm)"
              name="height"
              value={formData.height}
              onChange={handleFormChange}
            />
            <TextField
              label="Age"
              name="age"
              value={formData.age}
              onChange={handleFormChange}
            />
            <TextField
              select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleFormChange}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
            </TextField>
            <TextField
              select
              label="Goal"
              name="goal"
              value={formData.goal}
              onChange={handleFormChange}
            >
              <MenuItem value="lose weight">Lose Weight</MenuItem>
              <MenuItem value="maintain weight">Maintain Weight</MenuItem>
              <MenuItem value="gain weight">Gain Weight</MenuItem>
            </TextField>
            <TextField
              select
              label="Activity Level"
              name="activity_level"
              value={formData.activity_level}
              onChange={handleFormChange}
            >
              <MenuItem value="sedentary">Sedentary</MenuItem>
              <MenuItem value="light">Light Activity</MenuItem>
              <MenuItem value="moderate">Moderate Activity</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="very active">Very Active</MenuItem>
            </TextField>
            <Button
              variant="contained"
              onClick={handleAIHelp}
              sx={{ backgroundColor: theme.headerColor }}
            >
              Get Recommendations
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  )
}
