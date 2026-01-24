'use client';
import useAuthStore from '@/store/authStore';
import React, { useEffect } from 'react'

const CheckAuth = ({children}) => {
    const { checkAuth } = useAuthStore();
    useEffect(() => {
        checkAuth();
    }, [])
  return (
    <div>{children}</div>
  )
}

export default CheckAuth;