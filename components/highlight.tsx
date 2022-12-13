import React, {useState} from 'react';
import { Slider } from './slider';
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from 'react-icons/fa';
import './style.module.css'

const Highlight = ({slides }) => {

const [current, setCurrent] = useState(0)
const length = slides.length

const nextSlide = () => {
    setCurrent(current === length - 1 ? 0 : current + 1 )
}

const prevSlide = () => {
    setCurrent(current === 0 ? length - 1 : current - 1)
}

if (!Array.isArray(slides) || slides.length <= 0) {
    return null;
}
  return (
    <section className='slider'>
        <FaArrowAltCircleLeft className='left-arrow' onClick={prevSlide}/>
        <FaArrowAltCircleRight className='right-arrow' onClick={nextSlide}/>
    {Slider.map((slide, index) => {
        return (
            <div className={index === current ? 'slides active' : 'slide'} key={index}>
                {index === current && (
                    <img src={slide.image} alt="test" className='picture'/>
                )} &nbsp;
                </div>
        )
    })}
    </section>
  )
}

export default Highlight
