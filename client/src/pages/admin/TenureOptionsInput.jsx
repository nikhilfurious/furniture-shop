import React from 'react';
import { Plus, Minus } from 'lucide-react';

export const TenureOptionsInput = ({ tenureOptions, setTenureOptions }) => {
  const addTenureOption = () => {
    setTenureOptions([...tenureOptions, { months: 1, price: 0 }]);
  };

  const removeTenureOption = (index) => {
    const updatedOptions = [...tenureOptions];
    updatedOptions.splice(index, 1);
    setTenureOptions(updatedOptions);
  };

  const updateTenureOption = (index, field, value) => {
    const updatedOptions = [...tenureOptions];
    updatedOptions[index][field] = field === 'months' ? parseInt(value, 10) : parseFloat(value);
    setTenureOptions(updatedOptions);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tenure Options
      </label>
      
      <div className="space-y-3">
        {tenureOptions.map((option, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Months</label>
              <input
                type="number"
                min="1"
                value={option.months}
                onChange={(e) => updateTenureOption(index, 'months', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Months"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={option.price}
                onChange={(e) => updateTenureOption(index, 'price', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Price per month"
              />
            </div>
            
            <button
              type="button"
              onClick={() => removeTenureOption(index)}
              className="mt-5 p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
              aria-label="Remove tenure option"
            >
              <Minus size={16} />
            </button>
          </div>
        ))}
      </div>
      
      <button
        type="button"
        onClick={addTenureOption}
        className="mt-3 inline-flex items-center px-3 py-2 border border-dashed border-gray-300 text-sm rounded-md text-gray-700 hover:bg-gray-50"
      >
        <Plus size={16} className="mr-2" />
        Add Tenure Option
      </button>
      
      <p className="text-xs text-gray-500 mt-1">
        Define rental tenure options with different monthly pricing
      </p>
    </div>
  );
};
