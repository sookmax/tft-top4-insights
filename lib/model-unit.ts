import { Item } from "./data-cdragon";
import { UnitStats } from "./data-collector";
import ModelBase, { ModelBaseParams } from "./model-base";

export enum ItemType {
  noItem = "no-item",
  noData = "no-data",
}

export type TFTUnitParams = ModelBaseParams & {
  stats: UnitStats;
};

export default class TFTUnit extends ModelBase {
  public static NO_ITEM = {
    apiName: ItemType.noItem,
    composition: [],
    desc: "",
    effects: {},
    icon: "",
    name: ItemType.noItem,
  };

  public static NO_ITEM_DATA = {
    apiName: ItemType.noData,
    composition: [],
    desc: "",
    effects: {},
    icon: "",
    name: ItemType.noData,
  };

  public id;
  public name;
  public count;
  public cost;
  public color;
  public traits;
  public imageUrl;
  public stars;
  public items;

  public neighbors;

  public stage1Units;
  public stage2Units;

  public stats;

  public rank;
  public rankTotalCount;
  public compTotalCount;

  constructor({ stats, ...rest }: TFTUnitParams) {
    super(rest);
    this.stats = stats;
    this.rank = stats.rank;
    this.rankTotalCount = stats.rankTotalCount;
    this.compTotalCount = stats.compTotalCount;

    this.stage1Units = [
      ...new Set(
        this.cdragon.setData
          .find((stage) => stage.name === "Set8" && stage.mutator === "TFTSet8")
          ?.champions?.map((champ) => champ.apiName) ?? []
      ),
    ];

    this.stage2Units = [
      ...new Set(
        this.cdragon.setData
          .find(
            (stage) =>
              stage.name === "Set8" && stage.mutator === "TFTSet8_Stage2"
          )
          ?.champions?.map((champ) => champ.apiName) ?? []
      ),
    ];

    const data = this.getMergedData(this.stats);

    this.id = data.id;
    this.name = data.name;
    this.count = data.count;
    this.cost = data.cost;
    this.color = data.color;
    this.traits = data.traits;
    this.imageUrl = data.imageUrl;
    this.stars = data.stars;
    this.items = data.items;
    this.neighbors = this.stats.neighbors.map((neighborStats) =>
      this.getMergedData(neighborStats)
    );
  }

  private getMergedData(
    stats: Omit<
      UnitStats,
      "neighbors" | "rank" | "rankTotalCount" | "compTotalCount"
    >
  ) {
    for (const stage of this.cdragon.setData) {
      const searched = stage.champions.find(
        (champ) => champ.apiName === stats.id
      );
      if (searched) {
        const tierMostCount = stats.tiers[0];
        const traits = stage.traits
          .filter((trait) => searched.traits.includes(trait.name))
          .map((trait) => {
            const units = trait.units.map((unit) => {
              const imageUrl = TFTUnit.getImageUrl(
                unit.apiName,
                !this.stage1Units.includes(unit.apiName) &&
                  this.stage2Units.includes(unit.apiName),
                this.version
              );

              return {
                ...unit,
                color: TFTUnit.getColor(unit.cost),
                imageUrl,
              };
            });

            const imageUrl = this.getTraitImageUrl(trait.icon);

            return {
              ...trait,
              units,
              imageUrl,
            };
          });

        const imageUrl = TFTUnit.getImageUrl(
          searched.apiName,
          !this.stage1Units.includes(searched.apiName) &&
            this.stage2Units.includes(searched.apiName),
          this.version
        );

        return {
          id: searched.apiName,
          name: searched.name,
          count: stats.count,
          cost: searched.cost,
          color: TFTUnit.getColor(searched.cost),
          traits,
          imageUrl,
          stars: this.getStars(tierMostCount.id),
          items: stats.items.map((item) => this.getItemData(item)),
        };
      }
    }

    throw `No data found for unitId: ${stats.id}`;
  }

  public static getImageUrl(id: string, stage2Unit: boolean, version: string) {
    let postfix1 = "square";
    let postfix2 = "tft_set8";

    if (stage2Unit) {
      postfix1 = "mobile";
      postfix2 = "tft_set8_stage2";
    }

    const [versionMajor, versionMinor] = version.split(".");
    let prevVersionMinor = parseInt(versionMinor) - 1;

    if (prevVersionMinor === 8) prevVersionMinor--;

    return ["9", "8"].includes(versionMinor)
      ? `https://raw.communitydragon.org/${`${versionMajor}.${prevVersionMinor}`}/game/assets/ux/tft/championsplashes/${id.toLowerCase()}_${postfix1}.${postfix2}.png`
      : `https://raw.communitydragon.org/${version}/game/assets/ux/tft/championsplashes/${id.toLowerCase()}_${postfix1}.${postfix2}.png`;
  }

  private getStars(id: number) {
    switch (id) {
      case 1:
        return "★";
      case 2:
        return "★★";
      case 3:
        return "★★★";
      default:
        return "";
    }
  }

  private getItemData(item: UnitStats["items"][number]): Item & {
    imageUrl?: string;
    baseItems?: {
      apiName: string;
      name: string;
      imageUrl: string;
    }[];
    count: number;
  } {
    if (item.id === ItemType.noItem) {
      return { ...TFTUnit.NO_ITEM, count: item.count };
    }

    const searched = this.cdragon.items.find(
      (itemData) => itemData.apiName === item.id
    );
    if (!searched) throw `Item data for id: ${item.id} not found.`;

    const baseItems = searched.composition.map((id) => {
      const searched = this.cdragon.items.find((item) => item.apiName === id);
      if (!searched) throw `Item data for id: ${id} not found.`;

      const imageUrl = this.getItemImageUrl(searched.icon);

      return {
        apiName: searched.apiName,
        name: searched.name,
        imageUrl,
      };
    });

    const imageUrl = this.getItemImageUrl(searched.icon);

    return {
      ...searched,
      imageUrl,
      baseItems,
      count: item.count,
    };
  }

  private getItemImageUrl(rawPath: string) {
    let path = rawPath.toLowerCase().replace(".dds", ".png");
    path = path.replace(".tex", ".png");

    const [versionMajor, versionMinor] = this.version.split(".");
    let prevVersionMinor = parseInt(versionMinor) - 1;

    if (prevVersionMinor === 8 || prevVersionMinor === 9) {
      prevVersionMinor = 7;
    }

    return ["10", "9", "8"].includes(versionMinor)
      ? `https://raw.communitydragon.org/${`${versionMajor}.${prevVersionMinor}`}/game/${path}`
      : `https://raw.communitydragon.org/${this.version}/game/${path}`;
  }

  private getTraitImageUrl(rawPath: string) {
    const path = rawPath.toLowerCase().replace(".tex", ".png");

    const [versionMajor, versionMinor] = this.version.split(".");
    let prevVersionMinor = parseInt(versionMinor) - 1;

    if (prevVersionMinor === 8) prevVersionMinor--;

    return ["9", "8"].includes(versionMinor)
      ? `https://raw.communitydragon.org/${`${versionMajor}.${prevVersionMinor}`}/game/${path}`
      : `https://raw.communitydragon.org/${this.version}/game/${path}`;
  }

  public static getColor(cost: number) {
    switch (cost) {
      case 1:
        return "#6b7280";
      case 2:
        return "#0b652e";
      case 3:
        return "#276fa8";
      case 4:
        return "#ca21b5";
      case 5:
        return "#ef9f26";
      default:
        return "#00ff87";
    }
  }
}
