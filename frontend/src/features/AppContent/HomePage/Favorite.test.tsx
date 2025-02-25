import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Favorites from "./Favorite";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

const mockStore = configureStore();

const mockFavorites = [
  {
    _id: "1",
    name: "Chocolate Cake",
    ingredients: ["Flour", "Sugar", "Cocoa"],
    rating: 5,
    prepTime: "30 mins",
    sugar: 20,
    carbs: 40,
    protein: 5,
    category: "Dessert",
    servings: 4,
    cookTime: "45 mins",
    cholesterol: 10,
    fat: 10,
    instructions: ["Mix ingredients", "Bake at 350°F"],
    images: ["https://example.com/cake.jpg"],
  },
];

describe("Favorites Component", () => {
let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore({
      // Add necessary state mocks here if needed
    });

    localStorage.setItem("favorites", JSON.stringify(mockFavorites));
  });

  it("renders 'No favorite recipes yet' message when there are no favorites", () => {
    localStorage.setItem("favorites", JSON.stringify([])); // Simulate no favorites

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Favorites />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText("No favorite recipes yet")).toBeInTheDocument();
    expect(
      screen.getByText("Start adding your favorite recipes to create your personal cookbook!")
    ).toBeInTheDocument();
  });

  it("renders favorite recipes when available", () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Favorites />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText("Your Favorite Recipes")).toBeInTheDocument();
    expect(screen.getByText("Chocolate Cake")).toBeInTheDocument();
    expect(screen.getByText("Dessert • 2 steps")).toBeInTheDocument();
    expect(screen.getByText("4 servings • 30 mins prep time")).toBeInTheDocument();
  });

  it("removes a favorite recipe when delete button is clicked", () => {
    window.confirm = jest.fn(() => true); // Simulate user clicking "OK" in confirmation dialog

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Favorites />
        </BrowserRouter>
      </Provider>
    );

    const removeButton = screen.getByRole("button", { name: /close/i });

    fireEvent.click(removeButton);

    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to remove this recipe from your favorites?"
    );
    expect(localStorage.getItem("favorites")).toBe(JSON.stringify([]));
  });
});
