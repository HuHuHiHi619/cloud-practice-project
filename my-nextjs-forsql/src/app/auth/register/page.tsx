'use client'

import { registerUserAction } from "@/lib/actions/registerActions";
import React from "react";

function Loginpage() {
  
  return (
    <form action={registerUserAction}>
      <div>
        <span>Username</span>
        <input className="text-black" type="text" placeholder="Username" name="name" required/>
      </div>
      <div>
        <span>Email</span>
        <input className="text-black" type="email" placeholder="Email" name="email" required/>
      </div>
      <div>
        <span>Password</span>
        <input className="text-black" type="password" placeholder="Password" name="password" required/>
      </div>

        <button className="bg-blue-600 p-5" type="submit">Register</button>
    
    </form>
  );
}

export default Loginpage;
