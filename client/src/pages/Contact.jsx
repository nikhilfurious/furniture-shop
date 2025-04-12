import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ContactPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
    });
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setFormStatus({
      submitted: true,
      success: true,
      message: 'Thank you! Your message has been sent successfully.'
    });
    
    // Reset form after successful submission
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setFormStatus({
        submitted: false,
        success: false,
        message: ''
      });
    }, 5000);
  };

  return (
    <div className="bg-gray-50 font-sans">
      {/* Hero Section */}
      <div className="relative h-80 md:h-96">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="/api/placeholder/1920/600" 
            alt="Modern furniture showroom" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        
        <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl" data-aos="fade-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get In Touch</h1>
            <p className="text-xl text-gray-200">
              We'd love to hear from you. Our friendly team is always here to help.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info + Form Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div data-aos="fade-right">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Contact Information</h2>
            <div className="w-20 h-1 bg-green-500 mb-8"></div>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-500 p-3 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Visit Our Stores</h3>
                  <p className="text-gray-600 mb-1">123 Furniture Avenue, Bangalore - 560001</p>
                  <p className="text-gray-600">456 Decor Street, Chennai - 600001</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-500 p-3 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Call Us</h3>
                  <p className="text-gray-600 mb-1">Customer Service: +91 8765 432 100</p>
                  <p className="text-gray-600">Sales Inquiries: +91 9876 543 210</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-500 p-3 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Email Us</h3>
                  <p className="text-gray-600 mb-1">Customer Support: support@furnishrent.com</p>
                  <p className="text-gray-600">Business Inquiries: info@furnishrent.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-500 p-3 rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Business Hours</h3>
                  <p className="text-gray-600 mb-1">Monday - Saturday: 10:00 AM - 8:00 PM</p>
                  <p className="text-gray-600">Sunday: 11:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full text-white transition duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12.07c0-5.523-4.477-10-10-10s-10 4.477-10 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12.07h2.54V9.557c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.891h-2.33v6.988C18.343 21.198 22 17.062 22 12.07z"></path>
                  </svg>
                </a>
                <a href="#" className="bg-pink-600 hover:bg-pink-700 p-3 rounded-full text-white transition duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"></path>
                  </svg>
                </a>
                <a href="#" className="bg-blue-400 hover:bg-blue-500 p-3 rounded-full text-white transition duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="bg-red-600 hover:bg-red-700 p-3 rounded-full text-white transition duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5l6-3.5-6-3.5v7z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div data-aos="fade-left">
            <div className="bg-white rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
              
              {formStatus.submitted ? (
                <div className={`p-4 rounded-lg ${formStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {formStatus.message}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                        placeholder="How can we help you?"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                      placeholder="Please provide details about your inquiry..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <div className="max-w-7xl mx-auto text-center mb-12" data-aos="fade-up">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Visit Our Showrooms</h2>
          <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our furniture collections in person at one of our elegant showrooms
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto" data-aos="zoom-in">
          <div className="bg-gray-300 rounded-lg overflow-hidden shadow-lg h-96">
            {/* This would be your actual Google Maps or other map embed */}
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-center p-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
                <p className="text-gray-500 text-lg">Interactive Map Would Display Here</p>
                <p className="text-gray-500">Showing our showroom locations in Bangalore, Chennai, and other cities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find quick answers to common questions about our services
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:shadow-lg" data-aos="fade-up" data-aos-delay="100">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">How does furniture rental work?</h3>
            <p className="text-gray-600">
              Simply browse our collection, select the items you love, choose your rental duration, and we'll deliver and set up everything for you. When your rental period ends, we'll pick everything up.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:shadow-lg" data-aos="fade-up" data-aos-delay="200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">What if I damage the furniture?</h3>
            <p className="text-gray-600">
              We understand that accidents happen. Minor wear and tear is covered, but significant damage may incur additional charges. We offer an optional protection plan for complete peace of mind.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:shadow-lg" data-aos="fade-up" data-aos-delay="300">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Can I extend my rental period?</h3>
            <p className="text-gray-600">
              Absolutely! You can extend your rental period at any time through your account or by contacting our customer service team. We'll adjust your billing accordingly.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:shadow-lg" data-aos="fade-up" data-aos-delay="400">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Do you sanitize furniture between rentals?</h3>
            <p className="text-gray-600">
              Yes, all our furniture undergoes a thorough cleaning and sanitization process between rentals. We follow industry-best practices to ensure your furniture is clean and hygienic.
            </p>
          </div>
        </div>
        
        <div className="text-center mt-12" data-aos="fade-up">
          <p className="text-gray-600 mb-4">Still have questions? We're here to help!</p>
          <button className="bg-green-500 hover:bg-green-600 text-gray-900 font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
            View All FAQs
          </button>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center" data-aos="fade-up">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
          <p className="text-xl text-gray-300 mb-8">
            Subscribe to our newsletter for the latest collections, design tips, and exclusive offers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              className="flex-grow px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your email address"
            />
            <button className="bg-green-500 hover:bg-green-600 text-gray-900 font-bold py-3 px-6 rounded-lg transition duration-300">
              Subscribe
            </button>
          </div>
          
          <p className="text-gray-400 text-sm mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive our promotional emails.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;