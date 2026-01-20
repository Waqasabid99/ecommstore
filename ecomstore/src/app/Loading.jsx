import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LoadingPage = () => {
  return (
    <div className='h-screen overflow-hidden bg-white'>
      <DotLottieReact 
        src="/loading.lottie"
        loop
        autoplay
      />
    </div>
  )
}

export default LoadingPage
