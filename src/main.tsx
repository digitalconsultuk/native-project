
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'
import { StyledEngineProvider } from '@mui/material/styles';
import GlobalStyles from '@mui/material/GlobalStyles';
import { BrowserRouter } from "react-router";
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <BrowserRouter>
            <StyledEngineProvider enableCssLayer>
                <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
                <App />
            </StyledEngineProvider>
        </BrowserRouter>
    </GoogleOAuthProvider>
)