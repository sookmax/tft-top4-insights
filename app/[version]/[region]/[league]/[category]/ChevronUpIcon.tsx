export default function ChevronUpIcon({
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
      <path d="m283 711-43-43 240-240 240 239-43 43-197-197-197 198Z" />
    </svg>
  );
}
