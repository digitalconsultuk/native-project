
/**
 * hero component section
* */
import SeaFood from '../assets/seafood.png'
import SeaFood1 from '../assets/seafood_2.png'
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';

const HeroComponent = () => {
  return (
    <>
      <section className={'flex flex-col p-0 -mt-6 md:mt-2.5 md:flex-row md:gap-2'}>
        <div className={'flex flex-col md:flex-row md:flex-1/2 shadow-2xl'}>
          <h1 className={'text-left font-mono pt-4 md:pt-10 pl-2 align-middle pb-0 shadow-2xl rounded-2xl md:flex-row md:flex-1/2'}>
            <span className={'text-amber-500 text-3xl font-mono md:text-7xl'}>Bold Flavors,<br/>Fresh Catches</span>
            <p className={'mt-2 text-wrap text-lg md:text-2xl md:pl-3'}>Delight in our signature seafood boil, packed with the freshest shrimp, crab legs,
              and clams, all seasoned to perfection. Native Cave Restaurant brings the ocean’s best to your table, crafted with care and flavor in every bite.
            </p>
            <Button size={'large'} endIcon={<SendIcon/>} type={'submit'} className={'rounded-lg mt-2 mb-5 text-xs md:mt-2.5 md:ml-2.5 border-2 md:text-md hover:bg-amber-500 hover:cursor-pointer p-2'}>
              Book
            </Button>
          </h1>
        </div>
        <div className={'flex flex-col justify-center shadow-2xl rounded-2xl md:flex-row md:justify-between md:flex-1/2'}>
          <img srcSet={`${SeaFood} 1920w , ${SeaFood1} 600w`} className={'rounded-2xl w-full h-auto object-cover max-h-125'}
               sizes="(max-width: 600px) 100vw, 1920px"
               src={SeaFood}
               alt="Delicious Gourmet Seafood"/>
        </div>
      </section>
    </>
  )
}
export {HeroComponent}