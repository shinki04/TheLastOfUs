import { Separator } from "@repo/ui/components/separator";

import { TrendingHashtags } from "../TrendingHashtags";
import { ContactList } from "./ContactList";

export default function RightSidebar() {
  return (
    <div className="space-y-4">
      <TrendingHashtags className="w-full hidden lg:block" />
      <Separator />
      <ContactList />
    </div>
  );
}
