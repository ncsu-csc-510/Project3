/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from './Header';
import { ThemeProvider } from '../Themes/themeContext'; // Adjust the import path if needed

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

test('shows header correctly', () => {
  const { getByText } = renderWithProviders(<Header />);
  expect(getByText("Cook Book")).toBeInTheDocument();
});

test('has navbar component', () => {
  const { getByTestId } = renderWithProviders(<Header />);
  expect(getByTestId("nav-comp-43")).toBeInTheDocument();
});

