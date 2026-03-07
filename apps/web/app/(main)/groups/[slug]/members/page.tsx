import { notFound } from "next/navigation";

import { cachedGetGroup } from "@/app/actions/cached-group";
import { MemberList } from "@/components/groups/member-list";

interface MembersPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { slug } = await params;
  const group = await cachedGetGroup({ slug });

  if (!group) {
    notFound();
  }

  // Get current user's role in the group
  const currentUserRole = group.my_membership?.role || null;

  return (
    <div className="py-6">
      <MemberList groupId={group.id} currentUserRole={currentUserRole} />
    </div>
  );
}
