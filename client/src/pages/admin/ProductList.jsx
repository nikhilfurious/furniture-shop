import React from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';

export const ProductList = ({ products, handleNavigation, handleEdit, handleDelete }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold">Products ({products.length})</h1>
        <button 
          onClick={() => handleNavigation('addProduct')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add New Product
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-md overflow-x-auto">
        <div className="min-w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Tenures
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Locations
                </th>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                    {product.id}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0">
                        <img 
                          className="h-8 w-8 md:h-10 md:w-10 rounded-md object-cover" 
                          src={product.images?.[0] || "/placeholder.svg"} 
                          alt={product.name} 
                        />
                      </div>
                      <div className="ml-2 md:ml-4">
                        <div className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[100px] md:max-w-[200px]">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                    <span className="inline-block max-w-[100px] md:max-w-full truncate">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                    ${product.basePrice}
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden md:table-cell">
                    <span className="inline-flex gap-1">
                      {product.tenureOptions?.map(option => (
                        <span key={option.months} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {option.months}m/${option.price}
                        </span>
                      ))}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden md:table-cell">
                    <span className="inline-block max-w-[150px] truncate">
                      {Array.isArray(product.locations) 
                        ? product.locations.join(', ')
                        : product.location || 'N/A'
                      }
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(product.id)}
                        className="text-blue-600 hover:text-blue-900"
                        aria-label="Edit product"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                        aria-label="Delete product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
