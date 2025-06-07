'use server'

import { createUserAccount } from "../auth"

export async function registerUserAction(formData : FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if(!email || !password) throw new Error('Missing email or password')

    const user = await createUserAccount({name ,email, password})
}