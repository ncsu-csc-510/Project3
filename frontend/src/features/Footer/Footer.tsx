import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { useTheme } from '../Themes/themeContext';
import themes from '../Themes/themes';

/**
 * File name: Footer.tsx
 * Task - This component displays the footer section of the application with links to important pages,
 * contact information, and social media links.
 * @author CookBook Team
 */

const Footer: React.FC = () => {
  const { theme, themeName, toggleTheme } = useTheme();
  const currentYear = new Date().getFullYear();

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    toggleTheme(event.target.value);
  };

  return (
    <footer className="footer" style={{ backgroundColor: theme.background, color: theme.color }}>
      <div className="footer-container">
        <div className="footer-section">
          <h3>Cook Book</h3>
          <p>Your personal recipe management and meal planning assistant.</p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/home" style={{ color: theme.color }}>Home</Link></li>
            <li><Link to="/recipe-list" style={{ color: theme.color }}>Recipes</Link></li>
            <li><Link to="/meal" style={{ color: theme.color }}>Meal Plan</Link></li>
            <li><Link to="/shoppinglist" style={{ color: theme.color }}>Shopping List</Link></li>
            <li><Link to="/favorites" style={{ color: theme.color }}>Favorites</Link></li>
            <li><Link to="/add-recipe" style={{ color: theme.color }}>Add Recipe</Link></li>
            <li><Link to="/what-to-eat" style={{ color: theme.color }}>What to Eat</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Information</h3>
          <ul>
            <li><Link to="/about" style={{ color: theme.color }}>About Us</Link></li>
            <li><Link to="/faq" style={{ color: theme.color }}>FAQs</Link></li>
            <li><Link to="/contact" style={{ color: theme.color }}>Contact Us</Link></li>
            <li><Link to="/privacy" style={{ color: theme.color }}>Privacy Policy</Link></li>
            <li><Link to="/terms" style={{ color: theme.color }}>Terms of Service</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <ul className="contact-info">
            <li><i className="fas fa-envelope"></i> help.cookbook@gmail.com</li>
            <li><i className="fas fa-phone"></i> +1 (555) 123-4567</li>
            <li><i className="fas fa-map-marker-alt"></i> Raleigh, NC, USA</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="theme-selector">
          <label htmlFor="theme-dropdown" style={{ color: theme.color, marginRight: '10px' }}>
            Select Theme:
          </label>
          <select
            id="theme-dropdown"
            onChange={handleThemeChange}
            value={themeName}
            style={{
              backgroundColor: theme.background,
              color: theme.color,
              cursor: 'pointer',
              border: `1px solid ${theme.color}`,
              padding: '5px 10px',
              borderRadius: '4px',
            }}
          >
            {Object.keys(themes).map((themeName) => (
              <option
                key={themeName}
                value={themeName}
                style={{
                  backgroundColor: themes[themeName as keyof typeof themes].background,
                  color: themes[themeName as keyof typeof themes].color,
                }}
              >
                {themeName}
              </option>
            ))}
          </select>
        </div>
        <p>&copy; {currentYear} Cook Book. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 