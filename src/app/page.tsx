import { preloadQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { GlobeLoader } from "@/components/globe-loader";

export default async function Home() {
  const preloadedVisitors = await preloadQuery(api.visitors.get, {});
  return <GlobeLoader preloadedVisitors={preloadedVisitors} />;
}
