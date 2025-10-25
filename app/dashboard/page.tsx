import * as React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { signOut } from "../auth/action";

// interface DashboardPageProps {
//   propName: type;
// }

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  console.log("Du lieu", data, error);
  if (error || !data?.user) {
    redirect("/login");
  }
  return (
    <>
      <Button onClick={signOut}>Đăng xuất</Button>
      <p>Hello {data.user?.email}</p>
    </>
  );
}
