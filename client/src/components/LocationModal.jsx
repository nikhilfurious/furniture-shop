import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown } from "lucide-react";

const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad"];

function LocationModal({ onLocationSelect, selectedLocation = "Select Location" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleLocationSelect = (city) => {
    onLocationSelect(city);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
      >
        <MapPin className="h-4 w-4 text-primary" />
        <span>{selectedLocation}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute mt-2 w-64 bg-white rounded-xl shadow-lg z-50 border overflow-hidden"
          >
            <div className="p-3 border-b bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700">Choose your location</h3>
            </div>
            <div className="max-h-60 overflow-y-auto p-2">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleLocationSelect(city)}
                  className="w-full text-left p-3 hover:bg-primary/5 rounded-md transition-colors flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {city}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LocationModal;
