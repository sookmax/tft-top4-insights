import React from "react";

export default function ArrowDownIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="48"
      viewBox="0 96 960 960"
      width="48"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M480 696 280 497h400L480 696Z" />
    </svg>
  );
}
