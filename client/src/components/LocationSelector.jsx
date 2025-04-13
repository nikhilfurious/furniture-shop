import React, { useState, useRef, useEffect } from "react";
import { Check, X, MapPin, Search, ChevronDown } from "lucide-react";

// Sample location data - in a real app this would come from an API
const availableLocations = [
  { id: "l1", name: "Chennai" },
  { id: "l2", name: "Bangalore" },
  { id: "l3", name: "Delhi" },
  { id: "l4", name: "Kolkata" },
  { id: "l5", name: "Mumbai" },
  { id: "l6", name: "Hydrebad" },
];

const LocationSelector = ({ selectedLocations, onSelectLocation, onRemoveLocation, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  // Check if mobile on component mount and when window is resized
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIsMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const filteredLocations = availableLocations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedLocations.some((selected) => selected.id === location.id)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Combine className with base classes
  const containerClasses = `relative w-full ${className || ""}`;
  
  // Dropdown max height class based on mobile state
  const dropdownMaxHeightClass = isMobile ? "max-h-[60vh]" : "max-h-60";
  
  // List max height class based on mobile state
  const listMaxHeightClass = isMobile ? "max-h-[calc(60vh-60px)]" : "max-h-48";

  return (
    <div className={containerClasses} ref={dropdownRef}>
      <div
        className="flex items-center justify-between p-2 border border-gray-300 rounded-md cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <MapPin size={18} className="text-gray-500 mr-2" />
          <span className="text-gray-700">
            {selectedLocations.length > 0
              ? `${selectedLocations.length} location${
                  selectedLocations.length > 1 ? "s" : ""
                } selected`
              : "Select locations"}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-500 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedLocations.map((location) => (
            <div
              key={location.id}
              className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
            >
              <MapPin size={14} className="mr-1" />
              <span>{location.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveLocation(location.id);
                }}
                className="ml-1 text-blue-800 hover:text-blue-900"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg ${dropdownMaxHeightClass}`}
        >
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 p-2 border border-gray-300 rounded-md text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div
            className={`overflow-y-auto ${listMaxHeightClass}`}
          >
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLocation(location);
                    setSearchTerm("");
                  }}
                >
                  <div className="flex items-center">
                    <MapPin size={16} className="text-gray-500 mr-2" />
                    <span>{location.name}</span>
                  </div>
                  <Check size={16} className="text-transparent" />
                </div>
              ))
            ) : (
              <div className="p-2 text-gray-500 text-center">
                {searchTerm ? "No locations found" : "All locations selected"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;