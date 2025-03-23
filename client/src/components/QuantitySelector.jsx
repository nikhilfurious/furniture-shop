import React from "react";

const QuantitySelector = ({ quantity, onIncrease, onDecrease }) => {
  return (
    <div className="flex items-center justify-between space-x-5 border-2 border-gray-200 rounded-lg p-1">
      <button
        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg"
        onClick={onDecrease}
        disabled={quantity <= 1}
      >
        -
      </button>
      <span className="text-lg font-semibold">{quantity}</span>
      <button
        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg"
        onClick={onIncrease}
      >
        +
      </button>
    </div>
  );
};

export default QuantitySelector;
