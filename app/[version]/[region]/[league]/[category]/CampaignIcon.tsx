export default function CampaignIcon({
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
      className={className}
      style={style}
      fill="currentColor"
    >
      <path d="M730 606v-60h150v60H730Zm50 290-121-90 36-48 121 90-36 48Zm-82-503-36-48 118-89 36 48-118 89ZM210 856V696h-70q-24.75 0-42.375-17.625T80 636V516q0-24.75 17.625-42.375T140 456h180l200-120v480L320 696h-50v160h-60Zm90-280Zm260 134V442q27 24 43.5 58.5T620 576q0 41-16.5 75.5T560 710ZM140 516v120h196l124 74V442l-124 74H140Z" />
    </svg>
  );
}
