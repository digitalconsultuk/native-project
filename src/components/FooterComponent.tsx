/**
 *  Footer Component
 * */
import * as React from "react";
import { Link } from "react-router";
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const FooterComponent: React.FunctionComponent = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border border-gray-200 pt-16 pb-8 px-6 font-mono mt-0">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16 justify-items-center">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-xl font-bold mb-6 text-black relative inline-block">
              Quick Links
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-27 h-1 bg-amber-500 block"></span>
            </h3>
            <ul className="flex flex-col gap-4">
              <li>
                <Link to="/home" className="text-gray-600 hover:text-blue-600 transition-all hover:pl-2">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-all hover:pl-2">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-all hover:pl-2">Contact</Link>
              </li>
              <li>
                <Link to="/home#menusection" className="text-gray-600 hover:text-blue-600 transition-all hover:pl-2">Our Menu</Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center text-center">
            <h3 className="text-xl font-bold mb-6 text-black relative inline-block">
              Services
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-25 h-1 bg-amber-500 mt-1 block"></span>
            </h3>
            <ul className="flex flex-col gap-4">
              <li className="text-gray-600">Fine Dining</li>
              <li className="text-gray-600">Event Catering</li>
              <li className="text-gray-600">Private Parties</li>
              <li className="text-gray-600">Takeaway</li>
            </ul>
          </div>

          <div className="flex flex-col items-center text-center">
            <h3 className="text-xl font-bold mb-6 text-black relative inline-block">
              Contact Us
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-27 h-1 bg-amber-500 mt-1 block"></span>
            </h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-4 text-gray-600">
                <LocationOnIcon className="text-amber-500 mt-1 -mr-3" />
                <span className="max-w-50">123 Culinary Street, Foodie City, FC 45678</span>
              </li>
              <li className="flex items-center gap-4 text-gray-600">
                <LocalPhoneIcon className="text-amber-500" />
                <span>01913434344</span>
              </li>
              <li className="flex items-center gap-4 text-gray-600">
                <EmailIcon className="text-amber-500" />
                <span>hello@nativecave.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm tracking-widest uppercase">
            &copy; {currentYear} Native Cave. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export { FooterComponent };