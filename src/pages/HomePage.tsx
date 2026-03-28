

import '../App.css'
import {HeroComponent} from "../components/HeroComponent.tsx";
import {MenuComponent} from "../components/MenuComponent.tsx";
const HomePage = () => {
  return (
    <>
      <section className={'flex flex-col gap-2 mt-20'}>
        <div className={'flex flex-col gap-2'}>
          <HeroComponent/>
        </div>
        <MenuComponent/>
      </section>
    </>
  )
}
export { HomePage };