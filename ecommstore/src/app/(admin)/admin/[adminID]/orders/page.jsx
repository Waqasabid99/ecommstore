import Orders from '@/components/admin/pages/Orders'
import { getStats } from '@/lib/api/stat';

const page = async () => {
  return (
    <div>
      <Orders />
    </div>
  )
}

export default page