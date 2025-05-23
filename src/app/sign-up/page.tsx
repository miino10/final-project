import { SignUp } from "@clerk/nextjs";
import React from "react";

function signup() {
  return (
    <div className=" w-full h-screen flex justify-center items-center">
      <SignUp signInUrl={"/sign-in"} redirectUrl={"/sign-in"} />
    </div>
  );
}

export default signup;
