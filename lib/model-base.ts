import { CDragonJSON } from "./data-cdragon";

export type ModelBaseParams = {
  // rank: number;
  // rankTotalCount: number;
  // compTotalCount: number;
  cdragon: CDragonJSON;
  version: string;
};

export default class ModelBase {
  // public rank;
  // public rankTotalCount;
  // public compTotalCount;
  public cdragon;
  public version;

  constructor({
    // rank,
    // rankTotalCount,
    // compTotalCount,
    cdragon,
    version,
  }: ModelBaseParams) {
    // this.rank = rank;
    // this.rankTotalCount = rankTotalCount;
    // this.compTotalCount = compTotalCount;
    this.cdragon = cdragon;
    this.version = version;
  }
}
