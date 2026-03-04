import { fetchPostById } from "@/app/actions/post";
import Wrapper from "./wrapper";
import { getGroup, GroupWithDetails } from "@/app/actions/group";

interface PostPageProps {
  params: Promise<{ id: string }>;
}
async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await fetchPostById(id);
  let group: GroupWithDetails | undefined | null = undefined;
  if (post?.group_id) {
    group = await getGroup({ id: post.group_id });
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
