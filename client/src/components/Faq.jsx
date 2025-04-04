import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate()

  // Expanded FAQ content for a complete page
  const faqCategories = [
    {
      title: "Rental Process",
      questions: [
        {
          question: "What are the steps involved in the process of renting?",
          answer: "Our rental process is simple and straightforward: 1) Browse and select your desired product from our catalog, 2) Complete the KYC verification process by uploading required documents, 3) Pay the security deposit, and 4) Schedule a convenient delivery time. Once these steps are completed, we'll deliver your rental item right to your doorstep."
        },
        {
          question: "How do I schedule a product pickup after my rental period ends?",
          answer: "You can schedule a pickup through your account dashboard or by contacting our customer service team at least 48 hours before your rental period ends. Our team will coordinate a convenient pickup time within your selected time slot."
        },
        {
          question: "Can I extend my rental period?",
          answer: "Yes, you can extend your rental period through your account dashboard or by contacting customer service. Extensions are subject to product availability and must be requested at least 24 hours before your current rental period ends."
        }
      ]
    },
    {
      title: "Payments & Deposits",
      questions: [
        {
          question: "What kind of charges will be deducted from the deposit?",
          answer: "Security deposit deductions depend on the product condition at the time of return. Deductions may be made for damages beyond normal wear and tear, missing accessories or components, or cleaning fees if the item is returned in an unsatisfactory condition. A detailed inspection report will be provided if any deductions are made."
        },
        {
          question: "When will my security deposit be refunded?",
          answer: "Security deposits are refunded within 5-7 business days after the product has been returned and inspected. The refund will be processed to the original payment method used for the deposit."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit and debit cards, net banking, UPI, and popular digital wallets. All transactions are secure and encrypted to ensure your payment information remains protected."
        }
      ]
    },
    {
      title: "Delivery & Logistics",
      questions: [
        {
          question: "How long does it take for delivery?",
          answer: "Standard delivery takes 2-5 business days depending on your location. We offer expedited delivery options in select cities for an additional fee. You can check the estimated delivery time for your location during checkout."
        },
        {
          question: "Do you deliver to all locations?",
          answer: "We currently deliver to major cities and surrounding areas. You can check if we deliver to your location by entering your pincode on our website or during the checkout process."
        },
        {
          question: "Is there a delivery fee?",
          answer: "Delivery is free for orders above $50. For orders below this amount, a nominal delivery fee of $5-10 will be charged depending on your location and the size of the item."
        }
      ]
    },
    {
      title: "Maintenance & Support",
      questions: [
        {
          question: "What if the product stops working during my rental period?",
          answer: "If you experience any issues with your rented product, please contact our support team immediately. We offer 24/7 technical support and will either guide you through troubleshooting or arrange for a replacement product if necessary, at no additional cost."
        },
        {
          question: "How do I report damage to a rental item?",
          answer: "Please document the damage by taking clear photographs and contact our customer service team within 24 hours of receiving the product. This ensures you won't be held responsible for pre-existing damage."
        }
      ]
    }
  ];

  const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const Plus = () => {
    return (
      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-600 text-white">
        <span className="text-lg font-semibold">+</span>
      </div>
    );
  };

  const Minus = () => {
    return (
      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-green-600 text-white">
        <span className="text-lg font-semibold">-</span>
      </div>
    );
  };

  // Flatten all questions for search functionality
  const allQuestions = faqCategories.flatMap(category => 
    category.questions.map(q => ({...q, category: category.title}))
  );
  
  const [searchTerm, setSearchTerm] = useState("");
  const filteredQuestions = searchTerm 
    ? allQuestions.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.answer.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Find answers to common questions about our rental services, policies, and more.
          </p>
          
          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                className="w-full py-3 px-4 pr-10 rounded-full border-2 border-gray-300 focus:outline-none focus:border-green-500 transition duration-300"
                placeholder="Search for questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchTerm && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">Search Results</h2>
            {filteredQuestions.length > 0 ? (
              <div className="space-y-3">
                {filteredQuestions.map((item, index) => (
                  <div
                    key={`search-${index}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer p-4 hover:bg-gray-50"
                      onClick={() => toggleAnswer(`search-${index}`)}
                    >
                      <div>
                        <span className="text-xs font-medium text-green-600 bg-green-100 rounded-full py-1 px-2 mr-2">
                          {item.category}
                        </span>
                        <h4 className="inline text-md font-semibold text-gray-800">{item.question}</h4>
                      </div>
                      <span>
                        {openIndex === `search-${index}` ? <Minus /> : <Plus />}
                      </span>
                    </div>
                    {openIndex === `search-${index}` && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4"
                      >
                        <p className="text-gray-600">{item.answer}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">No results found. Please try a different search term.</p>
              </div>
            )}
          </div>
        )}

        {/* FAQ Categories */}
        {(!searchTerm || filteredQuestions.length === 0) && (
          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
                  {category.title}
                </h2>
                <div className="space-y-3">
                  {category.questions.map((item, questionIndex) => {
                    const index = `${categoryIndex}-${questionIndex}`;
                    return (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300"
                      >
                        <div
                          className="flex justify-between items-center cursor-pointer p-4 hover:bg-gray-50"
                          onClick={() => toggleAnswer(index)}
                        >
                          <h4 className="text-md font-semibold text-gray-800">{item.question}</h4>
                          <span>
                            {openIndex === index ? <Minus /> : <Plus />}
                          </span>
                        </div>
                        {openIndex === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-4 pb-4"
                          >
                            <p className="text-gray-600">{item.answer}</p>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still Have Questions Section */}
        <div className="mt-16 bg-green-600 rounded-xl text-center py-10 px-6 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            We're here to help. If you couldn't find the answer to your question, please reach out to our customer support team.
          </p>
          <div className="space-x-4">
            <button className="bg-white text-green-600 font-medium py-2 px-6 rounded-full hover:bg-green-50 transition duration-300 cursor-pointer" onClick={()=>{navigate('/contact')}}>
              Contact Support
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;