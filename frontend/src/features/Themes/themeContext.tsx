    import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
    import themes from './themes'; 

    // Define the type for a single theme
    interface Theme {
        background: string;
        color: string;
        headerColor: string;
    }

    // Define the type for the themes object
    type Themes = {
        [key: string]: Theme;
    };

    // Define the context value type
    interface ThemeContextType {
        theme: Theme; // Current theme object
        themeName: string; // Name of the current theme
        toggleTheme: (name: string) => void; // Function to change the theme
    }

    // Define the props for ThemeProvider
    interface ThemeProviderProps {
        children: ReactNode; // Children components to be rendered
    }

    // Ensure the imported themes match the Themes type
    const typedThemes: Themes = themes; // Cast or validate the themes object

    // Create a context with an initial value of `null` (it will be provided later)
    const ThemeContext = createContext<ThemeContextType | null>(null);

    // ThemeProvider component to wrap your app
    export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
        // Get the saved theme from local storage or default to 'cozyKitchen'
        const savedTheme = localStorage.getItem('themeName') || 'cozyKitchen';

        // Validate the savedTheme against available themes, default if invalid
        const isValidTheme = Object.keys(typedThemes).includes(savedTheme);
        const [themeName, setThemeName] = useState<string>(isValidTheme ? savedTheme : 'cozyKitchen');

        // Save the current theme to local storage whenever it changes
        useEffect(() => {
            localStorage.setItem('themeName', themeName);
        }, [themeName]);

        // Function to toggle the theme
        const toggleTheme = (name: string) => {
            if (typedThemes[name]) {
                setThemeName(name);
            } else {
                console.warn(`Theme "${name}" does not exist in themes object.`);
            }
        };

        // Get the current theme object
        const theme = typedThemes[themeName];

        return (
            <ThemeContext.Provider value={{ theme, toggleTheme, themeName }}>
                {children} {/* Render all child components */}
            </ThemeContext.Provider>
        );
    };

    // Custom hook to use the ThemeContext
    export const useTheme = (): ThemeContextType => {
        const context = useContext(ThemeContext);

        if (!context) {
            throw new Error('useTheme must be used within a ThemeProvider');
        }

        return context;
    };
