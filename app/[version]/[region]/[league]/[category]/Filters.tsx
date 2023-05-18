"use client";

import * as RadioGroup from "@radix-ui/react-radio-group";
import { StatsParams } from "@/lib/data-aggregator";
import { useParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { classNames } from "@/app/utils";
import { League, Region } from "@/lib/riot-const";
import Link from "next/link";
import Ring from "./Ring";
import { requestTopO } from "./ScrollYObserver";

export default function Filters({ allParams }: { allParams: StatsParams[] }) {
  const currentParams = useParams() as StatsParams;

  const [version, setVersion] = useState(currentParams.version);
  const [region, setRegion] = useState(currentParams.region);
  const [league, setLeague] = useState(currentParams.league);
  const [showLoading, setShowLoading] = useState(false);

  const versions = useMemo(() => {
    const uniqueVersions = [...new Set(allParams.map((f) => f.version))];
    uniqueVersions.sort((a, b) => {
      const [, minorVersionA] = a.split(".");
      const minorVersionA_num = parseInt(minorVersionA);

      const [, minorVersionB] = b.split(".");
      const minorVersionB_num = parseInt(minorVersionB);

      if (minorVersionA_num > minorVersionB_num) {
        return -1;
      } else if (minorVersionA_num < minorVersionB_num) {
        return 1;
      } else {
        return 0;
      }
    });

    return uniqueVersions;
  }, [allParams]);

  const regions = useMemo(() => {
    return [
      ...new Set(
        allParams.filter((f) => f.version === version).map((f) => f.region)
      ),
    ];
  }, [allParams, version]);

  const leagues = useMemo(() => {
    return [
      ...new Set(
        allParams
          .filter((f) => f.version === version && f.region === region)
          .map((f) => f.league)
      ),
    ];
  }, [allParams, version, region]);

  const linkDisabled =
    (version === currentParams.version &&
      region === currentParams.region &&
      league === currentParams.league) ||
    !versions.includes(version) ||
    !regions.includes(region) ||
    !leagues.includes(league);

  return (
    <div className="flex flex-col text-sm">
      <div className="space-y-2">
        <div>
          <form>
            <fieldset className="border border-gray-500">
              <legend className="ml-3 font-[500]">Versions</legend>
              <div className="px-4 pt-2 pb-4">
                <RadioGroupRoot
                  value={version}
                  onValueChange={(v) => setVersion(v)}
                >
                  {versions.map((version) => {
                    const id = `version-${version}`;
                    return (
                      <div key={version}>
                        <RadioGroupItem
                          id={id}
                          value={version}
                          disabled={showLoading}
                        />
                      </div>
                    );
                  })}
                </RadioGroupRoot>
              </div>
            </fieldset>
          </form>
        </div>
        <div>
          <form>
            <fieldset className="border border-gray-500">
              <legend className="ml-3 font-[500]">Regions</legend>
              <div className="px-4 pt-2 pb-4">
                <RadioGroupRoot
                  value={region}
                  onValueChange={(r) => setRegion(r as Region)}
                >
                  {regions.map((region) => {
                    const id = `region-${region}`;

                    return (
                      <div key={region}>
                        <RadioGroupItem
                          id={id}
                          value={region}
                          disabled={showLoading}
                        />
                      </div>
                    );
                  })}
                </RadioGroupRoot>
              </div>
            </fieldset>
          </form>
        </div>
        <div>
          <form>
            <fieldset className="border border-gray-500">
              <legend className="ml-3 font-[500]">Leagues</legend>
              <div className="px-4 pt-2 pb-4">
                <RadioGroupRoot
                  value={league}
                  onValueChange={(l) => setLeague(l as League)}
                >
                  {leagues.map((league) => {
                    const id = `league-${league}`;

                    return (
                      <div key={league}>
                        <RadioGroupItem
                          id={id}
                          value={league}
                          disabled={showLoading}
                        />
                      </div>
                    );
                  })}
                </RadioGroupRoot>
              </div>
            </fieldset>
          </form>
        </div>
      </div>
      <div className="mt-5 relative font-[500]">
        {linkDisabled ? (
          <div className="p-2 text-center bg-gray-500 cursor-not-allowed">
            Apply
          </div>
        ) : (
          <Link
            href={`/${version}/${region}/${league}/${currentParams.category}`}
            className="block p-2 text-center bg-orange-500"
            onClick={() => {
              setShowLoading(true);
              // requestTopO();
            }}
          >
            Apply
          </Link>
        )}
        {showLoading && (
          <span className="text-orange-900 absolute top-1/2 -translate-y-1/2 right-1">
            <Ring className="w-6 h-6 animate-spin" strokeWidth={8} />
          </span>
        )}
      </div>
    </div>
  );
}

function RadioGroupRoot({
  value,
  onValueChange,
  children,
}: Pick<RadioGroup.RadioGroupProps, "value" | "onValueChange" | "children">) {
  return (
    <RadioGroup.Root
      className="grid grid-cols-2 gap-1"
      value={value}
      onValueChange={onValueChange}
    >
      {children}
    </RadioGroup.Root>
  );
}

function RadioGroupItem({
  id,
  value,
  disabled,
}: Pick<RadioGroup.RadioGroupItemProps, "id" | "value" | "disabled"> & {}) {
  return (
    <RadioGroup.Item
      id={id}
      value={value}
      className="relative p-1 w-full"
      disabled={disabled}
    >
      <RadioGroup.Indicator asChild className="bg-teal-500 absolute inset-0">
        <motion.div
          initial={{
            opacity: 0,
            // scale: 0,
          }}
          animate={{
            opacity: 1,
            // scale: 1,
          }}
          //   transition={{
          //     type: "tween",
          //     duration: 0.15,
          //   }}
        />
      </RadioGroup.Indicator>
      <label
        htmlFor={id}
        className={classNames("relative", !disabled && "cursor-pointer")}
      >
        {value}
      </label>
    </RadioGroup.Item>
  );
}
