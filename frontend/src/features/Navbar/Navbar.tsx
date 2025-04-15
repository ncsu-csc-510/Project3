import React from 'react'
import { useNavigate } from 'react-router-dom'

/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

import './Navbar.css'
import { useTheme } from '../Themes/themeContext'
import themes from '../Themes/themes'
/**
 * File name: Navbar.tsx
 * Task - Home, About, Contact options available for the user on the Navigation Bar.
 * @author Asrita Kuchibhotla
 */

function Navbar() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const userEmail = localStorage.getItem('userEmail')
  const userName = localStorage.getItem('userName')

  const handleLogout = () => {
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    navigate('/login')
  }

  return (
    <section className="navbar" style={{ backgroundColor: theme.background }}>
      {userEmail ? (
        <>
          <div className="navbar-left">
            <a href="/home" className="navbar-item" style={{ color: theme.color }}>
              Home
            </a>
            <a href="/meal" className="navbar-item" style={{ color: theme.color }}>
              Meal Plan
            </a>
            <a href="/shoppinglist" className="navbar-item" style={{ color: theme.color }}>
              Shopping List
            </a>
            <a href="/favorites" className="navbar-item" style={{ color: theme.color }}>
              Favorites
            </a>
            <a href="/add-recipe" className="navbar-item" style={{ color: theme.color }}>
              Add recipe
            </a>
            <a href="/what-to-eat" className="navbar-item" style={{ color: theme.color }}>
              What to Eat
            </a>
          </div>
          <div className="navbar-right">
            <div className="user-section">
              <span className="user-name" style={{ color: theme.color }}>
                Welcome, {userName}
              </span>
              <button
                className="logout-button"
                onClick={handleLogout}
                style={{ color: theme.color }}
              >
                Logout
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="navbar-right">
          <a href="/login" className="navbar-item" style={{ color: theme.color }}>
            Login
          </a>
          <a href="/signup" className="navbar-item" style={{ color: theme.color }}>
            Sign Up
          </a>
        </div>
      )}
    </section>
  )
}

export default Navbar
