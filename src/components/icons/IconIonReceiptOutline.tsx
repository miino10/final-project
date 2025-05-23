import * as React from "react";

// By: ion
// See: https://v0.app/icon/ion/receipt-outline
// Example: <IconIonReceiptOutline width="24px" height="24px" style={{color: "#86600"}} />

export const IconIonReceiptOutline = ({
  height = "1em",
  strokeWidth = "32",
  fill = "none",
  focusable = "false",
  ...props
}: Omit<React.SVGProps<SVGSVGElement>, "children">) => (
  <svg
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    height={height}
    focusable={focusable}
    {...props}
  >
    <path
      fill={fill}
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M160 336V48l32 16l32-16l31.94 16l32.37-16L320 64l31.79-16l31.93 16L416 48l32.01 16L480 48v224"
    />
    <path
      fill={fill}
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M480 272v112a80 80 0 0 1-80 80a80 80 0 0 1-80-80v-48H48a15.86 15.86 0 0 0-16 16c0 64 6.74 112 80 112h288"
    />
    <path
      fill={fill}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      d="M224 144h192m-128 80h128"
    />
  </svg>
);
