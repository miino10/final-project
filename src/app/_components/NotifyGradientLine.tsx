import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import React from "react";

export default function notifyGradientLine() {
  return (
    <div className="flex justify-center text-center my-5">
      <HoverBorderGradient
        containerClassName="rounded-full"
        as="button"
        className="text-gray-800 dark:text-gray-200 flex items-center gap-2 font-medium">
        <MyLogo />
        <span>Accounting Software</span>
      </HoverBorderGradient>
    </div>
  );
}

export const MyLogo = () => {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-black dark:text-white">
      {/* Hexagonal frame */}
      <path
        d="M12 3L20.6603 8V16L12 21L3.33975 16V8L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="opacity-40"
      />
      {/* Inner abstract design */}
      <path
        d="M8 9C8 9 10 7 12 7C14 7 16 9 16 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 15C16 15 14 17 12 17C10 17 8 15 8 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Central dynamic element */}
      <path
        d="M12 8V16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Side connectors */}
      <path
        d="M9 12H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-75"
      />
      {/* Accent dots */}
      <circle cx="8" cy="9" r="1" fill="currentColor" />
      <circle cx="16" cy="9" r="1" fill="currentColor" />
      <circle cx="8" cy="15" r="1" fill="currentColor" />
      <circle cx="16" cy="15" r="1" fill="currentColor" />
    </svg>
  );
};
