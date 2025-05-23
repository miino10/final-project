import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import React from "react";

function Signin() {
  return (
    <div className=" w-full h-screen flex justify-center items-center">
      <SignIn signUpUrl={"/sign-up"} redirectUrl={"/"} />
    </div>
  );
}

export default Signin;
