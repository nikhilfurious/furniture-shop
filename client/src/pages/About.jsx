import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

const AboutPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
      mirror: true,
    });
  }, []);

  return (
    <div className="bg-gray-50 font-sans">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="/api/placeholder/1920/1080" 
            alt="Modern living room with elegant furniture" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl" data-aos="fade-up">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Crafting Comfort, Delivering Dreams</h1>
            <p className="text-xl text-gray-200 mb-8">
              Where quality craftsmanship meets innovative design
            </p>
            <button className="bg-green-500 hover:bg-green-600 text-gray-900 font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
              Our Collections
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div data-aos="fade-right">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
            <div className="w-20 h-1 bg-green-500 mb-8"></div>
            <p className="text-gray-600 mb-6">
              Founded in 2010, FurnishRent began with a simple idea: everyone deserves access to beautiful, high-quality furniture without the burden of ownership. What started as a small collection in a garage has grown into the premier furniture rental destination across India.
            </p>
            <p className="text-gray-600 mb-6">
              Our journey has been defined by a commitment to craftsmanship, sustainability, and customer satisfaction. We've partnered with skilled artisans and responsible manufacturers to ensure every piece in our collection meets our exacting standards.
            </p>
            <p className="text-gray-600">
              Today, we're proud to help thousands of customers transform their living spaces with furniture that inspires, comforts, and delights.
            </p>
          </div>
          <div className="relative" data-aos="fade-left">
            <img 
              src="/api/placeholder/600/800" 
              alt="Craftsman working on wooden furniture" 
              className="rounded-lg shadow-xl w-full h-auto"
            />
            <div className="absolute -bottom-6 -left-6 bg-green-500 rounded-lg p-6 shadow-lg">
              <p className="text-3xl font-bold text-gray-900">12+</p>
              <p className="text-gray-800 font-medium">Years of Excellence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-gray-100 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Core Values</h2>
          <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The principles that guide everything we do
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105" data-aos="fade-up" data-aos-delay="100">
            <div className="h-40 bg-green-400 flex items-center justify-center p-6">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
              </svg>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Quality Craftsmanship</h3>
              <p className="text-gray-600">
                We believe furniture should be built to last. Every piece in our collection is crafted with exceptional materials and attention to detail.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105" data-aos="fade-up" data-aos-delay="200">
            <div className="h-40 bg-blue-500 flex items-center justify-center p-6">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Sustainable Practices</h3>
              <p className="text-gray-600">
                Rental furniture extends product lifecycles. We refurbish and reuse our pieces, reducing waste and promoting a circular economy.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105" data-aos="fade-up" data-aos-delay="300">
            <div className="h-40 bg-green-500 flex items-center justify-center p-6">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Customer Happiness</h3>
              <p className="text-gray-600">
                Your satisfaction is our priority. From selection to delivery to support, we're committed to providing an exceptional experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
     {/*  <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
          <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The passionate people behind our success
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105" data-aos="fade-up" data-aos-delay="100">
            <img src="/api/placeholder/400/400" alt="Team member" className="w-full h-64 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Raj Sharma</h3>
              <p className="text-gray-500 mb-4">Founder & CEO</p>
              <p className="text-gray-600 text-sm">
                With over 15 years of experience in furniture design and retail, Raj leads our company with vision and passion.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105" data-aos="fade-up" data-aos-delay="200">
            <img src="/api/placeholder/400/400" alt="Team member" className="w-full h-64 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Priya Patel</h3>
              <p className="text-gray-500 mb-4">Head of Design</p>
              <p className="text-gray-600 text-sm">
                Priya brings creativity and innovation to our collections, ensuring each piece meets the highest design standards.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105" data-aos="fade-up" data-aos-delay="300">
            <img src="/api/placeholder/400/400" alt="Team member" className="w-full h-64 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Vikram Singh</h3>
              <p className="text-gray-500 mb-4">Operations Director</p>
              <p className="text-gray-600 text-sm">
                Vikram ensures seamless delivery and logistics, making sure your furniture arrives on time, every time.
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105" data-aos="fade-up" data-aos-delay="400">
            <img src="/api/placeholder/400/400" alt="Team member" className="w-full h-64 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Ananya Gupta</h3>
              <p className="text-gray-500 mb-4">Customer Experience</p>
              <p className="text-gray-600 text-sm">
                Ananya leads our support team, dedicated to providing exceptional service throughout your rental journey.
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Testimonials */}
      <div className="bg-gray-800 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">What Our Customers Say</h2>
          <div className="w-20 h-1 bg-green-500 mx-auto mb-6"></div>
        </div>
        
        <div className="max-w-5xl mx-auto" data-aos="fade-up">
          <div className="relative">
            <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
              <svg className="w-12 h-12 text-green-500 mb-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-xl md:text-2xl text-gray-700 mb-8 italic">
                "FurnishRent transformed our new apartment into a stylish, comfortable home in just 48 hours. The quality of furniture exceeds what we expected, and the flexibility of the rental terms is perfect for our needs."
              </p>
              <div className="flex items-center">
                <img 
                  src="/api/placeholder/80/80" 
                  alt="Customer" 
                  className="w-14 h-14 rounded-full object-cover mr-4" 
                />
                <div>
                  <p className="font-bold text-gray-900">Aditya & Meera Reddy</p>
                  <p className="text-gray-600">Bangalore</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div data-aos="fade-up" data-aos-delay="100">
            <p className="text-5xl font-bold text-green-500 mb-2">15,000+</p>
            <p className="text-xl text-gray-600">Happy Customers</p>
          </div>
          
          <div data-aos="fade-up" data-aos-delay="200">
            <p className="text-5xl font-bold text-green-500 mb-2">7</p>
            <p className="text-xl text-gray-600">Cities Served</p>
          </div>
          
          <div data-aos="fade-up" data-aos-delay="300">
            <p className="text-5xl font-bold text-green-500 mb-2">2,500+</p>
            <p className="text-xl text-gray-600">Furniture Pieces</p>
          </div>
          
          <div data-aos="fade-up" data-aos-delay="400">
            <p className="text-5xl font-bold text-green-500 mb-2">98%</p>
            <p className="text-xl text-gray-600">Satisfaction Rate</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden z-0">
          <img 
            src="/api/placeholder/1920/600" 
            alt="Interior with furniture" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Transform Your Space Today
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover our extensive collection of premium furniture available for rent. Create the home of your dreams without the long-term commitment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-500 hover:bg-green-600 text-gray-900 font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
              Browse Collections
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;