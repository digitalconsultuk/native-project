
import '../../styles/App.css'
import {NavLink, Link} from "react-router";
import native_cave from '../../assets/images/native_cave.png'
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
              <NavLink to="/home" className={({ isActive }) =>
                isActive ? "text-amber-500 text-md md:text-xl font-mono underline" : "text-black text-md md:text-xl font-mono"
              }>Home</NavLink>
              <NavLink to="/#menusection" className={({ isActive }) =>
                isActive ? "text-amber-500 text-md md:text-xl font-mono underline" : "text-black text-md md:text-xl font-mono"
              }>Menu</NavLink>
              <NavLink to="/contact" className={({ isActive }) =>
                isActive ? "text-amber-500 text-md md:text-xl font-mono underline" : "text-black text-md md:text-xl font-mono"
              }>Contact</NavLink>
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