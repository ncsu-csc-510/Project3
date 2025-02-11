/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

import React from 'react';
import './HomePage.css';
import { useTheme } from '../../Themes/themeContext'

const AboutPage = () => {
  const { theme } = useTheme();
  return (
    <div style={{ backgroundColor: theme.background, color: theme.color }}>
     
        <h2 >About us :</h2>
        <ul>
            <li>Most of us might have been in a situation where you are craving for something to eat and 
                due to some reason it won't be delivered to your place. And then you decide to cook it yourself you can't 
                find a recipe with the ingredients you have.</li>
            <li>In this fast-paced world, we are often confused about what can be cooked with the 
            ingredients that are available right away. </li>
            <li>CookBook addresses this issue and is designed to suggest recipes to you which would 
            use the key ingredients that are available with you.</li>
            <li>It not only suggests the recipe based on the ingredients entered by you, it also gives 
            the ratings, step-by-step cooking instructions and other granular details about the recipe.</li>
            <li>Apart from giving the user a smooth and a stress-free experience, it also serves as a platform 
            to find recipes across multiple cuisines and cultures.</li>
            <li>CookBook is very simple to use. You just have to enter the available ingredients in the search bar 
                and click on the proceed icon to get a list of suggestions for recipes.
            </li>
        </ul>
    </div>
  );
};

export default AboutPage;
