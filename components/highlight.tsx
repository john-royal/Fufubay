import React, {useState} from 'react';
import { Slider } from './slider';
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from 'react-icons/fa';

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
    <section className='columns box'>
        &nbsp; &nbsp; &nbsp;<FaArrowAltCircleLeft className='column is-pulled-left' size={70} onClick={prevSlide}/>
    {Slider.map((slide, index) => {
        return (
            <div className={index === current ? 'slides active' : 'slide'} key={index}>
                <div className='column is-full'>
                {index === current && (
                    <img src={slide.image} alt="test"/>
                )} &nbsp;
                </div>
            </div>
        )
    })}
        <FaArrowAltCircleRight className=' column' size={70} onClick={nextSlide}/> &nbsp; &nbsp; &nbsp;
    </section>
  )
}

export default Highlight
