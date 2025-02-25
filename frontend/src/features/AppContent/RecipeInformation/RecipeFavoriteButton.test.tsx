import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import RecipeFavoriteButton from "./RecipeFavoriteButton";

const mockRecipe = {
  name: "Chocolate Cake",
  ingredients: ["Flour", "Sugar", "Cocoa"],
  rating: 5,
  prepTime: "30 mins",
  sugar: 10,
  carbs: 50,
  protein: 5,
  category: "Dessert",
  servings: 4,
  cookTime: "40 mins",
  cholesterol: 5,
  fat: 20,
  instructions: ["Mix ingredients", "Bake for 40 mins"],
  images: ["cake.jpg"],
  id: "12345",
};

describe("RecipeFavoriteButton", () => {
  beforeEach(() => {
    localStorage.clear(); // Clear localStorage before each test
  });

  test("does not render when recipe is null", () => {
    const { container } = render(<RecipeFavoriteButton recipe={null} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders star icon button", () => {
    render(<RecipeFavoriteButton recipe={mockRecipe} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("adds recipe to favorites on click", () => {
    render(<RecipeFavoriteButton recipe={mockRecipe} />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    const storedFavorites = JSON.parse(localStorage.getItem("favorites") ?? "[]");
    expect(storedFavorites).toHaveLength(1);
    expect(storedFavorites[0].name).toBe(mockRecipe.name);
  });

  test("removes recipe from favorites on second click", () => {
    localStorage.setItem("favorites", JSON.stringify([mockRecipe]));
    
    render(<RecipeFavoriteButton recipe={mockRecipe} />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button); // Removes favorite
    
    const storedFavorites = JSON.parse(localStorage.getItem("favorites") ?? "[]");
    expect(storedFavorites).toHaveLength(0);
  });

  test("star icon color updates based on favorite status", () => {
    render(<RecipeFavoriteButton recipe={mockRecipe} />);
    
    const starIcon = screen.getByRole("button").querySelector("svg");
    expect(starIcon).toHaveStyle("color: transparent"); // Initially not favorited
    
    fireEvent.click(screen.getByRole("button")); // Add to favorites
    expect(starIcon).toHaveStyle("color: gold");
    
    fireEvent.click(screen.getByRole("button")); // Remove from favorites
    expect(starIcon).toHaveStyle("color: transparent");
  });
});
