import { log } from "console";

interface UserData {
    name: string;
    email: string;
    password: string;
}

type LoginCredentials = Omit<UserData,'name'>

interface AuthResponse {
  message: string
  user?: {
    id:string
    email:string
    name:string
  }
}

export async function createUserAccount(userData: UserData) : Promise<AuthResponse> {
  try{
    const response = await fetch('http://localhost:4000/api/register', {
      method: 'POST',
      headers:{
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(userData)
    })

    const data = await response.json()
    if(!response.ok){
        throw new Error(data.message || 'Failed to create user account') 
    }
    return data
  } catch (error){
    console.error('Error creating user account:', error)
    throw error
  }
}

export async function loginUserAccount(loginCredentials: LoginCredentials) : Promise<AuthResponse> {
  try{
    const response = await fetch('http://localhost:4000/api/login',{
      method: 'POST',
      headers: {
        'Content-Type':'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(loginCredentials)
    })
    const data = await response.json()
    if(!response.ok){
      throw new Error('Failed to login user account')
    }
    return data
  } catch(error){
    console.error('Error logining user account:', error)
    throw error
  }
}

export async function logoutUserAccount() {
  try{
    const response = await fetch('http://localhost:4000/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    const data = await response.json()
    if(!response.ok){
      throw new Error('Failed to logout user account')
    }
    return data
  } catch(error){
    console.error('Error logining user account:', error)
    throw error
  }
}

export async function updateUserAccount() {
  // Implementation for updating a user account
}

export async function getUserAccount() {
  // Implementation for retrieving a user account
}
