import * as React from "react";

function IconDiagram({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 18V12M12 18V13M15 18V10M17 5V2C17 1.44772 16.5523 1 16 1H8C7.44772 1 7 1.44772 7 2V5M17 5H7M17 5V4C17 3.44772 17.4477 3 18 3H20C20.5523 3 21 3.44772 21 4V22C21 22.5523 20.5523 23 20 23H4C3.44772 23 3 22.5523 3 22V4C3 3.44772 3.44772 3 4 3H6C6.55228 3 7 3.44772 7 4V5"
        stroke="currentColor"
        strokeWidth="1.66667"
      />
    </svg>
  );
}

export default IconDiagram;
