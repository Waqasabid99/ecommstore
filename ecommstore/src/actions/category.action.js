// app/actions/category.actions.js
'use server';

import { revalidateTag } from 'next/cache';
import { baseUrl } from '@/lib/utils';
import axios from 'axios';
import { cookies } from 'next/headers';


export async function createCategoryAction(formData) {
  const cookieStore = await cookies();
  const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');

  const { data } = await axios.post(
    `${baseUrl}/categories/create`,
    formData,
    {
      headers: {
        Cookie: cookieString,
      },
    }
  );

  if (!data.success) {
    throw new Error(data.error || 'Failed to create category');
  }

  revalidateTag('categories');

  return data;
}

export async function fetchCategoryById(categoryID) {
  const cookieStore = await cookies();
  const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
  const { data } = await axios.get(`${baseUrl}/categories/${categoryID}`, {
    headers: {
      Cookie: cookieString,
    }
  });

  if (!data.success) {
    throw new Error('Failed to fetch category');
  }
  console.log(data)
  return data.data;

}

export async function updateCategoryAction(formData) {
  const cookieStore = await cookies();
  const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
  const { data } = await axios.patch(
    `${baseUrl}/categories/update/${formData.id}`,
    formData,
    {
      headers: {
        Cookie: cookieString,
      },
    }
  );

  if (!data.success) {
    throw new Error(data.error || 'Failed to update category');
  }

  revalidateTag('categories');

  return data;
}

export async function deleteCategoryAction(id) {
  const cookieStore = await cookies();
  const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
  const { data } = await axios.delete(
    `${baseUrl}/categories/delete/${id}`,
    {
      headers: {
        Cookie: cookieString,
      },
    }
  );

  if (!data.success) {
    throw new Error(data.error || 'Failed to delete category');
  }

  revalidateTag('categories');

  return data;
}