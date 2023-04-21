import { TraitStats } from "./data-collector";
import ModelBase, { ModelBaseParams } from "./model-base";
import TFTUnit from "./model-unit";

export type TFTTraitParams = ModelBaseParams & {
  stats: TraitStats;
};

export default class TFTTrait extends ModelBase {
  public id;
  public name;
  public count;
  public color;
  public borderColor;
  public imageUrl;
  public neighbors;
  public units;
  public unitCount;

  public stats;

  public stage1Units;
  public stage2Units;

  public rank;
  public rankTotalCount;
  public compTotalCount;

  constructor({ stats, ...rest }: TFTTraitParams) {
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
    this.color = data.color;
    this.borderColor = data.borderColor;
    this.imageUrl = data.imageUrl;
    this.units = data.units;
    this.unitCount = data.unitCount;
    this.neighbors = this.stats.neighbors.map((neighborStats) =>
      this.getMergedData(neighborStats)
    );
  }

  private getMergedData(
    stats: Omit<
      TraitStats,
      "neighbors" | "rank" | "rankTotalCount" | "compTotalCount"
    >
  ) {
    for (const set of this.cdragon.setData) {
      const staticData = set.traits.find((t) => t.apiName === stats.name);
      if (staticData) {
        if (staticData.effects.length !== stats.tierTotal) {
          throw `[${stats.id}]: Length difference detected: staticData.effects: ${staticData.effects.length} / stats.tierTotal: ${stats.tierTotal}`;
        }

        const [color, borderColor] = this.getColor(stats.style);
        return {
          id: stats.id,
          name: staticData.name,
          count: stats.count,
          color,
          borderColor,
          imageUrl: this.getImageUrl(staticData.icon),
          unitCount: staticData.effects[stats.tierCurrent - 1].minUnits,
          units: staticData.units.map((unit) => ({
            ...unit,
            imageUrl: TFTUnit.getImageUrl(
              unit.apiName,
              !this.stage1Units.includes(unit.apiName) &&
                this.stage2Units.includes(unit.apiName),
              this.version
            ),
            color: TFTUnit.getColor(unit.cost),
          })),
        };
      }
    }

    throw `static data for ${stats.name} not found.`;
  }

  private getImageUrl(rawPath: string) {
    rawPath = rawPath.toLowerCase();
    rawPath = rawPath.replace(".tex", ".png");
    return `https://raw.communitydragon.org/${this.version}/game/${rawPath}`;
  }

  private getColor(style: number) {
    switch (style) {
      case 1:
        return ["#a0715e", "#dcb6a7"];
      case 2:
        return ["#7c8f92", "#d2e3e5"];
      case 3:
        return ["#bd9a38", "#f8db8a"];
      case 4:
        return ["#ad1457", "#c97f9f"];
      default:
        return ["black", "white"];
    }
  }
}
