import { Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Theme {
    background: string;
    color: string;
    headerColor: string;
  }
  interface ThemeOptions {
    background: string;
    color: string;
    headerColor: string;
  }
} 