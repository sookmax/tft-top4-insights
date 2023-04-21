import fnv1a from "fnv1a";
import { AugmentStats } from "./data-collector";
import ModelBase, { ModelBaseParams } from "./model-base";

export type TFTAugmentParams = ModelBaseParams & {
  stats: AugmentStats;
};

export default class TFTAugment extends ModelBase {
  public id;
  public name;
  public count;
  public imageUrl;

  public desc;
  public effects;

  public stats;

  public rank;
  public rankTotalCount;
  public compTotalCount;

  constructor({ stats, ...rest }: TFTAugmentParams) {
    super(rest);
    this.stats = stats;
    this.rank = stats.rank;
    this.rankTotalCount = stats.rankTotalCount;
    this.compTotalCount = stats.compTotalCount;

    const staticData = this.cdragon.items.find(
      (item) => item.apiName === this.stats.id
    );
    if (!staticData) throw `static data for ${this.stats.id} not found.`;

    let desc = staticData.desc;
    const descSpecialTokens = staticData.desc.match(/@[^@]*@/g);

    if (descSpecialTokens) {
      for (const token of descSpecialTokens) {
        const tokenBody = token.replaceAll("@", "");
        let value = staticData.effects[tokenBody];

        if (!value) {
          for (const effectKey of Object.keys(staticData.effects)) {
            if (effectKey.toLowerCase() === tokenBody.toLowerCase()) {
              value = staticData.effects[effectKey];
              break;
            }
          }

          if (!value) {
            const tokenBodyLowerCased = tokenBody.toLowerCase();
            const hashString = fnv1a(tokenBodyLowerCased).toString(16);

            for (const effectKey of Object.keys(staticData.effects)) {
              if (effectKey.includes(hashString)) {
                value = staticData.effects[effectKey];
                break;
              }
            }

            if (!value) {
              const tokenBodyNoPostfix = tokenBody.replace("*100", "");
              value = staticData.effects[tokenBodyNoPostfix];
              if (!value) {
                const tokenBodyLowerCased = tokenBodyNoPostfix.toLowerCase();
                const hashString = fnv1a(tokenBodyLowerCased).toString(16);

                for (const effectKey of Object.keys(staticData.effects)) {
                  if (effectKey.includes(hashString)) {
                    value = staticData.effects[effectKey];
                    break;
                  }
                }
              }
              if (value) {
                value = (eval(`${value}*100`) as number).toFixed(0);
              }
            }
          }
        }

        if (value) {
          desc = desc.replace(
            token,
            `<span class="text-teal-200">${value}</span>`
          );
        }
      }
    }

    this.id = this.stats.id;
    this.name = staticData.name;
    this.count = this.stats.count;
    this.imageUrl = this.getImageUrl(staticData.icon);
    this.desc = desc;
    this.effects = staticData.effects;
  }

  private getImageUrl(rawPath: string) {
    rawPath = rawPath.toLowerCase();
    rawPath = rawPath.replace(".dds", ".png");
    rawPath = rawPath.replace(".tex", ".png");

    const version = this.version === "13.8" ? "13.7" : this.version;

    return `https://raw.communitydragon.org/${version}/game/${rawPath}`;
  }
}
