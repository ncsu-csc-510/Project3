/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

import React from 'react';
import { getByDisplayValue, getByLabelText, getByTitle, render, screen } from '@testing-library/react';
import HomePage from './HomePage';

test('images being showed correctly', () => {
    const {getByAltText} = render(<HomePage />);
    expect(getByAltText("first image")).toBeInTheDocument();
});

test('images being showed correctly', () => {
  const {getByAltText} = render(<HomePage />);
  expect(getByAltText("second image")).toBeInTheDocument();
});

test('images being showed correctly', () => {
  const {getByAltText} = render(<HomePage />);
  expect(getByAltText("third image")).toBeInTheDocument();
});

test('images being showed correctly', () => {
  const {getByAltText} = render(<HomePage />);
  expect(getByAltText("fourth image")).toBeInTheDocument();
});

test('images being showed correctly', () => {
  const {getByAltText} = render(<HomePage />);
  expect(getByAltText("fifth image")).toBeInTheDocument();
});

test('images being showed correctly', () => {
  const {getByAltText} = render(<HomePage />);
  expect(getByAltText("sixth image")).toBeInTheDocument();
});

test('images being showed correctly', () => {
  const {getByAltText} = render(<HomePage />);
  expect(getByAltText("seventh image")).toBeInTheDocument();
});

test('images being showed correctly', () => {
  const {getByAltText} = render(<HomePage />);
  expect(getByAltText("eighth image")).toBeInTheDocument();
});

test('images being showed correctly', () => {
  const {getByAltText} = render(<HomePage />);
  expect(getByAltText("nineth image")).toBeInTheDocument();
});

test('images being showed correctly', () => {
  const {getByAltText} = render(<HomePage />);
  expect(getByAltText("tenth image")).toBeInTheDocument();
});