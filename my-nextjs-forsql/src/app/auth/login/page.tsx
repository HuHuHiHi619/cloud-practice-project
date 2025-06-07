'use client'

import { loginUserAction } from "@/lib/actions/loginActions";
import React from "react";
import { useFormState } from "react-dom";

function Loginpage() {
const [state, formAction] = useFormState(
  loginUserAction as (
    state: { error: string },
    formData: FormData
  ) => Promise<{ error: string }>,
  { error: "" }
);
  
  return (
    <form action={formAction}>
      <div>
        <span>Email</span>
        <input className="text-black" type="email" placeholder="Email" name="email" required/>
      </div>
      <div>
        <span>Password</span>
        <input className="text-black" type="password" placeholder="Password" name="password" required/>
      </div>
        { state.error && <p className="text-red-600">{state.error}</p>}
        <button className="bg-blue-600 p-5" type="submit">Login</button>
    
    </form>
  );
}

export default Loginpage;
