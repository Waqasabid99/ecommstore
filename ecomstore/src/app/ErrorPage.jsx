import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useNavigate } from 'react-router-dom';
const ErrorPage = () => {
    const navigate = useNavigate();
    return (
        <div className='bg-white h-screen flex flex-col items-center justify-center overflow-y-hidden'>
            <div>
                <DotLottieReact
                    src="/error.lottie"
                    loop
                    autoplay
                />
            </div>
            <h1 className='text-3xl md:text-5xl font-bold text-center mt-4 text-gray-700'>Oops! Something went wrong.</h1>
            <p className='text-gray-500 mt-2 text-center'>The page you are looking for does not exist or an error occurred.</p>
            <button onClick={() => navigate(-1)} className='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>Go Back</button>
        </div>
    )
}

export default ErrorPage
