import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard = ({ products }) => {
  // Group products by category for chart
  const categoryCounts = products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {});
  
  const chartData = Object.keys(categoryCounts).map(category => ({
    name: category.split(' ').slice(0, 2).join(' '), // Shorten category name for display
    count: categoryCounts[category]
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700">Total Products</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2">{products.length}</p>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700">Categories</h3>
          <p className="text-2xl md:text-3xl font-bold mt-2">
            {Object.keys(categoryCounts).length}
          </p>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-700">Recent Activity</h3>
          <p className="text-gray-600 mt-2">Last login: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      {/* Product Category Chart */}
      <div className="mt-6 bg-white p-4 md:p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Product Categories</h3>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};