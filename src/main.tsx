import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { StyledEngineProvider } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import { BrowserRouter } from "react-router";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <StyledEngineProvider enableCssLayer>
                <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
                <App />
            </StyledEngineProvider>
        </BrowserRouter>
    </StrictMode>,
)