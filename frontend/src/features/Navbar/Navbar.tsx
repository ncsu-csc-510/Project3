/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

import React from 'react'

import './Navbar.css'
import { useTheme } from '../Themes/themeContext'
import themes from '../Themes/themes'
/**
 * File name: Navbar.tsx
 * Task - Home, About, Contact options available for the user on the Navigation Bar.
 * @author Asrita Kuchibhotla
 */

function Navbar() {
  const { theme, toggleTheme } = useTheme()

  // Function to handle theme change
  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    toggleTheme(event.target.value)
  }

  return (
    <section className="navbar" style={{ backgroundColor: theme.background }}>
      <a href="/" className="navbar-item" style={{ color: theme.color }}>
        Home
      </a>
      <a href="/meal" className="navbar-item" style={{ color: theme.color }}>
        Meal Plan
      </a>
      <a href="/about" className="navbar-item" style={{ color: theme.color }}>
        About
      </a>
      <a href="/faq" className="navbar-item" style={{ color: theme.color }}>
        FAQs
      </a>
      <a href="/contact" className="navbar-item" style={{ color: theme.color }}>
        Contact Us
      </a>
      <a
        href="/shoppinglist"
        className="navbar-item"
        style={{ color: theme.color }}
      >
        Shopping List
      </a>
      {/* Theme Dropdown */}

      <div className="theme-selector">
        <label htmlFor="theme-dropdown" style={{ color: theme.color }}>
          Select Theme:
        </label>
        <select
          id="theme-dropdown"
          onChange={handleThemeChange}
          value={Object.keys(themes).find(
            (themeName) =>
              themes[themeName as keyof typeof themes].background ===
              theme.background
          )}
          style={{
            backgroundColor: theme.background,
            color: theme.color,
            cursor: 'pointer',
            border: `1px solid ${theme.color}`,
          }}
        >
          {Object.keys(themes).map((themeName) => (
            <option
              key={themeName}
              value={themeName}
              style={{
                backgroundColor:
                  themes[themeName as keyof typeof themes].background,
                color: themes[themeName as keyof typeof themes].color,
              }}
            >
              {themeName}
            </option>
          ))}
        </select>
      </div>
      <a href="/signup" className="navbar-item" style={{ color: theme.color }}>
        Signup
      </a>
    </section>
  )
}

export default Navbar
