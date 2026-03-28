/**
 * Menu Component
 * */
import {type FunctionComponent} from "react";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import FoodImage1 from '../assets/food_2.png'
import FoodImage2 from '../assets/image-bg-1.jpg'
import FoodImage3 from '../assets/food_1.png'
import * as React from "react";
import {ModalComponent} from "./ModalComponent.tsx";

const MenuComponent: FunctionComponent = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const images = [
    {
      name: 'Grill',
      description: 'Charred over open flames and seasoned with our signature house rub. Smoky, tender, and served straight ' +
        'from the fire to your plate.',
      image: FoodImage1,
      action: handleOpen
    },
    {
      name: 'Salad',
      description: 'Lizards are a widespread group of squamate reptiles, with over 6,000\n' +
        'species, ranging across all continents except Antarctica',
      image: FoodImage2,
      action: handleOpen
    },
    {
      name: 'Seafood',
      description: 'Lizards are a widespread group of squamate reptiles, with over 6,000\n' +
        'species, ranging across all continents except Antarctica',
      image: FoodImage3,
      action: handleOpen
    }
  ]

  return (
    <>
      <div className={'mt-5 mb-1 flex justify-center items-center'}>
        <h1 className={'text-center font-mono text-3xl'}> Menu Section </h1>
      </div>
      <section className={'flex flex-row justify-center items-center'}>
        <div className="max-w-7xl mx-auto p-6 bg-amber-200 rounded-3xl mb-10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((data, index) => (
              <Card sx={{ maxWidth: 300 }} className={'rounded-2xl shadow-2xl mt-2 mb-2'} key={index}>
                <CardMedia
                  sx={{ height: 150 }}
                  image={data.image}
                  title={data.name}
                />
                <CardContent>
                  <h2 className={'text-3xl mt-0.5 font-mono'}>{data.name}</h2>
                  <p className={''}>
                    {data.description}
                  </p>
                </CardContent>
                <CardActions>
                  <Button size="medium" className={'-mt-5'} onClick={data.action}>View</Button>
                </CardActions>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <ModalComponent open={open} onClose={handleClose}/>
    </>
  )
}
export {MenuComponent};