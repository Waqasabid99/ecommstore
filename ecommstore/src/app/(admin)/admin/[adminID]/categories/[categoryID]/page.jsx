import EditCategoryPage from '@/components/admin/pages/EditCategory'
import { getCategories } from '@/lib/api/category';
import React from 'react'

const page = async () => {
    const categories = await getCategories();
  return (
    <div>
        <EditCategoryPage existingCategories={categories}/>
    </div>
  )
}

export default page