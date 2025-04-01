import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, message } from 'antd';
import axios from 'axios';

const PurchaseButton = ({ products, customer, adminEmail, children, disabled }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = 'http://localhost:5000';

  // Calculate total price from all products
  const totalPrice = products?.reduce((sum, product) => sum + (product.price || 0), 0);



  const showModal = async () => {
    setIsModalVisible(true);
    
    // Check if the user's phone number already exists
    
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setPhoneNumber('');
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{8,14}$/;
    return phoneRegex.test(phone);
  };

  const handleConfirm = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
        alert('Please enter a valid phone number');
        return;
    }

    if (!products || products.length === 0) {
        alert('No products available');
        return;
    }

    setIsLoading(true);

    try {
        // Step 1: Verify phone number before proceeding
        const phoneUpdateResponse = await axios.post(`${API_URL}/api/update-user-phone`, {
            userId: customer.userId,
            phoneNumber
        });

        if (!phoneUpdateResponse.data.success) {
            throw new Error(phoneUpdateResponse.data.message || 'Phone number verification failed');
        }

        // Step 2: Proceed with the purchase if phone verification was successful
        const response = await axios.post(`${API_URL}/api/process-purchase`, {
            userId: customer.userId,
            totalPrice,
            products,
            customer: {
                ...customer,
                phoneNumber
            },
            adminEmail
        });

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to process purchase');
        }

        alert('Invoice generated and sent successfully!');
        setIsModalVisible(false);
        setPhoneNumber('');

        // Open the PDF in a new tab if URL is provided
        if (response.data.pdfUrl) {
            window.open(response.data.pdfUrl, '_blank');
        }
    } catch (error) {
        console.error('Error in purchase process:', error);
        
        // Handle network errors or missing error messages
        alert(error.response?.data?.message || error.message || 'An error occurred. Please try again.');
    } finally {
        setIsLoading(false);
    }
};



  return (
    <>
      <Button type="primary" size="large" disabled={disabled} onClick={showModal}>
        {children}
      </Button>
      
      <Modal
        title="Confirm Your Purchase"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <Form layout="vertical">
          <div style={{ marginBottom: 20 }}>
            <h3>Order Summary</h3>
            {products && products.length > 0 ? (
              <>
                {products.map(product => (
                  <div key={product._id} style={{ marginBottom: 10 }}>
                    <p>{product.name} - ${product.price?.toFixed(2)}</p>
                  </div>
                ))}
                <p style={{ fontWeight: 'bold', borderTop: '1px solid #eee', paddingTop: 10 }}>
                  Total Price: ${totalPrice?.toFixed(2)}
                </p>
              </>
            ) : (
              <p>No products available</p>
            )}
          </div>
          
          <Form.Item 
            label="Phone Number" 
            required 
            help="We'll use this for shipping updates and order confirmation"
          >
            <Input 
              placeholder="Enter your phone number" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </Form.Item>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              onClick={handleConfirm} 
              loading={isLoading}
            >
              Confirm Purchase
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default PurchaseButton;
