import { cachedGetPost } from "@/app/actions/cache-post";
import { cachedGetGroup } from "@/app/actions/cached-group";
import { GroupWithDetails } from "@/app/actions/group";

import Wrapper from "./wrapper";

interface PostPageProps {
  params: Promise<{ id: string }>;
}
async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await cachedGetPost(id);
  let group: GroupWithDetails | undefined | null = undefined;
  if (post?.group_id) {
    group = await cachedGetGroup({ id: post.group_id });
  }
  if (!post) {
    return <div>Post not found</div>;
  }
  return (
    <>
      <Wrapper post={post} group={group} />
    </>
  );
}

export default PostPage;
