import React from 'react'

/*

Copyright (C) 2022 SE CookBook - All Rights Reserved
You may use, distribute and modify this code under the
terms of the MIT license.
You should have received a copy of the MIT license with
this file. If not, please write to: help.cookbook@gmail.com

*/

import './Header.css'
import Navbar from '../Navbar/Navbar'
import { useTheme } from '../Themes/themeContext'
/**
 * File name: Header.tsx
 * Functional component displaying the top navigation bar.
 * Task - This component is responsible for the static header seen throughout the application with the option to navigate back to home
 * and provides 'Contact' and 'About' information.
 * @author Asrita Kuchibhotla
 */

const Header = () => {
  const { theme } = useTheme();
  return (
    <section className="header" style={{ backgroundColor: theme.background, color: theme.color }}>
      <section className="header-top">
        <section className="header-top__logo">
          <a href="/" className="header-logo" style={{ color: theme.headerColor }}>
            Cook Book
          </a>
        </section>
        <section className="header-top__navbar" data-testid="nav-comp-43">
          <section className="header-top__navigation">
            <Navbar />
          </section>
          <hr className="header-top__seperator" />
        </section>
      </section>
      {/* <section className="header-bottom">
        <section className="header-bottom__phone">
          99999999999
        </section>
        <section className="header-bottom__email">
          shop.info@gmail.com
        </section>
      </section> */}
    </section>
  )
}

export default Header
