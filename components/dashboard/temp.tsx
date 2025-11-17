"use client";
import React from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useUserStore } from "@/stores/userStore";
import { useToastFromCookie } from "@/hooks/useToastFromCookies";
import { useGetCurrentUser } from "@/hooks/useAuth";

export default function Tepm() {
  const toastCookies = useToastFromCookie();
  const userStore = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const { data, error } = useGetCurrentUser();

  if (!error && data) setUser(data);
  console.log(userStore);

  return (
    <>
      <Button onClick={() => toast("Toast")}>Render Toast</Button>
      <p>Hello {userStore?.display_name}</p>
    </>
  );
}
