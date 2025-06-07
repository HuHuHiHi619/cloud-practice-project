import { logoutUserAccount } from '@/lib/auth'
import React from 'react'

function LogoutPage() {
    const handleLogout = async () => {
        try{
            const response = await logoutUserAccount()
        } catch(error){
            console.error(error)
        }
    }
  return (
    <div onClick={handleLogout} className='text-2xl bg-red-600 text-white'>Logout</div>
  )
}

export default LogoutPage