
import {Route, Routes} from "react-router";
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
               <Route path="/home" element={<HomePage/>}/>
            </Routes>
      </>
   )
}
export default App