
import {Route, Routes, Navigate, useLocation} from "react-router";
import {HomePage} from "./pages/HomePage";
import {BookingPage} from "./pages/BookingPage";
import {HeaderComponent} from "./components/HeaderComponent";
import MobileNavigation from "./components/MobileComponent";
import {FooterComponent} from "./components/FooterComponent";
import {useEffect} from "react";
import {ContactPage} from "./pages/ContactPage.tsx";
//import Breadcrumbs from '@mui/material/Breadcrumbs';

function App() {
   const location = useLocation();

   useEffect(() => {
      if (location.hash) {
         setTimeout(() => {
            const element = document.getElementById(location.hash.slice(1));
            if (element) {
               element.scrollIntoView({ behavior: 'smooth' });
            }
         }, 100);
      } else {
         window.scrollTo(0, 0);
      }
   }, [location]);

   return (
      <>
         <HeaderComponent/>
         <MobileNavigation />
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />}/>
              <Route path="/home" element={<HomePage />}/>
              <Route path="/booking" element={<BookingPage />}/>
              <Route path="/contact" element={<ContactPage />}/>
            </Routes>
         <FooterComponent />
      </>
   )
}
export default App