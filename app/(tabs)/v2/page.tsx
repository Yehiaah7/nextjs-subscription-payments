import HomeV2Screen from './HomeV2Screen';
import { getHomePageData } from '../home/getHomeData';

export default async function HomeV2Page() {
  const homeData = await getHomePageData();

  return <HomeV2Screen {...homeData} />;
}
