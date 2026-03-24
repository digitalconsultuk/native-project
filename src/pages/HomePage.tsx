

import '../App.css'
import {PageComponent} from "../components/PageComponent.tsx";
import {HeroComponent} from "../components/HeroComponent.tsx";
const HomePage = () => {
  return (
    <>
      <section className={'flex flex-col gap-2 mt-20'}>
        <div className={'flex flex-col gap-2'}>
          <HeroComponent/>
        </div>
        <PageComponent/>
      </section>
    </>
  )
}
export { HomePage };