import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import DataCollector from "./data-collector";
import { DATA_DIR_ROOT } from "./data-utils";

export type Item = {
  apiName: string;
  composition: string[];
  desc: string;
  effects: {
    [index: string]: any;
  };
  icon: string;
  name: string;
  // imageUrl?: string;
  // baseItems?: {
  //   apiName: string;
  //   name: string;
  //   imageUrl?: string;
  // }[];
};

export type Trait = {
  apiName: string;
  // desc: string;
  effects: { minUnits: number }[];
  icon: string;
  name: string;
  imageUrl?: string;
  units: Champion[];
};

export type Champion = {
  // ability: any;
  apiName: string;
  cost: number;
  icon: string;
  name: string;
  traits: string[];
};

export type CDragonJSON = {
  setData: {
    champions: Champion[];
    traits: Trait[];
    mutator: string;
    name: string;
  }[];
  items: Item[];
};

export default class CDragon {
  public static DATA_DIR = path.join(DATA_DIR_ROOT, "cdragon");
  public static FILE_NAME = "cdragon_tft.json";

  public static async getJSON(version: string) {
    const filePath = path.join(this.DATA_DIR, version, this.FILE_NAME);
    const file = await fsPromises.readFile(filePath, "utf-8");
    return JSON.parse(file) as CDragonJSON;
  }

  public static async exec() {
    const versions = (await fsPromises.readdir(DataCollector.DATA_DIR)).filter(
      (fileName) => !DataCollector.VERSIONS_TO_NOT_COLLECT.includes(fileName)
    );

    for (const version of versions) {
      let rawJson;

      try {
        rawJson = await fetch(
          `https://raw.communitydragon.org/${version}/cdragon/tft/en_us.json`
        ).then((res) => res.json());
      } catch (e) {
        if (e instanceof SyntaxError) {
          rawJson = await fetch(
            `https://raw.communitydragon.org/latest/cdragon/tft/en_us.json`
          ).then((res) => res.json());
        }
      }

      delete rawJson.sets;

      (rawJson.items as any[]).forEach((item) => {
        // delete item.desc;
        // delete item.effects;
        delete item.associatedTraits;
        delete item.from;
        delete item.id;
        delete item.incompatibleTraits;
        delete item.unique;
      });

      (rawJson.setData as any[]).forEach((setData) => {
        (setData.champions as any[]).forEach((champion) => {
          delete champion.ability;
          delete champion.stats;
        });
        (setData.traits as any[]).forEach((trait) => {
          delete trait.desc;
          // delete trait.effects;
        });
      });

      const json = rawJson as CDragonJSON;

      json.setData = json.setData
        .filter(
          (set) =>
            set.name === "Set8" &&
            ["TFTSet8", "TFTSet8_Stage2"].includes(set.mutator)
        )
        .sort((a, b) => {
          // prioritize information in stage 2.
          if (a.mutator === "TFTSet8_Stage2") {
            return -1;
          } else if (a.mutator === "TFTSet8") {
            return 1;
          } else {
            return 0;
          }
        });

      json.setData.forEach((data) => {
        data.traits.forEach((trait) => {
          if (!trait.units) {
            trait.units = [];
          }
          const champions = data.champions.filter((champ) =>
            champ.traits.includes(trait.name)
          );
          trait.units.push(...champions);
          trait.units.sort((a, b) => {
            if (a.cost < b.cost) {
              return -1;
            } else if (a.cost > b.cost) {
              return 1;
            } else {
              return 0;
            }
          });
        });
      });

      const filePath = path.join(CDragon.DATA_DIR, version, CDragon.FILE_NAME);

      const writeDirPath = path.dirname(filePath);

      if (!fs.existsSync(writeDirPath)) {
        fs.mkdirSync(writeDirPath, { recursive: true });
      }

      fs.writeFileSync(filePath, JSON.stringify(json, undefined, 2));
    }
  }
}
