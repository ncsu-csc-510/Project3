/*
Copyright (C) 2022 SE CookBook
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com
*/

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import RecipeInformation from './RecipeInformation';
import { ThemeProvider } from '../../Themes/themeContext';

// Performance Test: Component loads within time frame
test('loads within acceptable time frame', async () => {
  const { getByTestId } = render(<ThemeProvider>
      <RecipeInformation />
    </ThemeProvider>);
  await waitFor(() => expect(getByTestId("RecipeInfo-comp-43")).toBeInTheDocument(), { timeout: 1000 });
});

/*
test('shows recipe information correctly', () => {
    const { getByTestId } = render(
    <ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByTestId("RecipeInfo-comp-43")).toBeInTheDocument();
});

// Additional tests

test('renders recipe title', () => {
    const { getByText } = render(
    <ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>
);
    expect(getByText(/Recipe Title/i)).toBeInTheDocument();
});

test('renders recipe image', () => {
    const { getByAltText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByAltText(/Recipe Image/i)).toBeInTheDocument();
});

test('renders ingredients section', async() => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);

    // Wait for the ingredients section to appear in the DOM
    await waitFor(() => getByText(/Ingredients/i));

    expect(getByText(/Ingredients/i)).toBeInTheDocument();
});

test('renders instructions section', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Instructions/i)).toBeInTheDocument();
});

test('renders share on WhatsApp button', () => {
    const { getByText } = render(<ThemeProvider>
        <ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>
      </ThemeProvider>);
    expect(getByText(/Share using WhatsApp/i)).toBeInTheDocument();
});

test('share button triggers WhatsApp sharing', () => {
    window.open = jest.fn();
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    const shareButton = getByText(/Share using WhatsApp/i);
    shareButton.click();
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('https://api.whatsapp.com/send?text='), '_blank');
});

test('renders rating component', () => {
    const { getByTestId } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByTestId("rating-comp")).toBeInTheDocument();
});

test('renders preparation time', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Preparation Time/i)).toBeInTheDocument();
});

test('renders servings information', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Servings/i)).toBeInTheDocument();
});

test('renders author information', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Author/i)).toBeInTheDocument();
});

test('renders category information', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Category/i)).toBeInTheDocument();
});

test('renders cuisine type', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Cuisine/i)).toBeInTheDocument();
});

test('renders difficulty level', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Difficulty/i)).toBeInTheDocument();
});

test('renders nutrition facts', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Nutrition Facts/i)).toBeInTheDocument();
});

test('renders cooking method', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Cooking Method/i)).toBeInTheDocument();
});

test('renders tags section', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Tags/i)).toBeInTheDocument();
});

test('renders source information', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Source/i)).toBeInTheDocument();
});

test('renders date added', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Date Added/i)).toBeInTheDocument();
});

test('renders last updated date', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Last Updated/i)).toBeInTheDocument();
});

test('renders comments section', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Comments/i)).toBeInTheDocument();
});

test('renders related recipes section', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Related Recipes/i)).toBeInTheDocument();
});

test('renders favorite button', () => {
    const { getByTestId } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByTestId("favorite-button")).toBeInTheDocument();
});

test('favorite button toggles favorite state', () => {
    const { getByTestId } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    const favoriteButton = getByTestId("favorite-button");
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'false');
    favoriteButton.click();
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');
});

test('renders video tutorial if available', () => {
    const { queryByTestId } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(queryByTestId("video-tutorial")).toBeInTheDocument();
});

test('renders no video message if video not available', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    // Assuming the component shows this text when no video is available
    expect(getByText(/No video tutorial available/i)).toBeInTheDocument();
});

test('renders allergens information', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Allergens/i)).toBeInTheDocument();
});

test('renders estimated cost', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Estimated Cost/i)).toBeInTheDocument();
});

// Additional tests

test('renders recipe title', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Recipe Title/i)).toBeInTheDocument();
});

test('renders recipe image', () => {
    const { getByAltText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByAltText(/Recipe Image/i)).toBeInTheDocument();
});

test('renders ingredients section', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Ingredients/i)).toBeInTheDocument();
});

test('renders instructions section', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Instructions/i)).toBeInTheDocument();
});

test('renders share on WhatsApp button', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Share using WhatsApp/i)).toBeInTheDocument();
});

test('share button triggers WhatsApp sharing', () => {
    window.open = jest.fn();
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    const shareButton = getByText(/Share using WhatsApp/i);
    shareButton.click();
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('https://api.whatsapp.com/send?text='), '_blank');
});

test('renders rating component', () => {
    const { getByTestId } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByTestId("rating-comp")).toBeInTheDocument();
});

test('renders preparation time', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Preparation Time/i)).toBeInTheDocument();
});

test('renders servings information', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Servings/i)).toBeInTheDocument();
});

test('renders author information', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Author/i)).toBeInTheDocument();
});

test('renders category information', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Category/i)).toBeInTheDocument();
});

test('renders cuisine type', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Cuisine/i)).toBeInTheDocument();
});

test('renders difficulty level', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Difficulty/i)).toBeInTheDocument();
});

test('renders nutrition facts', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Nutrition Facts/i)).toBeInTheDocument();
});

test('renders cooking method', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Cooking Method/i)).toBeInTheDocument();
});

test('renders tags section', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Tags/i)).toBeInTheDocument();
});

test('renders source information', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Source/i)).toBeInTheDocument();
});

test('renders date added', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Date Added/i)).toBeInTheDocument();
});

test('renders last updated date', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Last Updated/i)).toBeInTheDocument();
});

test('renders comments section', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Comments/i)).toBeInTheDocument();
});

test('renders related recipes section', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Related Recipes/i)).toBeInTheDocument();
});

test('renders favorite button', () => {
    const { getByTestId } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByTestId("favorite-button")).toBeInTheDocument();
});

test('favorite button toggles favorite state', () => {
    const { getByTestId } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    const favoriteButton = getByTestId("favorite-button");
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'false');
    favoriteButton.click();
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');
});

test('renders video tutorial if available', () => {
    const { queryByTestId } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(queryByTestId("video-tutorial")).toBeInTheDocument();
});

test('renders no video message if video not available', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    // Assuming the component shows this text when no video is available
    expect(getByText(/No video tutorial available/i)).toBeInTheDocument();
});

test('renders allergens information', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Allergens/i)).toBeInTheDocument();
});

test('renders estimated cost', () => {
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Estimated Cost/i)).toBeInTheDocument();
});

test('formats bold text correctly', () => {
    const { container } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    const boldText = container.querySelector('strong');
    expect(boldText).toBeInTheDocument();
    expect(boldText).toHaveTextContent('Bold Text');
});

test('formats list items correctly', () => {
    const { container } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    const listItems = container.querySelectorAll('li');
    expect(listItems.length).toBe(2);
    expect(listItems[0]).toHaveTextContent('List Item 1');
    expect(listItems[1]).toHaveTextContent('List Item 2');
});

test('formats regular text correctly', () => {
    const { container } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(2); // One for bold text, one for regular text
    expect(paragraphs[1]).toHaveTextContent('Regular text.');
});

// Accessibility Test: Ensure all images have alt text
test('all images have alt text', () => {
    const { getAllByRole } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    const images = getAllByRole('img');
    images.forEach(img => expect(img).toHaveAttribute('alt'));
});

// Responsive Design Test: Component renders correctly on mobile
test('renders correctly on mobile', () => {
    global.innerWidth = 500; // Simulate mobile width
    const { getByTestId } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByTestId("RecipeInfo-comp-43")).toBeInTheDocument();
    global.innerWidth = 1024; // Reset to default after test
});

// Error Handling Test: Simulate a network error
test('displays error message on network failure', () => {
    jest.spyOn(global, 'fetch').mockImplementation(() => 
        Promise.reject(new Error('Network error'))
    );
    const { getByText } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByText(/Failed to load recipe data/i)).toBeInTheDocument();
});

// Loading State Test: Verify loading spinner is shown
test('shows loading spinner while fetching data', () => {
    const { getByTestId } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    expect(getByTestId("loading-spinner")).toBeInTheDocument();
});

// Interaction Test: Hover over an element
test('shows tooltip on hover over help icon', () => {
    const { getByTestId } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    fireEvent.mouseOver(getByTestId("help-icon"));
    expect(getByTestId("tooltip")).toBeInTheDocument();
});

// Performance Test: Component loads within time frame
test('loads within acceptable time frame', async () => {
    const { getByTestId } = render(<ThemeProvider>
        <RecipeInformation />
      </ThemeProvider>);
    await waitFor(() => expect(getByTestId("RecipeInfo-comp-43")).toBeInTheDocument(), { timeout: 1000 });
});

*/