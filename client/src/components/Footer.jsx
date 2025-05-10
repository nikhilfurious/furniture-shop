import React from "react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { MdPhone } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 py-4 text-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Copyright */}
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <img 
                src="/logo.jpeg" 
                alt="Furnish Logo" 
                className="h-16 mr-4"
              />
              <span className="text-sm">
                © {new Date().getFullYear()}, All Rights Reserved FURNISH RENT.
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center mb-4 md:mb-0 ">
            <a href="/policy" className="mx-3 hover:text-gray-300 text-sm">
              Terms and Conditions
            </a>
            <a href="/policy" className="mx-3 hover:text-gray-300 text-sm">
              Delivery Policy
            </a>
            <a href="/contact" className="mx-3 hover:text-gray-300 text-sm">
              Contact Us
            </a>
            <a href="/faq" className="mx-3 hover:text-gray-300 text-sm">
              FAQ
            </a>
          </div>

          {/* Social and Contact */}
          <div className="flex items-center">
            {/* Social Icons */}
            <div className="flex space-x-2 mr-8">
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-900 flex items-center justify-center transition duration-300"
                aria-label="Facebook"
              >
                <FaFacebookF className="text-white text-2xl" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-900 flex items-center justify-center transition duration-300"
                aria-label="Instagram"
              >
                <FaInstagram className="text-white text-2xl" />
              </a>
            </div>

            {/* Help Section */}
            <div>
              <div className="text-xs m-2">Need Help? Call Us</div>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 w-8 h-8 rounded-full flex items-center justify-center mr-2">
                  <MdPhone className="text-white" />
                </span>
                <a href="tel:+918123096298" className="font-bold">+918123096298</a>
                <a href="tel:+919844723432" className="font-bold">+919844723432</a>
              </div>
            </div>
          </div>

          {/* WhatsApp Button */}
          
        </div>

        {/* Privacy Policy Link */}
        <div className="text-right mt-2">
          <a href="/policy" className="text-sm hover:text-gray-300">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;