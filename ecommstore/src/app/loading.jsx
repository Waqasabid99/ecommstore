import Loader from '@/components/ui/Loader'

const loading = () => {
  return (
    <div className='w-screen h-screen flex items-center justify-center'>
        <Loader size='md' text='' />
    </div>
  )
}

export default loading