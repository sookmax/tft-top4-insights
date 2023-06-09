import TFTTrait, { TFTTraitParams } from "@/lib/model-trait";
import Popover from "./Popover";
import VerticalPercentageBar from "./VerticalPercentageBar";
import { TraitStats } from "@/lib/data-collector";
import HorizontalRankIndicator from "./HorizontalRankIndicator";

type Props = TFTTraitParams & {
  allTraitStats: TraitStats[];
};

export default function Trait({ allTraitStats, ...rest }: Props) {
  const trait = new TFTTrait(rest);
  const traitChosenPercentage = Math.floor(
    (trait.count / trait.compTotalCount) * 100
  );
  return (
    <div className="mb-5">
      <HorizontalRankIndicator
        rank={trait.rank}
        rankTotalCount={trait.rankTotalCount}
      />
      <div className="bg-gray-900 flex">
        <div className="p-4 flex-shrink-0 bg-black">
          <div
            className="w-10 h-10 border p-1"
            style={{
              borderColor: trait.borderColor,
              backgroundColor: trait.color,
            }}
          >
            <img
              src={trait.imageUrl}
              alt={trait.id}
              className="w-full h-full"
            />
          </div>
        </div>
        <div className="flex-grow p-2 overflow-x-auto space-y-1">
          <div className="flex justify-between">
            <div>
              <h2 className="space-x-2 flex font-[500]">
                <span>{`${trait.rank}.`}</span>
                <span className="space-x-1 flex items-center">
                  <span>{trait.name}</span>
                  <span className="text-sm">({trait.unitCount})</span>
                </span>
              </h2>
            </div>
            <div>
              <Popover
                closeButton={false}
                triggerAsChild
                trigger={
                  <button className="border border-gray-500 w-6 aspect-square text-sm">
                    U
                  </button>
                }
                content={
                  <div className="p-2 w-48 space-y-1">
                    <h2 className="space-x-1 text-center font-[500]">
                      {trait.name}
                    </h2>
                    <ul className="grid grid-cols-3 gap-1">
                      {trait.units.map((unit) => (
                        <Popover
                          key={unit.apiName}
                          triggerAsChild
                          trigger={
                            <button
                              className="border"
                              style={{ borderColor: unit.color }}
                            >
                              <img
                                src={unit.imageUrl}
                                alt={unit.apiName}
                                className="w-full h-full"
                              />
                            </button>
                          }
                          content={
                            <div className="p-4">
                              <p>{unit.name}</p>
                            </div>
                          }
                        />
                      ))}
                    </ul>
                  </div>
                }
              />
            </div>
          </div>
          <div className="text-xs text-gray-300 space-y-1">
            <p className="space-x-1">
              <span>-</span>
              <span>Seen</span>
              <span className="text-teal-200">{trait.count}</span>
              <span>times in</span>
              <span>{trait.compTotalCount}</span>
              <span>top4 comps</span>
              <span>{`(${traitChosenPercentage}%)`}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 text-xs p-3">
        <div>
          <p className="text-xs space-x-1 mb-1">
            <span className="text-gray-300">
              Traits frequently used together with
            </span>
            <span className="text-teal-200 space-x-[2px]">
              <span>{trait.name}</span>
              <span>({trait.unitCount})</span>
            </span>
          </p>
          <div className="relative">
            <ul className="flex space-x-2 overflow-x-auto">
              {trait.neighbors.map((neighbor) => {
                const neighborRank =
                  allTraitStats.findIndex(
                    (traitStats) => traitStats.id === neighbor.id
                  ) + 1;

                return (
                  <li key={neighbor.id} className="flex">
                    <VerticalPercentageBar
                      percentage={(neighbor.count / trait.count) * 100}
                    />
                    <Popover
                      closeButton={false}
                      side="top"
                      triggerAsChild
                      trigger={
                        <button
                          className="p-1 border w-9 h-9"
                          style={{
                            borderColor: neighbor.borderColor,
                            backgroundColor: neighbor.color,
                          }}
                        >
                          <img
                            className="w-full h-full"
                            src={neighbor.imageUrl}
                            alt={neighbor.id}
                          />
                        </button>
                      }
                      content={
                        <div className="p-2 w-48">
                          <h2 className="text-sm text-center space-x-[2px] font-[500]">
                            <span>{neighbor.name}</span>
                            <span>({neighbor.unitCount})</span>
                          </h2>
                          <p className="text-xs text-center text-gray-300 space-x-1">
                            <span>Rank:</span>
                            <span className="text-teal-200">
                              {neighborRank}
                            </span>
                            <span>/</span>
                            <span>60</span>
                          </p>
                          <div className="grid grid-cols-3 gap-1 mt-2">
                            {neighbor.units.map((unit) => (
                              // <div key={unit.apiName} className="aspect-square">
                              <Popover
                                key={unit.apiName}
                                triggerAsChild
                                trigger={
                                  <button
                                    className="aspect-square border"
                                    style={{ borderColor: unit.color }}
                                  >
                                    <img
                                      className="w-full h-full"
                                      src={unit.imageUrl}
                                      alt={unit.apiName}
                                    />
                                  </button>
                                }
                                content={
                                  <div className="p-4">
                                    <p>{unit.name}</p>
                                  </div>
                                }
                              />
                              // </div>
                            ))}
                          </div>
                        </div>
                      }
                    />
                  </li>
                );
              })}
            </ul>
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent via-transparent to-gray-800/80 md:to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
