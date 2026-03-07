import { cachedGetUserProfile } from "@/app/actions/cached-user";
import { Header } from "@/components/dashboard/Header";
interface ProfileIdProps {
  params: Promise<{ slug: string }>;
}
export default async function FriendsHeader({ params }: ProfileIdProps) {
  const { slug } = await params;
  const user = await cachedGetUserProfile(slug);
  return <Header title={user?.display_name || user?.username || slug} />;
}
