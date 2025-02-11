import React, { useState, useEffect } from 'react';
import './HomePage.css';
import { useTheme } from '../../Themes/themeContext';
import axios from "axios";

const MealPage = () => {
  const { theme } = useTheme();
  const [mealPlan, setMealPlan] = useState<any[]>(Array(7).fill(null)); // One meal per day

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const response = await axios.get("http://localhost:8000/recipe/meal-plan/");
        const updatedMealPlan = Array(7).fill(null); 
        response.data.forEach((entry: any) => {
          if (entry.recipe) {
            updatedMealPlan[entry.day] = entry.recipe;
          }
        });
        setMealPlan(updatedMealPlan); // Update the state with the fetched meal plan
      } catch (error) {
        console.error("Error fetching meal plan:", error);
      }
    };
  
    fetchMealPlan();
  }, []);

  const printMealPlan = () => {
    window.print();
  };

  return (
    <div style={{ backgroundColor: theme.background, color: theme.color, padding: '20px' }}>
      <h2>My Meal Plan</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid', padding: '8px' }}>Day</th>
            <th style={{ border: '1px solid', padding: '8px' }}>Recipe</th>
            <th style={{ border: '1px solid', padding: '8px' }}>Steps</th>
          </tr>
        </thead>
        <tbody>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid', padding: '8px' }}>{day}</td>
              <td style={{ border: '1px solid', padding: '8px' }}>
                {mealPlan[index]?.name || 'No meal planned'}
              </td>
              <td style={{ border: '1px solid', padding: '8px' }}>
                {mealPlan[index]?.instructions?.join(', ') || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={printMealPlan} style={{
      backgroundColor: theme.headerColor,
      color: theme.color,
      marginRight: '10px',
      transition: 'transform 0.2s ease, background-color 0.2s ease',
      marginTop: '20px', padding: '10px 20px'
    }} onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = theme.background)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = theme.headerColor)
      }>
        Print Meal Plan
      </button>
    </div>
  );
};

export default MealPage;
