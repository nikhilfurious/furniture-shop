import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Star } from "lucide-react";

const Testimonials = () => {
    useEffect(() => {
        AOS.init({
          duration: 1100,
          once: false,
          mirror: false,
          offset:200
        });
        
        // Clean up AOS when component unmounts
        return () => {
          AOS.refresh();
        };
      }, []);
      const testimonials = [
        {
          id: 1,
          name: "Prakash Siddaradi",
          role: "Homeowner",
          image: "/pers.png", // 
     
      
          text: "My experience at Spot Furnish Rentals was exceptional! The staff was incredibly polite and attentive, ensuring all my needs were met. Management was prompt in addressing inquiries, making the process seamless. The product installation was easy and hassle-free. Most importantly, the high-quality furnishings exceeded my expectations, elevating my space beautifully!",
        },
        {
          id: 2,
          name: "Amit Kittur",
          role: "CTO Mememta",
          image: "/pers.png", // 
      
          text: "Excellent experience with Spot Furnish Rentals. They supplied high-quality office furniture on rent, and their service was top-notch. The team was professional, responsive, and delivered the furniture on time. The furniture looks great and is comfortable too! Highly recommend for any office furniture rental needs",
        },
        {
          id: 3,
          name: "Rohan Mehta",
          role: "Architect",
          image: "/pers.png", // 
      
      
          text: "I’ve partnered with Spot Furnish on several projects. The furniture not only elevates the space but also arrives on schedule. Their customer support is top-notch—truly a pleasure to work with.",
        }
      ];
      
  
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it – hear from some of our satisfied customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-6">
                  <div className="mr-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
                <div className="mt-4 flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  export default Testimonials;