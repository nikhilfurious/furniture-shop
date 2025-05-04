import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { ArrowRight, Star } from 'lucide-react';
import Carousel from '../components/Carousel';
import FeaturedProducts from '../components/Featured';
import { Link, useNavigate } from 'react-router-dom';

import axios from 'axios';
import Testimonials from '../components/Testimonials';
  import { API_URL } from "../endpoint";




function Home() {


  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);


  const fetchFeaturedProducts = async () => {
    try {
      // limit to 6 products only

      const response = await axios.get(`${API_URL}/api/products?limit=6&sort=-createdAt`);
      setFeaturedProducts(response.data);
      
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);


  
/*   const CategorySection = () => {

    const API_URL = 'http://localhost:5000';


    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/categories`);
        setCategories(response.data.categories);
        
      }
      catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    
    useEffect(() => {
      fetchCategories();
    }, []);


    



    return (
      <section className="max-w-7xl mx-auto px-4 py-16 bg-gray-50">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-display font-bold mb-4">Browse Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our carefully curated collection of furniture and home decor pieces
          </p>
        </div>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories && categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
              className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                
                <img
                  src={category.imageUrl}
                  alt={category.imageAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-xs text-white/80">{category.imageCredit}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {category}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {category.itemCount} items
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                
                <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
                  Shop Now
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }; */


  const CategoryCard = ({ title, icon, route }) => {
    const navigate = useNavigate();
    
    return (
      <div 
        className="bg-white rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition-shadow duration-300"
        onClick={() => navigate(route)}
      >
        <div className="mb-4 text-center">
          {icon}
        </div>
        <h3 className="text-center font-medium text-gray-800">{title}</h3>
      </div>
    );
  };
  
  const CategorySection = () => {
    const navigate = useNavigate();
    const rawCategories = [
      {
        title: "Living Room Furniture",
        route: "/category/living-room",
        icon: (
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 45H20V30C20 28.9 20.9 28 22 28H58C59.1 28 60 28.9 60 30V45Z" stroke="#000" strokeWidth="2" />
            <path d="M15 55V45H65V55" stroke="#000" strokeWidth="2" />
            <path d="M15 55L15 60" stroke="#000" strokeWidth="2" />
            <path d="M65 55L65 60" stroke="#000" strokeWidth="2" />
            <path d="M25 37H55" stroke="#FFC107" strokeWidth="4" />
          </svg>
        )
      },
      {
        title: "Bedroom Furniture",
        route: "/category/bedroom-furniture",
        icon: (
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="15" y="35" width="50" height="20" stroke="#000" strokeWidth="2" />
            <rect x="20" y="25" width="15" height="10" fill="#FFC107" stroke="#000" strokeWidth="2" />
            <rect x="45" y="25" width="15" height="10" fill="#FFC107" stroke="#000" strokeWidth="2" />
            <line x1="15" y1="55" x2="15" y2="65" stroke="#000" strokeWidth="2" />
            <line x1="65" y1="55" x2="65" y2="65" stroke="#000" strokeWidth="2" />
          </svg>
        )
      },
      {
        title: "Dining Room Furniture",
        route: "/category/dining-room-furniture",
        icon: (
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="20" width="20" height="5" fill="#FFC107" stroke="#000" strokeWidth="2" />
            <rect x="25" y="25" width="30" height="3" stroke="#000" strokeWidth="2" />
            <line x1="40" y1="28" x2="40" y2="40" stroke="#000" strokeWidth="2" />
            <rect x="20" y="40" width="40" height="3" stroke="#000" strokeWidth="2" />
            <line x1="25" y1="43" x2="25" y2="60" stroke="#000" strokeWidth="2" />
            <line x1="55" y1="43" x2="55" y2="60" stroke="#000" strokeWidth="2" />
            <rect x="15" y="50" width="10" height="15" rx="2" stroke="#000" strokeWidth="2" />
            <rect x="55" y="50" width="10" height="15" rx="2" stroke="#000" strokeWidth="2" />
          </svg>
        )
      },
      {
        title: "Office Furniture",
        route: "/category/office-furniture",
        icon: (
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="25" y="45" width="30" height="5" stroke="#000" strokeWidth="2" />
            <rect x="35" y="20" widtinuh="10" height="25" fill="#FFC107" stroke="#000" strokeWidth="2" />
            <line x1="40" y1="50" x2="40" y2="60" stroke="#000" strokeWidth="2" />
            <path d="M25 40C25 35.5817 28.5817 32 33 32H47C51.4183 32 55 35.5817 55 40V45H25V40Z" stroke="#000" strokeWidth="2" />
          </svg>
        )
      },
      {
        title: "Outdoor Furniture",
        route: "/category/outdoor-furniture",
        icon: (
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 40H60L55 60H25L20 40Z" stroke="#000" strokeWidth="2" />
            <path d="M30 40V30" stroke="#000" strokeWidth="2" />
            <path d="M50 40V30" stroke="#000" strokeWidth="2" />
            <path d="M25 50H55" stroke="#FFC107" strokeWidth="4" />
            <path d="M15 65C15 62.2386 17.2386 60 20 60H60C62.7614 60 65 62.2386 65 65" stroke="#000" strokeWidth="2" />
          </svg>
        )
      },
      {
        title: "Storage & Organization",
        route: "/category/storage-organization",
        icon: (
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="20" width="40" height="50" rx="2" stroke="#000" strokeWidth="2" />
            <rect x="25" y="25" width="30" height="10" rx="1" stroke="#000" strokeWidth="2" />
            <rect x="25" y="40" width="30" height="10" rx="1" stroke="#000" strokeWidth="2" />
            <rect x="25" y="55" width="30" height="10" rx="1" fill="#FFC107" stroke="#000" strokeWidth="2" />
          </svg>
        )
      }
    ];
  
    return (
      <div className="container mx-auto px-4 py-8 mb-8">
      <div className='flex items-center justify-between'>
      <h1 className="text-3xl font-bold">Categories</h1>
      <button 
          className="text-green-600 hover:text-green-800 transition-colors text-sm font-medium cursor-pointer"
          onClick={() => navigate('/category')}
        >
          View All Category →
        </button>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rawCategories.map(({ title, icon }, idx) => {
          // build query-param route on the fly
          const route = `/product?category=${encodeURIComponent(title)}`;
          return (
            <CategoryCard
              key={idx}
              title={title}
              icon={icon}
              route={route}
            />
          );
        })}
      </div>
    </div>
  );
};
  


  const Cardsection = () =>{
    return(
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center" data-aos="fade-up" data-aos-delay="300">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Shipping</h3>
              <p className="text-gray-600">WWe provide shipping in 72 hours.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">All our products come with a satisfaction guarantee.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Technical Support</h3>
              <p className="text-gray-600">Technical Maintenance Free Service for any Technical issues.</p>
            </div>
          </div>
        
    )
  }


  

  return (
    <div  className=''>
        <Carousel />
        <CategorySection />
        <FeaturedProducts featuredProducts={featuredProducts}/>
        <Cardsection />
        <Testimonials />
        
      
     </div>
  );
}

export default Home;