import * as React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { signOut } from "../auth/action";
import Tepm from "@/components/dashboard/temp";
import { getUserProfile } from "../actions/auth";

// interface DashboardPageProps {
//   propName: type;
// }

export default async function DashboardPage() {
  return (
    <>
      <Button onClick={signOut}>Đăng xuất</Button>

      <Tepm />
    </>
  );
}
