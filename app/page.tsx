import DataAggregator from "@/lib/data-aggregator";
import ClientRedirect from "./ClientRedirect";
import { Category } from "@/lib/shared-const";

export default async function Page() {
  const params = await DataAggregator.getAllParams();
  const { version, region, league } = params[0];

  return (
    <ClientRedirect
      redirectPath={`/${version}/${region}/${league}/${Category.units}`}
    />
  );
}
