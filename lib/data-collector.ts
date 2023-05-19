import fs from "fs";
import path from "path";
import {
  DATA_DIR_ROOT,
  aggregateById,
  generateRandomIndex,
} from "./data-utils";
import { League, ROUTING_VALUES, Region } from "./riot-const";
import { riotFetch } from "./riot-fetch";

export type MatchParticipant = {
  placement: number;
  augments: string[];
  traits: {
    name: string;
    style: number;
    tier_total: number;
    tier_current: number;
  }[];
  units: {
    character_id: string;
    itemNames: string[];
    tier: number;
  }[];
};

// https://developer.riotgames.com/apis#tft-match-v1/GET_getMatch
export type MatchRaw = {
  metadata: {
    data_version: string;
    match_id: string;
    participants: string[];
  };
  info: {
    game_datetime: number;
    game_length: number;
    game_variation: string;
    game_version: string;
    participants: MatchParticipant[];
    queue_id: number;
    tft_set_number: number;
  };
};

export type AugmentStats = ReturnType<
  typeof DataCollector.getAugmentStatsArray
>[number];

export type TraitStats = ReturnType<
  typeof DataCollector.getTraitStatsArray
>[number];

export type UnitStats = ReturnType<
  typeof DataCollector.getUnitStatsArray
>[number];

export type Match = {
  raw: MatchRaw;
  releaseVersion: string;
  top4: {
    augments: AugmentStats[];
    traits: TraitStats[];
    units: UnitStats[];
  };
  playerAvgTier: League;
};

export default class DataCollector {
  public static DATA_DIR = path.join(DATA_DIR_ROOT, "matches");
  public static VERSIONS_TO_NOT_COLLECT: string[] = [
    "13.6",
    "13.5",
    "13.4",
    "13.3",
    "13.2",
    "13.1",
    "12.23",
    ".DS_Store", // this gets created whenever you click `Get Info` from the finder context menu.
  ];
  public static REGIONS_TO_COLLECT: Region[] = ["NA", "EUNE", "EUW", "KR"];
  public static LEAGUES_TO_COLLECT = [
    "CHALLENGER",
    "GRANDMASTER",
    "MASTER",
    "DIAMOND",
    // "PLATINUM",
    // "GOLD",
  ] as League[];

  public static async exec() {
    const timestamp = Date.now();

    for (const region of DataCollector.REGIONS_TO_COLLECT) {
      for (const league of DataCollector.LEAGUES_TO_COLLECT) {
        const summonersData = await DataCollector.getSampleSummoners(
          region,
          league,
          10
        );

        for (const summoner of summonersData) {
          for (const matchId of summoner.matchIds) {
            const matchRaw = (await riotFetch(
              `https://${ROUTING_VALUES[region].host.region}/tft/match/v1/matches/${matchId}`
            )) as MatchRaw;

            if (matchRaw.info.queue_id !== 1100) {
              console.log(
                `[${matchId}]: Found match is not a ranked game. Moving on...`
              );
              continue;
            }

            const releaseVersion = DataCollector.getReleaseVersion(
              matchRaw.info.game_version
            );

            if (!releaseVersion) {
              throw `failed to parse a release version from ${matchRaw.info.game_version}`;
            }

            if (
              DataCollector.VERSIONS_TO_NOT_COLLECT.includes(releaseVersion)
            ) {
              console.log(
                `[${matchId}]: The version of found match (${releaseVersion}) is out of scope. Moving on...`
              );
              continue;
            }

            const participants = matchRaw.info
              .participants as MatchParticipant[];
            const top4Players = participants.filter((p) => p.placement <= 4);

            const match: Match = {
              raw: matchRaw,
              releaseVersion,
              top4: {
                augments: DataCollector.getAugmentStatsArray(top4Players),
                traits: DataCollector.getTraitStatsArray(top4Players),
                units: DataCollector.getUnitStatsArray(top4Players),
              },
              playerAvgTier: league, // TODO: this should be calculated by collecting all the participants' league information.
            };

            // write a file.
            const filePath = path.join(
              DataCollector.DATA_DIR,
              releaseVersion,
              region,
              league,
              timestamp.toString(),
              `${matchId}.json`
            );

            const dirPath = path.dirname(filePath);
            if (!fs.existsSync(dirPath)) {
              // Create directory if it doesn't exist
              fs.mkdirSync(dirPath, { recursive: true });
            }

            // Check if file exists in directory
            if (!fs.existsSync(filePath)) {
              console.log(`[WRITE FILE]: ${filePath.toString()}`);
              // Write file if it doesn't exist
              // Convert object to JSON string
              const jsonString = JSON.stringify(match, null, 2);
              fs.writeFileSync(filePath, jsonString);
            } else {
              console.log(
                `the file named ${filePath.toString()} already exists. Moving on to the next item.`
              );
            }
          }
        }
      }
    }
  }

  public static getAugmentStatsArray(participants: MatchParticipant[]) {
    const augmentsWithCount = participants.flatMap((p) => {
      return p.augments.map((augmentName) => ({
        id: augmentName,
        count: 1,
        neighbors: p.augments
          .filter((augment) => augment !== augmentName)
          .map((neighborAugmentName) => {
            return {
              id: neighborAugmentName,
              count: 1,
            };
          }),
        rank: -1,
        rankTotalCount: -1,
        compTotalCount: -1,
      }));
    });

    const augmentsAggregate = aggregateById(
      augmentsWithCount,
      (filteredArray, item) => {
        const neighbors = filteredArray.flatMap((augment) => augment.neighbors);
        return {
          ...item,
          neighbors: aggregateById(neighbors),
          rank: -1,
          rankTotalCount: -1,
          compTotalCount: -1,
        };
      }
    );

    return augmentsAggregate;
  }

  public static getTraitStatsArray(participants: MatchParticipant[]) {
    const traitsWithCount = participants.flatMap((p) => {
      return p.traits.map((trait) => ({
        id: `${trait.name}#${trait.style}`,
        count: 1,
        name: trait.name,
        style: trait.style,
        tierCurrent: trait.tier_current,
        tierTotal: trait.tier_total,
        neighbors: p.traits
          .filter((t) => t.name !== trait.name)
          .map((neighborTrait) => ({
            id: `${neighborTrait.name}#${neighborTrait.style}`,
            count: 1,
            name: neighborTrait.name,
            style: neighborTrait.style,
            tierCurrent: neighborTrait.tier_current,
            tierTotal: neighborTrait.tier_total,
          })),
        rank: -1,
        rankTotalCount: -1,
        compTotalCount: -1,
      }));
    });

    const traitsAggregate = aggregateById(
      traitsWithCount,
      (filteredArray, item) => {
        const neighbors = filteredArray.flatMap((trait) => trait.neighbors);

        return {
          ...item,
          style: filteredArray[0].style,
          name: filteredArray[0].name,
          tierCurrent: filteredArray[0].tierCurrent,
          tierTotal: filteredArray[0].tierTotal,
          neighbors: aggregateById(neighbors, (filteredArray, item) => {
            return {
              ...item,
              style: filteredArray[0].style,
              name: filteredArray[0].name,
              tierCurrent: filteredArray[0].tierCurrent,
              tierTotal: filteredArray[0].tierTotal,
            };
          }),
          rank: -1,
          rankTotalCount: -1,
          compTotalCount: -1,
        };
      }
    );

    return traitsAggregate;
  }

  public static getUnitStatsArray(participants: MatchParticipant[]) {
    const unitsWithCount = participants.flatMap((p) => {
      return p.units.map((unit) => {
        const items =
          unit.itemNames.length === 0
            ? [
                {
                  id: "no-item",
                  count: 1,
                },
              ]
            : unit.itemNames.map((itemName) => ({
                id: itemName,
                count: 1,
              }));
        return {
          id: unit.character_id,
          count: 1,
          tiers: [
            {
              id: unit.tier,
              count: 1,
            },
          ],
          items,
          neighbors: p.units
            .filter((u) => u.character_id !== unit.character_id)
            .map((unit) => {
              const items =
                unit.itemNames.length === 0
                  ? [
                      {
                        id: "no-item",
                        count: 1,
                      },
                    ]
                  : unit.itemNames.map((itemName) => ({
                      id: itemName,
                      count: 1,
                    }));
              return {
                id: unit.character_id,
                count: 1,
                tiers: [
                  {
                    id: unit.tier,
                    count: 1,
                  },
                ],
                items,
              };
            }),
          rank: -1,
          rankTotalCount: -1,
          compTotalCount: -1,
        };
      });
    });

    const unitsAggregate = aggregateById(
      unitsWithCount,
      (filteredArray, item) => {
        const tiers = filteredArray.flatMap((unit) => unit.tiers);
        const items = filteredArray.flatMap((unit) => unit.items);
        const neighbors = filteredArray.flatMap((unit) => unit.neighbors);

        return {
          ...item,
          tiers: aggregateById(tiers),
          items: aggregateById(items),
          neighbors: aggregateById(neighbors, (filteredArray, item) => {
            const tiers = filteredArray.flatMap((unit) => unit.tiers);
            const items = filteredArray.flatMap((unit) => unit.items);
            return {
              ...item,
              tiers: aggregateById(tiers),
              items: aggregateById(items),
            };
          }),
          rank: -1,
          rankTotalCount: -1,
          compTotalCount: -1,
        };
      }
    );

    return unitsAggregate;
  }

  public static async getSampleSummoners(
    region: Region,
    league: League,
    size = 100
  ) {
    let rankedPlayers: { summonerId: string; league: League }[] = [];

    switch (league) {
      case "CHALLENGER":
      case "GRANDMASTER":
      case "MASTER": {
        rankedPlayers = await riotFetch(
          `https://${
            ROUTING_VALUES[region].host.platform
          }/tft/league/v1/${league.toLowerCase()}`
        ).then((json) =>
          (json.entries as any[])
            // .filter((_, index) => index < size)
            .map((player) => ({
              summonerId: player.summonerId,
              league,
            }))
        );

        break;
      }
      case "DIAMOND":
      case "PLATINUM":
      case "GOLD": {
        rankedPlayers = await riotFetch(
          `https://${
            ROUTING_VALUES[region].host.platform
          }/tft/league/v1/entries/${league.toUpperCase()}/I?page=1`
        ).then((json) =>
          (json as any[])
            // .filter((_, index) => index < size)
            .map((player) => ({
              summonerId: player.summonerId,
              league,
            }))
        );
        break;
      }
    }

    if (rankedPlayers.length > size) {
      const randomIndices: number[] = [];
      for (let i = 0; i < size; i++) {
        randomIndices.push(generateRandomIndex(rankedPlayers.length - 1));
      }
      console.log(
        `random indices pulled: ${randomIndices} out of ${rankedPlayers.length} players in ${region} / ${league}`
      );
      rankedPlayers = rankedPlayers.filter((_, idx) =>
        randomIndices.includes(idx)
      );
    }

    const data: {
      summonerId: string;
      league: League;
      puuid: string;
      name: string;
      matchIds: string[];
    }[] = [];

    for (const player of rankedPlayers) {
      const summonerData = await riotFetch(
        `https://${ROUTING_VALUES[region].host.platform}/tft/summoner/v1/summoners/${player.summonerId}`
      );
      const matchIds = await riotFetch(
        `https://${ROUTING_VALUES[region].host.region}/tft/match/v1/matches/by-puuid/${summonerData.puuid}/ids?start=0&count=20`
      );

      data.push({
        ...player,
        puuid: summonerData.puuid,
        name: summonerData.name,
        matchIds,
      });
    }

    return data;
  }

  public static VERSION_REGEX = /.*<Releases\/(?<releaseVersion>.*)>/;
  public static getReleaseVersion(versionString: string) {
    const match = versionString.match(DataCollector.VERSION_REGEX);
    if (match?.groups) {
      return match.groups.releaseVersion;
    }
  }

  public static async getPlayerAverageLeagues() {
    // const playerTiers: { tier: League; rank: Rank }[] = [];
    // for (const participant_PUUID of matchRaw.metadata.participants) {
    //   const summoner = await riotFetch(
    //     `https://${ROUTING_VALUES[region].host.platform}/tft/summoner/v1/summoners/by-puuid/${participant_PUUID}`
    //   );
    //   //   console.log(summoner);
    //   const [summonerLeague] = await riotFetch(
    //     `https://${ROUTING_VALUES[region].host.platform}/tft/league/v1/entries/by-summoner/${summoner.id}`
    //   ).then((json) =>
    //     (json as any[]).filter((entry) => entry.queueType === "RANKED_TFT")
    //   );
    //   //   console.log(summonerLeague);
    //   if (summonerLeague) {
    //     playerTiers.push({
    //       tier: summonerLeague.tier,
    //       rank: summonerLeague.rank,
    //     });
    //   }
    // }
    // if (playerTiers.length === 0) {
    //   console.log(
    //     `[${matchId}]: no player tier information were found for this match. Moving on...`
    //   );
    //   continue;
    // }
    // const playerAvgTier = getLeagueFromScore(
    //   playerTiers.reduce((acc, curr) => {
    //     return acc + getLeagueScore(curr.tier, curr.rank);
    //   }, 0) / playerTiers.length
    // );
    // if (playerAvgTier === undefined) {
    //   console.log(
    //     `[${matchId}]: Average player tier could not be calculated for this match. Moving on...`
    //   );
    //   continue;
    // }
  }
}
