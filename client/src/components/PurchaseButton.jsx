import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, message } from 'antd';
import axios from 'axios';
import { API_URL } from "../endpoint";
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const PurchaseButton = ({ products, customer, adminEmail, children, disabled, total, depositTotal, monthlyRent }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();
  
  // Calculate total price from all products
  const totalPrice = total || products?.reduce((sum, product) => sum + (product.price * product.quantity || 0), 0);

  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
    fetchUserDetails();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{8,14}$/;
    return phoneRegex.test(phone);
  };

  // Fetch user details when the modal opens
  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/get-user-details`, {
        params: { userId: customer.userId },
      });

      if (response.data.success) {
        const { phoneNumber, address } = response.data.userDetails;
        form.setFieldsValue({
          phoneNumber: phoneNumber || '+91',
          address: address || '',
        });
      } else {
        message.error('Failed to fetch user details.');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      message.error('An error occurred while fetching user details.');
    }
  };

  // Clear the user's cart
  const clearCart = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(
        `${API_URL}/api/cart/clear/${customer.userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Don't show error to user since the purchase was successful
      // We'll just log the error for debugging
    }
  };

  const handleConfirm = async () => {
    try {
      // Validate form fields
      const values = await form.validateFields();

      // Validate phone number
      if (!validatePhoneNumber(values.phoneNumber)) {
        message.error('Please enter a valid phone number');
        return;
      }

      if (!products || products.length === 0) {
        message.error('No products available');
        return;
      }

      setIsLoading(true);

      // Step 1: Update user details
      await axios.post(`${API_URL}/api/update-user-details`, {
        userId: customer.userId,
        phoneNumber: values.phoneNumber,
        address: values.address,
      });

      // Ensure each product has the tenure information
      const productsWithTenure = products.map(product => {
        return {
          ...product,
          
          tenure: product.tenure
        };
      });

      // Step 2: Process the purchase with all relevant information
      const response = await axios.post(`${API_URL}/api/process-purchase`, {
        userId: customer.userId,
        totalPrice,
        depositTotal,
        monthlyRent,
        products: productsWithTenure, // Send products with tenure information
        orderDetails: {
          totalAmount: totalPrice,
          depositAmount: depositTotal,
          monthlyRent: monthlyRent,
        },
        customer: {
          ...customer,
          phoneNumber: values.phoneNumber,
          address: values.address,
        },
        adminEmail,
      });

      if (response.data.success) {
        // Step 3: Clear the cart after successful purchase
        await clearCart();
        
        message.success('Purchase successful! Your cart has been cleared.');
        setIsModalVisible(false);
        form.resetFields();
        navigate('/dashboard'); // Redirect to dashboard

        // Optionally, open PDF in a new tab if provided
        if (response.data.pdfUrl) {
          window.open(response.data.pdfUrl, '_blank');
        }
      } else {
        throw new Error(response.data.message || 'Failed to process purchase');
      }
    } catch (error) {
      console.error('Error in purchase process:', error);
      message.error(error.response?.data?.message || error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        type="button"
        disabled={disabled}
        onClick={showModal}
        className={`text-xl cursor-pointer bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-4 rounded-[100vh] flex-1 transition duration-300 shadow-md hover:shadow-lg ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-700 hover:to-emerald-600'}`}
      >
        {children}
      </button>

      <Modal
        title="Confirm Your Purchase"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Form layout="vertical" form={form}>
          <div style={{ marginBottom: 20 }}>
            <h3>Order Summary</h3>
            {products && products.length > 0 ? (
              <>
                {products.map((product) => (
                  <div key={product.id || product._id} style={{ marginBottom: 10 }}>
                    <p>
                      {product.name} - ₹{product.price?.toFixed(2)} x {product.quantity} 
                      {product.tenure && <span> ({product.tenure} {parseInt(product.tenure, 10) === 1 ? 'month' : 'months'})</span>}
                    </p>
                  </div>
                ))}
                <div style={{ marginTop: 15, borderTop: '1px solid #eee', paddingTop: 10 }}>
                  
                  <p><strong>Deposit Amount:</strong> ₹{totalPrice*2 || 'N/A'}</p>
                  <p><strong>Total Amount:</strong> ₹{totalPrice || 'N/A'}</p>
                </div>
              </>
            ) : (
              <p>No products available</p>
            )}
          </div>

          <Form.Item
            label="Phone Number"
            name="phoneNumber"
            initialValue='+91'
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { pattern: /^\+?[1-9]\d{8,14}$/, message: 'Please enter a valid phone number' },
            ]}
            help="We'll use this for shipping updates and order confirmation"
          >
            <Input placeholder="Enter your phone number" />
          </Form.Item>

          <Form.Item
            label="Shipping Address"
            name="address"
            rules={[{ required: true, message: 'Please enter your shipping address' }]}
            help="Enter your full shipping address"
          >
            <Input placeholder="Enter your shipping address" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 30 }}>
            <Button onClick={handleCancel} style={{ marginRight: 10 }}>
              Cancel
            </Button>
            <button 
              type="button"
              disabled={isLoading}
              onClick={handleConfirm}
              className={`bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-md transition duration-300 shadow-md ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-700 hover:to-emerald-600 hover:shadow-lg'}`}
            >
              {isLoading ? 'Processing...' : 'Confirm Purchase'}
            </button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default PurchaseButton;