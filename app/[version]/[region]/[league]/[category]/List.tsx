import { StatsAggregateUnion } from "@/lib/data-aggregator";
import { CDragonJSON } from "@/lib/data-cdragon";
import { Category } from "@/lib/shared-const";
import Unit from "./Unit";
import React from "react";
import Trait from "./Trait";
import Augment from "./Augment";
import ListVirtualizer from "./ListVirtualizer";

export default function List({
  stats,
  cdragon,
  version,
}: {
  stats: StatsAggregateUnion;
  cdragon: CDragonJSON;
  version: string;
}) {
  let items: any[] = [];
  let itemHeight = 0;
  let dynamic = false;

  switch (stats.type) {
    case Category.units:
      itemHeight = 272;
      dynamic = false;
      items = stats.value.map((unitStats, index) => (
        <Unit
          key={unitStats.id}
          stats={unitStats}
          allUnitStats={stats.value}
          cdragon={cdragon}
          version={version}
        />
      ));
      break;
    case Category.traits:
      itemHeight = 180;
      dynamic = false;
      items = stats.value.map((traitStats, index) => (
        <Trait
          key={traitStats.id}
          stats={traitStats}
          allTraitStats={stats.value}
          cdragon={cdragon}
          version={version}
        />
      ));
      break;
    case Category.augments:
      itemHeight = 76;
      dynamic = false;
      items = stats.value.map((augmentStats, index) => (
        <Augment
          key={augmentStats.id}
          stats={augmentStats}
          cdragon={cdragon}
          version={version}
        />
      ));
      break;
  }

  return (
    <ListVirtualizer items={items} itemHeight={itemHeight} dynamic={dynamic} />
  );
}
