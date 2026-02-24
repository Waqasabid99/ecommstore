import Orders from '@/components/admin/pages/Orders'
import { getStats } from '@/lib/api/stat';

const page = async () => {
  const {data: stat} = await getStats();
  console.log(stat)
  return (
    <div>
      <Orders revenue={stat.revenue} />
    </div>
  )
}

export default page