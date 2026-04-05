
import {Route, Routes, Navigate} from "react-router";
import {HomePage} from "./pages/HomePage";
import {BookingPage} from "./pages/BookingPage";
import {HeaderComponent} from "./components/HeaderComponent";
import MobileNavigation from "./components/MobileComponent";
import {FooterComponent} from "./components/FooterComponent";
//import Breadcrumbs from '@mui/material/Breadcrumbs';

function App() {
   return (
      <>
         <HeaderComponent/>
         <MobileNavigation />
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />}/>
              <Route path="/home" element={<HomePage />}/>
              <Route path="/booking" element={<BookingPage />}/>
            </Routes>
         <FooterComponent />
      </>
   )
}
export default App