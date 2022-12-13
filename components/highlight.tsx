import Image from 'next/image'
import fufubay from 'public/fufubay.jpg'

const Highlight = () => {
  return (
    <div>
        <Image src={fufubay} width={500} height={275} alt={''}/>
    </div>
  )
}

export default Highlight
