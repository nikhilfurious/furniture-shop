import React, { useState, useEffect, useCallback } from 'react';

const ProductFilter = ({ onFilterChange, activeFilters = { categories: [], months: [] } }) => {
  // Sample categories and tenure options
  const categories = ["Appliances", "Electronics", "Furniture", "sample" ,"Air Conditioners"];
  const tenureOptions = [3, 6, 9, 12, 18, 24];
  
  // Use local state to manage filters to prevent flickering
  const [localFilters, setLocalFilters] = useState({
    categories: activeFilters.categories || [],
    months: activeFilters.months || []
  });
  
  // Only update local state when the activeFilters prop changes significantly
  useEffect(() => {
    if (JSON.stringify(localFilters) !== JSON.stringify(activeFilters)) {
      setLocalFilters(activeFilters);
    }
  }, [activeFilters]);

  // Use a debounced function to update parent component to prevent multiple rapid updates
  const debouncedFilterChange = useCallback(
    (newFilters) => {
      // Only update if there's an actual change to prevent unnecessary re-renders
      if (JSON.stringify(newFilters) !== JSON.stringify(activeFilters)) {
        onFilterChange(newFilters);
      }
    },
    [onFilterChange, activeFilters]
  );

  // Properly handle category toggle with debouncing
  const toggleCategory = useCallback((category) => {
    setLocalFilters(prev => {
      const updatedCategories = prev.categories.includes(category)
        ? prev.categories.filter(cat => cat !== category)
        : [...prev.categories, category];
      
      const newFilters = {
        ...prev,
        categories: updatedCategories
      };
      
      // Send the updated filters to parent component
      debouncedFilterChange(newFilters);
      
      return newFilters;
    });
  }, [debouncedFilterChange]);

  // Properly handle month toggle with debouncing
  const toggleMonth = useCallback((month) => {
    setLocalFilters(prev => {
      const updatedMonths = prev.months.includes(month)
        ? prev.months.filter(m => m !== month)
        : [...prev.months, month];
      
      const newFilters = {
        ...prev,
        months: updatedMonths
      };
      
      // Send the updated filters to parent component
      debouncedFilterChange(newFilters);
      
      return newFilters;
    });
  }, [debouncedFilterChange]);

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-bold text-gray-700 mb-3">Product Categories</h3>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category}`}
                checked={localFilters.categories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label 
                htmlFor={`category-${category}`} 
                className="ml-3 text-sm text-gray-600 cursor-pointer hover:text-indigo-600"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Tenure Options */}
     {/*  <div>
        <h3 className="font-bold text-gray-700 mb-3">Rental Duration</h3>
        <div className="grid grid-cols-2 gap-2">
          {tenureOptions.map(month => (
            <div
              key={month}
              onClick={() => toggleMonth(month)}
              className={`border p-2 rounded-md text-center cursor-pointer transition-colors ${
                localFilters.months?.includes(month)
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                  : 'border-gray-300 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              {month} Months
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default ProductFilter;