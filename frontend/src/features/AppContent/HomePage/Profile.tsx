import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";
import { Grid } from "@mui/material";

interface ProfileData {
  name: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  activityLevel: string;
  goal: string;
  goalWeight?: number;
  targetDate?: string;
  dietaryRestrictions?: string[];
}

const Profile: React.FC = () => {
  // Initialize state with empty values
  const [userData, setUserData] = useState<ProfileData>({
    name: "",
    email: "",
    age: 0,
    weight: 0,
    height: 0,
    activityLevel: "moderate",
    goal: "maintain",
    goalWeight: 0,
    targetDate: "",
    dietaryRestrictions: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Activity level options
  const activityLevels = [
    { value: "sedentary", label: "Sedentary (little or no exercise)" },
    { value: "light", label: "Lightly active (light exercise 1-3 days/week)" },
    { value: "moderate", label: "Moderately active (moderate exercise 3-5 days/week)" },
    { value: "very", label: "Very active (hard exercise 6-7 days/week)" },
    { value: "extra", label: "Extra active (very hard exercise & physical job)" }
  ];

  // Goal options
  const goalOptions = [
    { value: "lose", label: "Lose Weight" },
    { value: "maintain", label: "Maintain Weight" },
    { value: "gain", label: "Gain Weight" }
  ];

  // Dietary restriction options
  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "Gluten-Free",
    "Dairy-Free",
    "Low-Carb",
    "Keto",
    "Paleo",
    "Mediterranean"
  ];

  // Function to fetch profile from the backend
  const fetchProfile = async () => {
    try {
      // Get the email from localStorage
      const userEmail = localStorage.getItem("userEmail");
      const userName = localStorage.getItem("userName");
      
      if (!userEmail) {
        throw new Error("No user email found. Please log in.");
      }

      // Set initial data from localStorage
      setUserData(prev => ({
        ...prev,
        email: userEmail,
        name: userName || ""
      }));

      // Fetch additional profile data from the backend
      const response = await axios.get("http://127.0.0.1:8000/user/profile", {
        params: { email: userEmail },
      });
      
      // Update with any additional data from the backend
      if (response.data) {
        // Ensure numeric fields are properly converted
        const profileData = {
          ...response.data,
          age: Number(response.data.age) || 0,
          weight: Number(response.data.weight) || 0,
          height: Number(response.data.height) || 0,
          goalWeight: Number(response.data.goalWeight) || 0,
          dietaryRestrictions: Array.isArray(response.data.dietaryRestrictions) 
            ? response.data.dietaryRestrictions 
            : []
        };
        
        setUserData(prev => ({
          ...prev,
          ...profileData
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox changes for dietary restrictions
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setUserData(prev => {
      const currentRestrictions = [...(prev.dietaryRestrictions || [])];
      
      if (checked) {
        // Add the restriction if it's not already there
        if (!currentRestrictions.includes(value)) {
          currentRestrictions.push(value);
        }
      } else {
        // Remove the restriction if it's there
        const index = currentRestrictions.indexOf(value);
        if (index !== -1) {
          currentRestrictions.splice(index, 1);
        }
      }
      
      return {
        ...prev,
        dietaryRestrictions: currentRestrictions
      };
    });
  };

  // Save profile data
  const saveProfile = async () => {
    setSaving(true);
    setMessage("");
    
    try {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        throw new Error("No user email found. Please log in.");
      }
      
      // Create a copy of userData without the email field to avoid duplication
      const { email, ...profileData } = userData;
      
      await axios.put(`http://127.0.0.1:8000/user/profile?email=${encodeURIComponent(userEmail)}`, profileData);
      
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          {/* Basic Information */}
          <div className="profile-section">
            <h3>Basic Information</h3>
            <div className="profile-details">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  className="form-control"
                  readOnly
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  className="form-control"
                  readOnly
                />
              </div>
            </div>

            {/* Personal Information */}
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={userData.age}
                  onChange={handleInputChange}
                  className="form-control"
                  min="1"
                  max="120"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={userData.weight}
                  onChange={handleInputChange}
                  className="form-control"
                  min="20"
                  max="300"
                  step="0.1"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="height">Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={userData.height}
                  onChange={handleInputChange}
                  className="form-control"
                  min="100"
                  max="250"
                />
              </div>
            </div>
          </div>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <div className="profile-section">
            <h3>Fitness Goals</h3>
            <div className="form-group">
              <label htmlFor="activityLevel">Activity Level</label>
              <select
                id="activityLevel"
                name="activityLevel"
                value={userData.activityLevel}
                onChange={handleInputChange}
                className="form-control"
              >
                {activityLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="goal">Goal</label>
              <select
                id="goal"
                name="goal"
                value={userData.goal}
                onChange={handleInputChange}
                className="form-control"
              >
                {goalOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {userData.goal !== "maintain" && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="goalWeight">Goal Weight (kg)</label>
                  <input
                    type="number"
                    id="goalWeight"
                    name="goalWeight"
                    value={userData.goalWeight}
                    onChange={handleInputChange}
                    className="form-control"
                    min="20"
                    max="300"
                    step="0.1"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="targetDate">Target Date</label>
                  <input
                    type="date"
                    id="targetDate"
                    name="targetDate"
                    value={userData.targetDate}
                    onChange={handleInputChange}
                    className="form-control"
                  />
                </div>
              </div>
            )}

            <h3>Dietary Preferences</h3>
            <div className="dietary-restrictions">
              {dietaryOptions.map(option => (
                <div key={option} className="checkbox-group">
                  <input
                    type="checkbox"
                    id={`dietary-${option}`}
                    value={option}
                    checked={userData.dietaryRestrictions?.includes(option) || false}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor={`dietary-${option}`}>{option}</label>
                </div>
              ))}
            </div>
          </div>
        </Grid>
      </Grid>

      {message && (
        <div className={`message ${message.includes("successfully") ? "success" : "error"}`}>
          {message.includes("successfully") ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#065f46"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#991b1b"/>
            </svg>
          )}
          {message}
        </div>
      )}
      
      <button 
        className="btn-primary" 
        onClick={saveProfile}
        disabled={saving}
      >
        {saving ? (
          <>
            <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
              <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z" fill="white"/>
            </svg>
            Saving...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
              <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM6 6h9v4H6V6z" fill="white"/>
            </svg>
            Save Profile
          </>
        )}
      </button>
    </div>
  );
};

export default Profile;
