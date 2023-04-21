import DataAggregator, { StatsParams } from "@/lib/data-aggregator";
import { Category } from "@/lib/shared-const";
import Dialog from "./Dialog";
import ArrowDownIcon from "./ArrowDownIcon";
import Filters from "./Filters";
import NavBarLinks from "./NavBarLinks";
import LastUpdatedBanner from "./LastUpdatedBanner";
import HorizontalScrollProgressBar from "./HorizontalScrollProgressBar";

export default async function NavBar({
  params,
  lastUpdatedTS,
}: {
  params: StatsParams;
  lastUpdatedTS: number;
}) {
  let title = "";

  switch (params.category) {
    case Category.units:
      title = "TFT Top4's Units".toUpperCase();
      break;
    case Category.traits:
      title = "TFT Top4's Traits".toUpperCase();
      break;
    case Category.augments:
      title = "TFT Top4's Augments".toUpperCase();
      break;
  }

  const allParams = await DataAggregator.getAllParams();

  return (
    <nav className="sticky top-0 z-10 bg-gray-950/70 backdrop-blur">
      <HorizontalScrollProgressBar />
      <div className="flex border-b border-gray-700">
        <div className="flex-grow flex items-center">
          <Dialog
            triggerAsChild
            trigger={
              <button className="w-full flex items-center p-2">
                <span className="text-xl font-[500]">{title}</span>
                <span>
                  <ArrowDownIcon className="w-6 h-6" />
                </span>
              </button>
            }
            contentAsChild
            content={
              <div className="space-y-10 mb-20 p-4">
                <div className="flex flex-col items-center">
                  <h1 className="text-4xl font-[500] mb-1">
                    {"TFT Top4 Insights".toUpperCase()}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {"See what's popular among players who've made to top4."}
                  </p>
                </div>
                <NavBarLinks params={params} />
              </div>
            }
          />
        </div>
        <div className="w-px bg-gray-700"></div>
        <div>
          <Dialog
            triggerAsChild
            trigger={
              <button className="text-xs flex items-center p-2">
                <div>
                  <div className="space-x-1 text-left">
                    <span className="inline-block w-10">Version:</span>
                    <span className="text-teal-200">{params.version}</span>
                  </div>
                  <div className="space-x-1 text-left">
                    <span className="inline-block w-10">Region:</span>
                    <span className="text-teal-200">{params.region}</span>
                  </div>
                  <div className="space-x-1 text-left">
                    <span className="inline-block w-10">League:</span>
                    <span className="text-teal-200">{params.league}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <ArrowDownIcon className="w-6 h-6" />
                </div>
              </button>
            }
            content={
              <div className="mb-10 p-4">
                <h1 className="text-2xl font-[500] mb-4">
                  {"Adjust filters to your liking".toUpperCase()}
                </h1>
                <div>
                  <Filters allParams={allParams} />
                </div>
              </div>
            }
          />
        </div>
      </div>
      <LastUpdatedBanner lastUpdatedTS={lastUpdatedTS} />
    </nav>
  );
}
