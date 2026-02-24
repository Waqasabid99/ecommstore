import Category from '@/components/admin/pages/Category'
import { getCategories } from '@/lib/api/category';
import React from 'react'

const page = async () => {
  const data = await getCategories();
  return (
    <div>
      <Category categories={data} />
    </div>
  )
}

export default page