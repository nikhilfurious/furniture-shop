import React from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold border-b-2 border-green-500 inline-block pb-2">
              Furniture Haven
            </h2>
            <p className="text-gray-300 mt-4">
              Quality furniture for every home. We specialize in crafting beautiful, functional pieces
              that transform spaces into havens of comfort and style.
            </p>
            <div className="pt-4">
              <div className="flex items-center space-x-3 text-gray-300 py-1">
                <MdLocationOn className="text-green-400" />
                <span>123 Furniture Lane, Comfort City</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 py-1">
                <MdPhone className="text-green-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 py-1">
                <MdEmail className="text-green-400" />
                <span>info@furniturehaven.com</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:ml-8">
            <h3 className="text-xl font-semibold mb-6 border-b-2 border-green-500 inline-block pb-2">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                  <span className="bg-green-500 h-1 w-1 rounded-full mr-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                  Home
                </a>
              </li>
              <li>
                <a href="/product" className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                  <span className="bg-green-500 h-1 w-1 rounded-full mr-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                  Shop
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                  <span className="bg-green-500 h-1 w-1 rounded-full mr-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                  About
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                  <span className="bg-green-500 h-1 w-1 rounded-full mr-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                  Contact
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 flex items-center">
                  <span className="bg-green-500 h-1 w-1 rounded-full mr-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            
          </div>
          {/* Newsletter and Social */}
          <div>
            <h3 className="text-xl font-semibold mb-6 border-b-2 border-green-500 inline-block pb-2">
              Stay Connected
            </h3>
            <p className="text-gray-300 mb-4">Subscribe to our newsletter for updates and exclusive offers.</p>
            
            <div className="flex mb-6">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-gray-700 text-white px-4 py-2 rounded-l-md focus:outline-none w-full"
              />
              <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-r-md transition duration-300">
                Subscribe
              </button>
            </div>
            
            <h4 className="text-lg font-medium mb-3">Follow Us</h4>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-gray-700 hover:bg-green-600 flex items-center justify-center transition duration-300"
              >
                <FaFacebookF className="text-lg" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-gray-700 hover:bg-green-600 flex items-center justify-center transition duration-300"
              >
                <FaInstagram className="text-lg" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-gray-700 hover:bg-green-600 flex items-center justify-center transition duration-300"
              >
                <FaTwitter className="text-lg" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-gray-700 hover:bg-green-600 flex items-center justify-center transition duration-300"
              >
                <FaLinkedinIn className="text-lg" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-700 my-10"></div>
        
        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <div>
            © {new Date().getFullYear()} Furniture Haven. All rights reserved.
          </div>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-6">
              <li><a href="/policy" className="hover:text-green-400 transition duration-300">Privacy Policy</a></li>
              <li><a href="/policy" className="hover:text-green-400 transition duration-300">Terms of Service</a></li>
              
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;