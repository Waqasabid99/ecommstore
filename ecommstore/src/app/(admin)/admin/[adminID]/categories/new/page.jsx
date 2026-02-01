import CreateCategoryPage from '@/components/admin/pages/CreateNewCategory'
import { getCategories } from '@/lib/api/category';
import React from 'react'

const page = async () => {
  const categories = await getCategories();
  return (
    <div>
      <CreateCategoryPage existingCategories={categories} />
    </div>
  )
}

export default page