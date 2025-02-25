import React from 'react'
import {
  getByDisplayValue,
  getByLabelText,
  getByTitle,
  render,
  screen,
} from '@testing-library/react'
/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

import Navbar from './Navbar'
import { ThemeProvider } from '../Themes/themeContext'

test('shows Home link in Navbar', () => {
  render(
  <ThemeProvider>
    <Navbar />
  </ThemeProvider>
  )
  expect(screen.getByText('Home')).toBeInTheDocument()
})

test('shows About link in Navbar', () => {
  render(<ThemeProvider>
    <Navbar />
  </ThemeProvider>)
  expect(screen.getByText('About')).toBeInTheDocument()
})

test('shows Contact Us link in Navbar', () => {
  render(<ThemeProvider>
    <Navbar />
  </ThemeProvider>)
  expect(screen.getByText(/Contact/i)).toBeInTheDocument()
})

test('shows Contact Us link in Navbar', () => {
  render(<ThemeProvider>
    <Navbar />
  </ThemeProvider>)
  expect(screen.getByText(/FAQ/i)).toBeInTheDocument()
})
