import { Enums } from "./database.types";

export type GroupPrivacyFilter = Enums<"privacy_group"> | "all";

export interface ExploreGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  avatar_url: string | null;
  privacy_level: GroupPrivacyFilter;
  membership_mode: string;
  member_count: number;
  my_membership_status: "active" | "pending" | "none";
}
