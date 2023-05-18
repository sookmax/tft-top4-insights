import fs, { readdir } from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { League, Region, sortLeagueList } from "./riot-const";
import DataCollector, {
  AugmentStats,
  Match,
  TraitStats,
  UnitStats,
} from "./data-collector";
import { DATA_DIR_ROOT, aggregateById } from "./data-utils";
import { CATEGORIES, Category } from "./shared-const";

export type StatsParams = {
  version: string;
  region: Region;
  league: League;
  category: Category;
};

interface StatsAggregateBase {
  region: Region;
  version: string;
  league: League;
  count: number;
  lastUpdatedTS: number;
}

interface AugmentStatsAggregate extends StatsAggregateBase {
  type: Category.augments;
  value: AugmentStats[];
}

interface TraitStatsAggregate extends StatsAggregateBase {
  type: Category.traits;
  value: TraitStats[];
}

interface UnitStatsAggregate extends StatsAggregateBase {
  type: Category.units;
  value: UnitStats[];
}

export type StatsAggregateUnion =
  | AugmentStatsAggregate
  | TraitStatsAggregate
  | UnitStatsAggregate;

export default class DataAggregator {
  public static DATA_DIR = path.join(DATA_DIR_ROOT, "stats");
  public static PARAMS_FILE_NAME = "params.json";
  public static NUM_BATCHES_TO_READ = 5;
  public static MAX_NUM_MATCHES = 500;

  public static async exec() {
    const execStartedTS = Date.now();
    const params: StatsParams[] = [];
    const versions = (await fsPromises.readdir(DataCollector.DATA_DIR)).filter(
      (fileName) => !DataCollector.VERSIONS_TO_NOT_COLLECT.includes(fileName)
    );

    // so that we can have a descending order of versions.
    // latest to oldest
    versions.sort((a, b) => {
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

    for (const version of versions) {
      const regions = (
        await fsPromises.readdir(path.join(DataCollector.DATA_DIR, version))
      ).filter((fileName) =>
        (DataCollector.REGIONS_TO_COLLECT as string[]).includes(fileName)
      ) as Region[];

      regions.sort();

      for (const region of regions) {
        let leagues = (
          await fsPromises.readdir(
            path.join(DataCollector.DATA_DIR, version, region)
          )
        ).filter((file) =>
          (DataCollector.LEAGUES_TO_COLLECT as string[]).includes(file)
        ) as League[];

        leagues = sortLeagueList(leagues, { ascending: false });

        for (const league of leagues) {
          for (const category of CATEGORIES) {
            params.push({
              version,
              region,
              league,
              category,
            });

            await DataAggregator.writeTop4Stats(
              version,
              region,
              league,
              category,
              execStartedTS
            );
          }
        }
      }
    }

    DataAggregator.writeAllParams(params);
  }

  public static async writeAllParams(params: StatsParams[]) {
    const filePath = path.join(DATA_DIR_ROOT, DataAggregator.PARAMS_FILE_NAME);
    const dirPath = path.dirname(filePath);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    await fsPromises.writeFile(filePath, JSON.stringify(params, undefined, 2));

    console.log(`[${filePath}] has been written.`);
  }

  public static async getAllParams() {
    const filePath = path.join(DATA_DIR_ROOT, DataAggregator.PARAMS_FILE_NAME);
    const file = await fsPromises.readFile(filePath, "utf-8");
    return JSON.parse(file) as StatsParams[];
  }

  public static async writeTop4Stats(
    version: string,
    region: Region,
    league: League,
    category: Category,
    lastUpdatedTS: number
  ) {
    const batchDir = path.join(DataCollector.DATA_DIR, version, region, league);
    const fileNames = await fsPromises.readdir(batchDir);

    const timestamps = fileNames.map((fName) => parseInt(fName));
    timestamps.sort((a, b) => {
      if (a < b) {
        return 1;
      } else if (a > b) {
        return -1;
      } else {
        return 0;
      }
    });

    // for (const batchIdToRemove of timestamps.slice(
    //   DataAggregator.NUM_BATCHES_TO_READ
    // )) {
    //   const removeDir = path.join(batchDir, batchIdToRemove.toString());
    //   await fsPromises.rm(removeDir, { recursive: true, force: true });
    //   console.log(
    //     `[REMOVE DIR]: removed the following old batch - ${removeDir}`
    //   );
    // }

    let matchFileNames: string[] = [];
    let removeStartBatchIndex = timestamps.length;
    const matches: Match[] = [];

    for (const [batchIndex, batchId] of timestamps.entries()) {
      console.log(`[Reading batchId: ${batchId} in ${batchDir}]`);
      const readDir = path.join(batchDir, batchId.toString());
      const fileNames = await fsPromises.readdir(readDir);
      for (const fileName of fileNames) {
        if (matchFileNames.includes(fileName)) {
          console.log(
            `[${fileName}]: Match already read. Deleting the file and moving on...`
          );
          await fsPromises.unlink(path.join(readDir, fileName));
          console.log(
            `[${path.join(readDir, fileName)}]: deleted a duplicate match file.`
          );
          continue;
        }
        const filePath = path.join(readDir, fileName);
        const file = await fsPromises.readFile(filePath, "utf-8");
        const match = JSON.parse(file) as Match;
        matches.push(match);
      }
      matchFileNames.push(...fileNames);
      matchFileNames = [...new Set(matchFileNames)];
      if (matches.length >= DataAggregator.MAX_NUM_MATCHES) {
        removeStartBatchIndex = batchIndex + 1;
        break;
      }
    }

    for (const batchIdToRemove of timestamps.slice(removeStartBatchIndex)) {
      const removeDir = path.join(batchDir, batchIdToRemove.toString());
      await fsPromises.rm(removeDir, { recursive: true, force: true });
      console.log(
        `[REMOVE DIR]: removed the following old batch - ${removeDir}`
      );
    }

    const top4s = matches.map((m) => m.top4);

    let data: StatsAggregateUnion | undefined;

    switch (category) {
      case "augments": {
        const top4_augments = top4s.flatMap((t4) => t4.augments);
        const top4_augments_aggregate = aggregateById(
          top4_augments,
          (filteredArray, item) => {
            const neighbors = filteredArray.flatMap(
              (augment) => augment.neighbors
            );
            return {
              ...item,
              neighbors: aggregateById(neighbors, undefined, 10),
              rank: -1,
              rankTotalCount: -1,
              compTotalCount: matches.length * 4,
            };
          }
        );

        const uniqueCounts = [
          ...new Set(top4_augments_aggregate.map((augment) => augment.count)),
        ];
        uniqueCounts.sort((a, b) => {
          if (b > a) {
            return 1;
          } else if (a > b) {
            return -1;
          } else {
            return 0;
          }
        });

        uniqueCounts.forEach((count, index) => {
          const rank = index + 1;
          const sameRankArray = top4_augments_aggregate.filter(
            (augment) => augment.count === count
          );
          sameRankArray.forEach((augment) => {
            augment.rank = rank;
            augment.rankTotalCount = uniqueCounts.length;
          });
        });

        data = {
          type: category,
          region,
          version,
          league,
          count: matches.length,
          value: top4_augments_aggregate,
          lastUpdatedTS,
        };
        break;
      }
      case "traits": {
        const top4_traits = top4s
          .flatMap((t4) => t4.traits)
          .filter((trait) => trait.style > 0);

        const top4_traits_aggregate = aggregateById(
          top4_traits,
          (filteredArray, item) => {
            const neighbors = filteredArray
              .flatMap((trait) => trait.neighbors)
              .filter((neighbor) => neighbor.style > 0);

            return {
              ...item,
              style: filteredArray[0].style,
              name: filteredArray[0].name,
              tierCurrent: filteredArray[0].tierCurrent,
              tierTotal: filteredArray[0].tierTotal,
              neighbors: aggregateById(
                neighbors,
                (filteredArray, item) => {
                  return {
                    ...item,
                    style: filteredArray[0].style,
                    name: filteredArray[0].name,
                    tierCurrent: filteredArray[0].tierCurrent,
                    tierTotal: filteredArray[0].tierTotal,
                  };
                },
                10
              ),
              rank: -1,
              rankTotalCount: -1,
              compTotalCount: matches.length * 4,
            };
          }
        );

        const uniqueCounts = [
          ...new Set(top4_traits_aggregate.map((trait) => trait.count)),
        ];
        uniqueCounts.sort((a, b) => {
          if (b > a) {
            return 1;
          } else if (a > b) {
            return -1;
          } else {
            return 0;
          }
        });

        uniqueCounts.forEach((count, index) => {
          const rank = index + 1;
          const sameRankArray = top4_traits_aggregate.filter(
            (trait) => trait.count === count
          );
          sameRankArray.forEach((trait) => {
            trait.rank = rank;
            trait.rankTotalCount = uniqueCounts.length;
          });
        });

        data = {
          type: category,
          region,
          version,
          league,
          count: matches.length,
          value: top4_traits_aggregate,
          lastUpdatedTS,
        };
        break;
      }

      case "units": {
        const top4_units = top4s.flatMap((t4) => t4.units);
        const top4_units_aggregate = aggregateById(
          top4_units,
          (filteredArray, item) => {
            const tiers = filteredArray.flatMap((unit) => unit.tiers);
            const items = filteredArray
              .flatMap((unit) => unit.items)
              .filter((item) => item.id !== "TFT_Item_EmptyBag");
            const neighbors = filteredArray.flatMap((unit) => unit.neighbors);

            return {
              ...item,
              tiers: aggregateById(tiers),
              items: aggregateById(items, undefined, 10),
              neighbors: aggregateById(
                neighbors,
                (filteredArray, item) => {
                  const tiers = filteredArray.flatMap((unit) => unit.tiers);
                  const items = filteredArray.flatMap((unit) => unit.items);
                  return {
                    ...item,
                    tiers: aggregateById(tiers),
                    items: aggregateById(items, undefined, 10),
                  };
                },
                10
              ),
              rank: -1,
              rankTotalCount: -1,
              compTotalCount: matches.length * 4,
            };
          }
        );

        const uniqueCounts = [
          ...new Set(top4_units_aggregate.map((unit) => unit.count)),
        ];
        uniqueCounts.sort((a, b) => {
          if (b > a) {
            return 1;
          } else if (a > b) {
            return -1;
          } else {
            return 0;
          }
        });

        uniqueCounts.forEach((count, index) => {
          const rank = index + 1;
          const sameRankArray = top4_units_aggregate.filter(
            (unit) => unit.count === count
          );
          sameRankArray.forEach((unit) => {
            unit.rank = rank;
            unit.rankTotalCount = uniqueCounts.length;
          });
        });

        data = {
          type: category,
          region,
          version,
          league,
          count: matches.length,
          value: top4_units_aggregate,
          lastUpdatedTS,
        };
        break;
      }
    }

    const writeFilePath = path.join(
      DataAggregator.DATA_DIR,
      version,
      region,
      league,
      `${category}.json`
    );

    const writeDirPath = path.dirname(writeFilePath);

    if (!fs.existsSync(writeDirPath)) {
      fs.mkdirSync(writeDirPath, { recursive: true });
    }

    await fsPromises.writeFile(
      writeFilePath,
      JSON.stringify(data, undefined, 2)
    );

    console.log(`[${writeFilePath}] has been written.`);
  }

  public static async getTop4Stats<
    C extends Category,
    R extends StatsAggregateUnion & { type: C }
  >(version: string, region: Region, league: League, category: C) {
    const filePath = path.join(
      DataAggregator.DATA_DIR,
      version,
      region,
      league,
      `${category}.json`
    );
    const file = await fsPromises.readFile(filePath, "utf-8");

    return JSON.parse(file) as R;
  }
}
