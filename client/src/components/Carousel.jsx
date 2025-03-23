import Slider from "react-slick";

const carouselItems = [
  {
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    title: 'Modern Living',
    subtitle: 'Transform your space with our curated collection',
  },
  {
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    title: 'Spring Collection',
    subtitle: 'Up to S0% off on selected furniture',
  },
  {
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
    title: 'Minimalist Design',
    subtitle: 'Less is more. Discover our minimalist furniture',
  },
]

const Carousel = () => {
    const sliderSettings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 5000,
    };
  
    return (
      <Slider {...sliderSettings}>
        {carouselItems.map((item, index) => (
          <div key={index} className="relative h-[500px]">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="text-white">
                <h2 className="text-5xl font-display font-bold mb-4">
                  {item.title}
                </h2>
                <p className="text-xl">{item.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    );
  };
  
  export default Carousel;