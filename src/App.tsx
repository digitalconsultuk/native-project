
import {Route, Routes, Navigate} from "react-router";
import {HomePage} from "./pages/HomePage";
import {HeaderComponent} from "./components/HeaderComponent";
import MobileNavigation from "./components/MobileComponent";
//import Breadcrumbs from '@mui/material/Breadcrumbs';

function App() {
   return (
      <>
         <HeaderComponent/>
         <MobileNavigation />
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />}/>
              <Route path="/home" element={<HomePage />}/>
            </Routes>
      </>
   )
}
export default App