
import {Route, Routes, Navigate, useLocation} from "react-router";
import {HomePage} from "./pages/HomePage";
import {BookingPage} from "./pages/BookingPage";
import {HeaderComponent} from "./components/layout/HeaderComponent.tsx";
import MobileNavigation from "./components/layout/MobileComponent.tsx";
import {FooterComponent} from "./components/layout/FooterComponent.tsx";
import {useEffect} from "react";
import {ContactPage} from "./pages/ContactPage.tsx";
//import Breadcrumbs from '@mui/material/Breadcrumbs';

function App() {
   const location = useLocation();

   useEffect(() => {
      if (location.hash) {
         setTimeout(() => {
            const element = document.getElementById(location.hash.slice(1));
            //const alignToTop: boolean = true;
            if (element) {
               element.scrollIntoView({behavior: "smooth", block:"start"});
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