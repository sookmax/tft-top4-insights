import TFTAugment, { TFTAugmentParams } from "@/lib/model-augment";
import Popover from "./Popover";
import InfoIcon from "./InfoIcon";
import HorizontalRankIndicator from "./HorizontalRankIndicator";

export default function Augment(props: TFTAugmentParams) {
  const augment = new TFTAugment(props);
  return (
    <div className="bg-gray-900 flex flex-col mb-3">
      <HorizontalRankIndicator
        rank={augment.rank}
        rankTotalCount={augment.rankTotalCount}
      />
      <div className="flex flex-shrink-0">
        <div className="h-14 aspect-square flex-shrink-0 border border-gray-500">
          <img
            className="w-full h-full"
            src={augment.imageUrl}
            alt={augment.id}
          />
        </div>
        <div className="flex-grow px-2 py-1">
          <div className="flex space-x-2">
            <div className="space-x-1 text-lg font-[500]">
              <span className="mr-1">{`${augment.rank}.`}</span>
              <span>{augment.name}</span>
            </div>
            <Popover
              closeButton={false}
              triggerAsChild
              trigger={
                <button>
                  <InfoIcon className="w-5 h-5 text-gray-300" />
                </button>
              }
              content={
                <div className="w-48 p-3">
                  <h2 className="font-[500]">{augment.name}</h2>
                  <p
                    className={"text-sm text-gray-300 ml-1"}
                    dangerouslySetInnerHTML={{ __html: augment.desc }}
                  />
                </div>
              }
            />
          </div>
          <div className="text-xs text-gray-400 space-x-1">
            <span>-</span>
            <span>Seen</span>
            <span className="text-teal-200">{augment.count}</span>
            <span>times in</span>
            <span className="text-gray-200">{augment.compTotalCount}</span>
            <span>comps</span>
            <span>{`(${Math.floor(
              (augment.count / augment.compTotalCount) * 100
            )}%).`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
