/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

import React from 'react';
import logo from './photos/logo.png';
import './HomePage.css';
import { useTheme } from '../../Themes/themeContext'

const ContactPage = () => {
  const { theme } = useTheme();
  return (
    <div className="contact" style={{ backgroundColor: theme.background, color: theme.color }}> 
        <h2>Contact us :</h2>
        <img src={logo} width="700" alt="logo"/>
        <p style={{ color: theme.color }}>In case of any queries and for additional help, please email us at: <a className='email' href="mailto:help.cookbook@gmail.com" style={{ color: theme.headerColor }}>help.cookbook@gmail.com</a></p>
    </div>
  );
};

export default ContactPage;
