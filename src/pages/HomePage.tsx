

import '@styles/App.css'
import {HeroFeature } from "@features/hero/HeroFeature.tsx";
import {MenuGrid} from "@features/menu/MenuGrid.tsx";
import {AboutFeature} from "@features/about/AboutFeature.tsx";

const HomePage = () => {
  return (
    <>
      <section className={'flex flex-col gap-2 mt-20'}>
        <div className={'flex flex-col gap-2'}>
          <HeroFeature/>
        </div>
        <AboutFeature />
        <MenuGrid/>
      </section>
    </>
  )
}
export { HomePage };