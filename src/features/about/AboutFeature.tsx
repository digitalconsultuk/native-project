import FoodBg from '@assets/images/sea.png';
import { Button } from '@mui/material';
import { Link } from 'react-router';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * AboutFeature - A modern, minimal "About Us" section
 * featuring the Native Cave story with a clean layout.
 */
const AboutFeature = () => {
  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Image Side */}
          <div className="relative flex-1 w-full group">
            <div className="absolute -inset-4 bg-amber-100 rounded-[40px] -rotate-2 transition-transform group-hover:rotate-0 duration-500" />
            <div className="relative rounded-4xl overflow-hidden shadow-2xl aspect-4/3">
              <img 
                src={FoodBg} 
                alt="Our Culinary Heritage" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
            </div>
            
            {/* Minimal Stat Overlay */}
            <div className="absolute -bottom-6 -right-6 bg-amber-500 text-white p-6 rounded-3xl shadow-xl hidden md:block">
              <p className="text-3xl font-bold">15+</p>
              <p className="text-sm font-medium opacity-90 text-nowrap">Years of Excellence</p>
            </div>
          </div>

          {/* Content Side */}
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-600 text-sm font-semibold tracking-wide uppercase">
                <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                Our Story
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                Authentic Flavors from the <span className="text-amber-500 text-nowrap italic">Deep Blue</span>
              </h2>
            </div>

            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p>
                Native Cave was born from a passion for traditional seafood preparation and a desire to bring the ocean's freshest treasures to the heart of the city. We believe in bold seasoning, sustainable sourcing, and the joy of a shared meal.
              </p>
              <p>
                Every dish we serve is a tribute to our coastal heritage, crafted with precision and served with the warmth that only a true family-run kitchen can provide.
              </p>
            </div>

            <div className="pt-4">
              <Button 
                component={Link}
                to="/home"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: '#f59e0b',
                  color: '#f59e0b',
                  px: 4,
                  py: 1.5,
                  borderRadius: '16px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  borderWidth: '2px',
                  '&:hover': {
                    borderColor: '#d97706',
                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                    borderWidth: '2px',
                  }
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { AboutFeature };
