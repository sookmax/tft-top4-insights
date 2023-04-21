import DataAggregator, { StatsParams } from "@/lib/data-aggregator";
import CDragon from "@/lib/data-cdragon";
import List from "./List";
import NavBar from "./NavBar";
import ScrollYObserver from "./ScrollYObserver";
import Footer from "./Footer";
import BackToTopButton from "./BackToTopButton";

export const dynamicParams = false;
export const revalidate = false;

export default async function Page({ params }: { params: StatsParams }) {
  const { version, region, league, category } = params;

  const stats = await DataAggregator.getTop4Stats(
    version,
    region,
    league,
    category
  );

  const cdragon = await CDragon.getJSON(version);

  return (
    <>
      <div style={{ maxWidth: 730, margin: "auto" }}>
        {/* @ts-expect-error Async Server Component  */}
        <NavBar params={params} lastUpdatedTS={stats.lastUpdatedTS} />
        <List stats={stats} cdragon={cdragon} version={version} />
        <Footer />
      </div>
      <BackToTopButton />
    </>
  );
}

export async function generateStaticParams() {
  const params = await DataAggregator.getAllParams();
  return params;
}
