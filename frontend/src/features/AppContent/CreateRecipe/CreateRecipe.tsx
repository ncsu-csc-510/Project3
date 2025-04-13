import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateRecipe.css';

interface RecipeForm {
  name: string;
  description: string;
  category: string;
  tags: string[];
  ingredientQuantities: string[];
  ingredients: string[];
  instructions: string[];
  images: string[];
  cookTime: string;
  prepTime: string;
  totalTime: string;
  servings: string;
  calories: string;
  fat: string;
  saturatedFat: string;
  cholesterol: string;
  sodium: string;
  carbs: string;
  fiber: string;
  sugar: string;
  protein: string;
}

const CreateRecipe: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RecipeForm>({
    name: '',
    description: '',
    category: '',
    tags: [''],
    ingredientQuantities: [''],
    ingredients: [''],
    instructions: [''],
    images: [''],
    cookTime: '',
    prepTime: '',
    totalTime: '',
    servings: '',
    calories: '',
    fat: '',
    saturatedFat: '',
    cholesterol: '',
    sodium: '',
    carbs: '',
    fiber: '',
    sugar: '',
    protein: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userEmail = localStorage.getItem('userEmail');
    
    if (!userEmail) {
      alert('Please log in to create a recipe');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8000/recipe?email=${userEmail}`, formData);
      if (response.status === 200) {
        alert('Recipe created successfully!');
        navigate('/recipes');
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Failed to create recipe. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (index: number, value: string, field: keyof RecipeForm) => {
    if (!Array.isArray(formData[field])) {
      return;
    }
    setFormData(prev => {
      const newArray = [...(prev[field] as string[])];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const addArrayField = (field: keyof RecipeForm) => {
    if (!Array.isArray(formData[field])) {
      return;
    }
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayField = (index: number, field: keyof RecipeForm) => {
    if (!Array.isArray(formData[field])) {
      return;
    }
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="create-recipe-container">
      <h2>Create New Recipe</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Recipe Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Tags</label>
          {formData.tags.map((tag, index) => (
            <div key={index} className="array-input-group">
              <input
                type="text"
                value={tag}
                onChange={(e) => handleArrayInputChange(index, e.target.value, 'tags')}
              />
              <button type="button" onClick={() => removeArrayField(index, 'tags')}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayField('tags')}>Add Tag</button>
        </div>

        <div className="form-group">
          <label>Ingredients *</label>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="array-input-group">
              <input
                type="text"
                placeholder="Quantity"
                value={formData.ingredientQuantities[index]}
                onChange={(e) => handleArrayInputChange(index, e.target.value, 'ingredientQuantities')}
              />
              <input
                type="text"
                placeholder="Ingredient"
                value={ingredient}
                onChange={(e) => handleArrayInputChange(index, e.target.value, 'ingredients')}
                required
              />
              <button type="button" onClick={() => removeArrayField(index, 'ingredients')}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayField('ingredients')}>Add Ingredient</button>
        </div>

        <div className="form-group">
          <label>Instructions *</label>
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="array-input-group">
              <textarea
                value={instruction}
                onChange={(e) => handleArrayInputChange(index, e.target.value, 'instructions')}
                required
              />
              <button type="button" onClick={() => removeArrayField(index, 'instructions')}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayField('instructions')}>Add Instruction</button>
        </div>

        <div className="form-group">
          <label>Images</label>
          {formData.images.map((image, index) => (
            <div key={index} className="array-input-group">
              <input
                type="url"
                placeholder="Image URL"
                value={image}
                onChange={(e) => handleArrayInputChange(index, e.target.value, 'images')}
              />
              <button type="button" onClick={() => removeArrayField(index, 'images')}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayField('images')}>Add Image</button>
        </div>

        <div className="form-group">
          <label htmlFor="cookTime">Cook Time</label>
          <input
            type="text"
            id="cookTime"
            name="cookTime"
            value={formData.cookTime}
            onChange={handleInputChange}
            placeholder="e.g., 30M, 1H"
          />
        </div>

        <div className="form-group">
          <label htmlFor="prepTime">Prep Time</label>
          <input
            type="text"
            id="prepTime"
            name="prepTime"
            value={formData.prepTime}
            onChange={handleInputChange}
            placeholder="e.g., 15M"
          />
        </div>

        <div className="form-group">
          <label htmlFor="servings">Servings</label>
          <input
            type="text"
            id="servings"
            name="servings"
            value={formData.servings}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="calories">Calories</label>
          <input
            type="text"
            id="calories"
            name="calories"
            value={formData.calories}
            onChange={handleInputChange}
          />
        </div>

        <button type="submit" className="submit-button">Create Recipe</button>
      </form>
    </div>
  );
};

export default CreateRecipe; 