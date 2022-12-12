import Image from 'next/image';
import fufu from '../public/fufubay.jpg';

const Highlight = () => {
    return (
        <div>
            <Image src="/fufubay.jpg" width={500} height={275} alt={''}/>
        </div>
    );
}

export default Highlight;