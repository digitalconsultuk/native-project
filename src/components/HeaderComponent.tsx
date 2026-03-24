
import '../App.css'
import {Link} from "react-router";
import native_cave from '../assets/native_cave.png'
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';

const HeaderComponent = () => {
  return (
    <>
      <main className={'hidden md:flex w-full flex-col'}>
        <header className={'mb-5 p-4 shadow-md z-1000 w-full flex-col  min-w-2 bg-white md:fixed'}>
          <nav className={'max-w-7xl mx-auto flex flex-row items-center justify-between gap-4'}>
            <div className={'flex flex-row'}>
              <Link to="/home" className={'text-sm font-mono'}>
                <img className={'w-29 md:w-32 lg:w-44 h-auto object-contain'}
                     src={native_cave}
                     alt={'native_logo'}/>
              </Link>
            </div>
            <div className={'flex flex-row gap-4'}>
              <Link to="/home" className={'text-md md:text-xl font-mono'}>Home</Link>
              <Link to="/" className={'text-md md:text-xl font-mono'}>About</Link>
              <Link to="/" className={'text-md md:text-xl font-mono'}>Contact</Link>
            </div>
            <div className={'flex flex-row'}>
              <span className={'text-[20px] font-mono text-amber-500'}><LocalPhoneIcon className={'mr-2 text-black'}/>01913434344</span>
            </div>
          </nav>
        </header>
      </main>
    </>
  )
}
export  {HeaderComponent};