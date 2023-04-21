import { classNames, generateIndexArray } from "@/app/utils";

export default function HorizontalRankIndicator({
  rank,
  rankTotalCount,
}: {
  rank: number;
  rankTotalCount: number;
}) {
  return (
    <div className="flex h-2">
      {generateIndexArray(rankTotalCount).map((i) => (
        <div key={i} className="flex-1 p-[1px]">
          <div
            className={classNames(
              "h-full",
              rank === i + 1 ? "bg-teal-200" : "bg-gray-800"
            )}
          ></div>
        </div>
      ))}
    </div>
  );
}
