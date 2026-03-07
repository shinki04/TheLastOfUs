import { ProfileForm } from "@/components/setting/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-6 border-b border-dashboard-border">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Thông tin cá nhân</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cập nhật thông tin nhận diện tài khoản VLU Social của bạn.
        </p>
      </div>
      <div className="flex-1 w-full bg-dashboard-background/30 pb-10">
        <ProfileForm />
      </div>
    </div>
  );
}
