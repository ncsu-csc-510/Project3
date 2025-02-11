/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/
// App.test.tsx

// Mock axios to avoid issues with the import statement
jest.mock('axios', () => ({
  get: jest.fn(),
}))

import React from 'react'
import {
  getByTestId,
  getByLabelText,
  render,
  screen,
} from '@testing-library/react'
import App from './App'

test('has header component', () => {
  const { getByTestId } = render(<App />)
  expect(getByTestId('header-comp-43')).toBeInTheDocument()
})

test('has search component', () => {
  const { getByTestId } = render(<App />)
  expect(getByTestId('search-comp-43')).toBeInTheDocument()
})

test('has body component', () => {
  const { getByTestId } = render(<App />)
  expect(getByTestId('body-comp-43')).toBeInTheDocument()
})

test('shows search bar correctly', () => {
  const { getByLabelText } = render(<App />)
  expect(getByLabelText('Type to select Ingredients')).toBeInTheDocument()
})
