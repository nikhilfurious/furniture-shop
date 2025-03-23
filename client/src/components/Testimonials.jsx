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
        name: "Sarah Johnson",
        role: "Interior Designer",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        text: "I've been shopping here for years and the quality of furniture never disappoints. Their customer service is exceptional and the delivery is always on time.",
      },
      {
        id: 2,
        name: "Michael Chen",
        role: "Homeowner",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        text: "The minimalist collection transformed my living space completely. The pieces are not only beautiful but incredibly functional and durable.",
      },
      {
        id: 3,
        name: "Emily Rodriguez",
        role: "Architect",
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        text: "As an architect, I appreciate quality craftsmanship and attention to detail. This store consistently delivers both, which is why I recommend them to all my clients.",
      },
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