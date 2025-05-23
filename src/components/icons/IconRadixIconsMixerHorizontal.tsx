import * as React from "react";

// By: radix-icons
// See: https://v0.app/icon/radix-icons/mixer-horizontal
// Example: <IconRadixIconsMixerHorizontal width="24px" height="24px" style={{color: "#000000"}} />

export const IconRadixIconsMixerHorizontal = ({
  height = "1em",
  fill = "currentColor",
  focusable = "false",
  ...props
}: Omit<React.SVGProps<SVGSVGElement>, "children">) => (
  <svg
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 15 15"
    height={height}
    focusable={focusable}
    {...props}
  >
    <path
      fill={fill}
      fillRule="evenodd"
      d="M5.5 3a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3M3 5c.017 0 .033 0 .05-.002a2.5 2.5 0 0 0 4.9 0A.507.507 0 0 0 8 5h5.5a.5.5 0 0 0 0-1H8c-.017 0-.033 0-.05.002a2.5 2.5 0 0 0-4.9 0A.507.507 0 0 0 3 4H1.5a.5.5 0 0 0 0 1zm8.95 5.998a2.5 2.5 0 0 1-4.9 0A.507.507 0 0 1 7 11H1.5a.5.5 0 0 1 0-1H7c.017 0 .033 0 .05.002a2.5 2.5 0 0 1 4.9 0A.506.506 0 0 1 12 10h1.5a.5.5 0 0 1 0 1H12c-.017 0-.033 0-.05-.002M8 10.5a1.5 1.5 0 1 1 3 0a1.5 1.5 0 0 1-3 0"
      clipRule="evenodd"
    />
  </svg>
);
