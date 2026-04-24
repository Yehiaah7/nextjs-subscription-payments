import HomeScreen from './HomeScreen';
import { getHomePageData } from './getHomeData';

export default async function HomePage() {
  const homeData = await getHomePageData();

  return <HomeScreen {...homeData} />;
}
