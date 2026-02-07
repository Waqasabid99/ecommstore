import Orders from '@/components/admin/pages/Orders'
import { getStats } from '@/lib/api/stat';

const page = async () => {
  const {data: stat} = await getStats();
  return (
    <div>
      <Orders revenue={stat.revenue} />
    </div>
  )
}

export default page