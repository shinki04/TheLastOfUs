import { getGlobalKeywords } from "@/app/actions/admin-keywords";
import { KeywordsManager } from "@/components/moderation/KeywordsManager";

export const metadata = {
  title: "Quản lý từ cấm | Admin",
  description: "Quản lý từ khóa bị cấm toàn hệ thống",
};

export default async function KeywordsPage() {
  const keywords = await getGlobalKeywords();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Quản lý từ cấm</h1>
        <p className="text-muted-foreground">
          Các từ khóa bị chặn toàn hệ thống. Bài đăng và bình luận chứa các từ này sẽ bị chặn tự động.
        </p>
      </div>

      <KeywordsManager initialKeywords={keywords} />
    </div>
  );
}
