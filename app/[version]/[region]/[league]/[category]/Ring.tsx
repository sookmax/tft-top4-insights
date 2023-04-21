// https://css-tricks.com/building-progress-ring-quickly/

import { classNames } from "@/app/utils";

type Props = {
  className?: string;
  stroke?: string;
  strokeWidth?: number;
  progress?: number;
};

const VIEWBOX_SIZE = 64;

export default function Ring({
  className,
  stroke = "#e2e8f0",
  strokeWidth = 4,
  progress = 0.3,
}: Props) {
  const radius = Math.floor(VIEWBOX_SIZE / 2) - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      className={classNames(className)}
      width={VIEWBOX_SIZE}
      height={VIEWBOX_SIZE}
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
    >
      <circle
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={Math.floor(VIEWBOX_SIZE / 2)}
        cy={Math.floor(VIEWBOX_SIZE / 2)}
      />
      <circle
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={(1 - progress) * circumference}
        fill="transparent"
        r={radius}
        cx={Math.floor(VIEWBOX_SIZE / 2)}
        cy={Math.floor(VIEWBOX_SIZE / 2)}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
        }}
      />
    </svg>
  );
}
