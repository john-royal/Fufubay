import React, { useState } from 'react'
import { FaStar } from 'react-icons/fa'

export default function Star ({ rating, setRating }: { rating: number, setRating: (rating: number) => void }) {
  const [hover, setHover] = useState(0)

  return (
        <div>
            {[1, 2, 3, 4, 5].map(ratingValue => (
            <label key={ratingValue}>
                <input className="is-hidden" type="radio" name="rating" value={ratingValue} onClick={() => setRating(ratingValue)} />
                <FaStar size={50} color={ratingValue <= Math.max(rating, hover) ? '#ffc107' : '#e4e5e9'} onMouseEnter={() => setHover(ratingValue)} onMouseLeave={() => setHover(0)}/>
            </label>
            ))}
        </div>
  )
}
