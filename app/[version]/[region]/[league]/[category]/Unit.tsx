import { UnitStats } from "@/lib/data-collector";
import TFTUnit, { ItemType, TFTUnitParams } from "@/lib/model-unit";
import Popover from "./Popover";
import VerticalPercentageBar from "./VerticalPercentageBar";
import React from "react";
import { classNames, generateIndexArray } from "@/app/utils";
import HorizontalRankIndicator from "./HorizontalRankIndicator";

type Props = TFTUnitParams & {
  allUnitStats: UnitStats[];
};

export default function Unit({ allUnitStats, ...rest }: Props) {
  const unit = new TFTUnit(rest);
  const unitChosenPercentage = Math.floor(
    (unit.count / unit.compTotalCount) * 100
  );
  return (
    <div className="mb-6">
      <HorizontalRankIndicator
        rank={unit.rank}
        rankTotalCount={unit.rankTotalCount}
      />
      <div className="flex bg-gray-900">
        <div
          className="flex-shrink-0 w-24 aspect-square border"
          style={{
            borderColor: unit.color,
          }}
        >
          <img
            className="w-full h-full object-cover"
            src={unit.imageUrl}
            alt={unit.id}
          />
        </div>
        <div className="flex-grow p-1 pb-2 overflow-x-auto space-y-1">
          <div className="flex justify-between">
            <div className="space-x-2 text-lg font-[500] flex">
              <span>{`${unit.rank}.`}</span>
              <span className="space-x-1 flex items-center">
                <span>{unit.name}</span>
                {unit.stars === "★★★" && (
                  <span className="text-xs text-yellow-500">{unit.stars}</span>
                )}
              </span>
            </div>
            <div className="flex items-center space-x-[2px]">
              {unit.traits.map((trait) => (
                <Popover
                  key={trait.apiName}
                  closeButton={false}
                  triggerAsChild
                  trigger={
                    <button className="w-6 aspect-square border border-gray-500">
                      <img
                        className="w-full h-full"
                        src={trait.imageUrl}
                        alt={trait.apiName}
                      />
                    </button>
                  }
                  content={
                    <div className="p-2 w-48">
                      <div className="text-sm text-center mb-1 font-[500]">
                        {trait.name}
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {trait.units.map((traitUnit) => {
                          const traitUnitRank = allUnitStats.find(
                            (unit) => unit.id === traitUnit.apiName
                          )?.rank;
                          return (
                            <Popover
                              key={traitUnit.apiName}
                              triggerAsChild
                              trigger={
                                <button
                                  className="border aspect-square"
                                  style={{ borderColor: traitUnit.color }}
                                >
                                  <img
                                    className="w-full h-full"
                                    src={traitUnit.imageUrl}
                                    alt={traitUnit.apiName}
                                  />
                                </button>
                              }
                              content={
                                <div className="p-4 flex flex-col items-center">
                                  <div className="text-sm font-[500]">
                                    {traitUnit.name}
                                  </div>
                                  <div className="text-xs space-x-1 text-gray-300">
                                    <span>Rank:</span>
                                    <span className="text-teal-200">
                                      {traitUnitRank}
                                    </span>
                                    <span>/</span>
                                    <span>{unit.rankTotalCount}</span>
                                  </div>
                                </div>
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
          <div className="space-y-[2px] ml-1 text-gray-300">
            <div className="text-xs space-x-1">
              <span>-</span>
              <span>Seen</span>
              <span className="text-teal-200">{unit.count}</span>
              <span>times in</span>
              <span>{unit.compTotalCount}</span>
              <span>top4 comps</span>
              <span>{`(${unitChosenPercentage}%)`}</span>
            </div>
            <div className="text-xs">
              <div className="mb-[2px] space-x-1">
                <span>-</span>
                <span>Popular items</span>
              </div>
              <div className="flex space-x-1 overflow-x-auto">
                {unit.items.map((item) => (
                  <div key={item.apiName} className="flex">
                    <VerticalPercentageBar
                      percentage={(item.count / unit.count) * 100}
                    />
                    {item.name === ItemType.noItem ? (
                      <div className="w-9 aspect-square border border-gray-500 flex-shrink-0">
                        <div className="w-full h-full text-xs flex justify-center items-center text-center">
                          No Items
                        </div>
                      </div>
                    ) : (
                      <Popover
                        closeButton={false}
                        triggerAsChild
                        trigger={
                          <button className="w-9 aspect-square border border-gray-500 flex-shrink-0">
                            <img
                              className="w-full h-full"
                              src={item.imageUrl}
                              alt={item.apiName}
                            />
                          </button>
                        }
                        content={
                          <div className="p-2 flex flex-col space-y-2">
                            <div className="text-sm text-center font-[500]">
                              {item.name}
                            </div>
                            {item.baseItems && item.baseItems.length > 0 && (
                              <div className="flex justify-center text-gray-300">
                                {item.baseItems.map((baseItem, idx, array) => (
                                  <React.Fragment key={idx}>
                                    <div className="flex flex-col items-center space-y-1">
                                      <div className="w-9 aspect-square border border-gray-500">
                                        <img
                                          src={baseItem.imageUrl}
                                          alt={baseItem.apiName}
                                          className="w-full h-full"
                                        />
                                      </div>
                                      <div className="text-xs w-16 flex justify-center text-center">
                                        {baseItem.name}
                                      </div>
                                    </div>
                                    {idx < array.length - 1 && (
                                      <div className="mt-[6px]">+</div>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            )}
                          </div>
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-800 p-2">
        <div className="text-xs space-x-1 mb-1">
          <span className="text-gray-300">
            Units frequently used together with
          </span>
          <span className="text-teal-200">{unit.name}</span>
        </div>
        <div className="relative">
          <div className="flex space-x-[6px] overflow-x-auto">
            {unit.neighbors.map((neighbor) => {
              const neighborRank = allUnitStats.find(
                (unit) => unit.id === neighbor.id
              )?.rank;
              const top3Items = neighbor.items.slice(0, 3);
              const top3ItemsInitialLength = top3Items.length;

              if (top3ItemsInitialLength < 3) {
                while (top3Items.length < 3) {
                  top3Items.push({ ...TFTUnit.NO_ITEM_DATA, count: 0 });
                }
              }

              return (
                <div key={neighbor.id} className="flex-shrink-0 w-[66px]">
                  <div className="flex">
                    <VerticalPercentageBar
                      percentage={(neighbor.count / unit.count) * 100}
                    />
                    <Popover
                      side="top"
                      closeButton={false}
                      triggerAsChild
                      trigger={
                        <button
                          className="w-16 aspect-square border relative flex"
                          style={{ borderColor: neighbor.color }}
                        >
                          <img
                            src={neighbor.imageUrl}
                            alt={neighbor.id}
                            className="w-full h-full"
                          />
                          {neighbor.stars === "★★★" && (
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 text-xs text-yellow-500">
                              {neighbor.stars}
                            </span>
                          )}
                        </button>
                      }
                      content={
                        <div className="p-2 flex flex-col items-center">
                          <div className="text-sm font-[500]">
                            {neighbor.name}
                          </div>
                          <div className="text-xs space-x-1 text-gray-300">
                            <span>Rank:</span>
                            <span className="text-teal-200">
                              {neighborRank}
                            </span>
                            <span>/</span>
                            <span>{unit.rankTotalCount}</span>
                          </div>
                        </div>
                      }
                    />
                  </div>
                  <div className="flex mt-[2px]">
                    {top3Items.map((item, idx) =>
                      item.name === ItemType.noItem ||
                      item.name === ItemType.noData ? (
                        <div key={idx} className="flex-1 w-1/3 aspect-square">
                          {item.name === ItemType.noItem ? (
                            <div className="text-[10px] flex justify-center items-center border border-gray-700 h-full">
                              No
                            </div>
                          ) : (
                            <div className="h-full" />
                          )}
                        </div>
                      ) : (
                        <Popover
                          key={idx}
                          closeButton={false}
                          triggerAsChild
                          trigger={
                            <button
                              key={idx}
                              className="flex-1 w-1/3 aspect-square"
                            >
                              <img
                                className="h-full w-full"
                                src={item.imageUrl}
                                alt={item.apiName}
                              />
                            </button>
                          }
                          content={
                            <div className="p-2 flex flex-col space-y-2">
                              <div className="text-sm text-center font-[500]">
                                {item.name}
                              </div>
                              {item.baseItems && (
                                <div className="flex justify-center text-gray-300">
                                  {item.baseItems.map(
                                    (baseItem, idx, array) => (
                                      <React.Fragment key={idx}>
                                        <div className="flex flex-col items-center space-y-1">
                                          <div className="w-9 aspect-square border border-gray-500">
                                            <img
                                              src={baseItem.imageUrl}
                                              alt={baseItem.apiName}
                                              className="w-full h-full"
                                            />
                                          </div>
                                          <div className="text-xs w-16 flex justify-center text-center">
                                            {baseItem.name}
                                          </div>
                                        </div>
                                        {idx < array.length - 1 && (
                                          <div className="mt-[6px]">+</div>
                                        )}
                                      </React.Fragment>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          }
                        />
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-r from-transparent via-transparent to-gray-800/80 md:to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
