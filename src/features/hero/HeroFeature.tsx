
/**
 * Hero component section
 */
import SeaPic from '@assets/images/img.png'
import SeaFood1 from '@assets/images/seafood_2.png'
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { Link } from 'react-router';

const HeroFeature = () => {
  return (
    <section className="flex flex-col gap-6 md:flex-row items-center p-4 md:p-8 max-w-7xl mx-auto">
      {/* Text Content Area */}
      <div className="flex flex-col flex-1 gap-6 p-6 md:p-10 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-300 hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
        <h1 className="text-left leading-tight">
          <span className="text-amber-500 text-4xl md:text-7xl font-extrabold tracking-tight block">
            Bold Flavors,<br/>Fresh Catches
          </span>
        </h1>
        
        <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-lg">
          Delight in our signature seafood boil, packed with the freshest shrimp, crab legs,
          and clams, all seasoned to perfection. Native Cave Restaurant brings the ocean’s best to your table.
        </p>
        
        <div className="flex justify-start">
          <Button 
            component={Link}
            to="/booking"
            variant="contained"
            size="large" 
            endIcon={<SendIcon />} 
            sx={{
              backgroundColor: '#f59e0b', // amber-500
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              fontSize: { xs: '0.9rem', md: '1.1rem' },
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)',
              '&:hover': {
                backgroundColor: '#d97706', // amber-600
                boxShadow: '0 6px 20px rgba(217, 119, 6, 0.5)',
              }
            }}
          >
            Book Now
          </Button>
        </div>
      </div>

      {/* Image Area */}
      <div className="flex-1 w-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] group bg-gray-50/30 flex items-center justify-center">
        <img
          srcSet={`${SeaPic} 1920w, ${SeaFood1} 600w`}
          className="w-full h-auto md:h-113.25 object-contain md:object-fill transition-transform duration-500 group-hover:scale-105"
          src={SeaPic}
          alt="Delicious Gourmet Seafood"
        />
      </div>
    </section>
  )
}
export { HeroFeature }