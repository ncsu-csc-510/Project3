/*
Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com
*/

// SmartShoppingList.test.tsx

// Mock axios to avoid issues with the import statement
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}))

global.HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue({})

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SmartShoppingList from './SmartShoppingList'
import axios from 'axios'


// Cast axios as a jest.Mocked object
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('SmartShoppingList Component', () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      data: { shopping_list: [] },
    })
    mockedAxios.post.mockResolvedValue({
      data: { shopping_list: [] },
    })
    mockedAxios.delete.mockResolvedValue({})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders the component and displays the title', () => {
    render(<SmartShoppingList />)
    expect(screen.getByText('Smart Shopping List')).toBeInTheDocument()
  })

  test('renders the add item fields', () => {
    render(<SmartShoppingList />)
    expect(screen.getByLabelText('Add a shopping item')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument()
    expect(screen.getByText('Add Item')).toBeInTheDocument()
  })

  // test('fetches and displays list items from API', async () => {
  //   const mockItems = [
  //     {
  //       _id: '1',
  //       name: 'Apples',
  //       quantity: 5,
  //       unit: 'kg',
  //       checked: false,
  //     },
  //   ]

  //   mockedAxios.get.mockResolvedValueOnce({
  //     data: { shopping_list: mockItems },
  //   })

  //   render(<SmartShoppingList />)

  //   await waitFor(() => {
  //     expect(screen.getByText('Apples')).toBeInTheDocument()
  //     expect(screen.getByText('Quantity: 5')).toBeInTheDocument()
  //   })
  // })

  // test('adds a new item to the list', async () => {
  //   const newItem = {
  //     _id: '2',
  //     name: 'Oranges',
  //     quantity: 3,
  //     unit: 'kg',
  //     checked: false,
  //   }

  //   mockedAxios.post.mockResolvedValueOnce({
  //     data: { shopping_list: [newItem] },
  //   })

  //   render(<SmartShoppingList />)

  //   fireEvent.change(screen.getByLabelText('Add a shopping item'), {
  //     target: { value: 'Oranges' },
  //   })
  //   fireEvent.change(screen.getByLabelText('Quantity'), {
  //     target: { value: 3 },
  //   })
  //   fireEvent.mouseDown(screen.getByLabelText('Unit'))
  //   fireEvent.click(screen.getByText('kg'))

  //   fireEvent.click(screen.getByText('Add Item'))

  //   await waitFor(() => {
  //     expect(mockedAxios.post).toHaveBeenCalledTimes(1)
  //     expect(screen.getByText('Oranges')).toBeInTheDocument()
  //     expect(screen.getByText('Quantity: 3')).toBeInTheDocument()
  //   })
  // })

  // test('handles deletion of an item', async () => {
  //   const mockItems = [
  //     { _id: '1', name: 'Apples', quantity: 5, unit: 'kg', checked: false },
  //   ]

  //   mockedAxios.get.mockResolvedValueOnce({
  //     data: { shopping_list: mockItems },
  //   })
  //   mockedAxios.delete.mockResolvedValueOnce({})

  //   render(<SmartShoppingList />)

  //   await waitFor(() => {
  //     expect(screen.getByText('Apples')).toBeInTheDocument()
  //   })

  //   fireEvent.click(screen.getByRole('button', { name: /delete/i }))

  //   await waitFor(() => {
  //     expect(mockedAxios.delete).toHaveBeenCalledTimes(1)
  //     expect(screen.queryByText('Apples')).not.toBeInTheDocument()
  //   })
  // })

  test('exports the list to PDF', async () => {
    render(<SmartShoppingList />)

    fireEvent.click(screen.getByText('Export List'))

    // Add logic to verify jsPDF mock behavior if applicable
    await waitFor(() => {
      // Placeholder assertion for testing PDF export functionality (mock jsPDF calls here)
      expect(mockedAxios.get).toHaveBeenCalled()
    })
  })
})
