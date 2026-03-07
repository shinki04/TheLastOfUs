


import { PostManagementList } from "@/components/setting/PostManagementList";

export default function PostManagementPage() {
  return (
    <div className="max-w-4xl mx-auto w-full md:pt-4">
      <div className="flex flex-col w-full border-none shadow-none md:border-solid bg-transparent md:bg-dashboard-card dark:md:bg-dashboard-darkCard">
        <div className="p-4 md:px-8 border-b border-dashboard-border">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Quản lý bài viết & Kháng cáo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi trạng thái các bài viết của bạn, và gửi yêu cầu kháng cáo
            đối với bài viết bị từ chối.
          </p>
        </div>
        <div className="p-0 pb-10">
          <PostManagementList />
        </div>
      </div>
    </div>
  );
}
