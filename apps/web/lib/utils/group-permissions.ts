import type { GroupMemberRole } from "@repo/shared/types/group";

/**
 * Role hierarchy: admin > sub_admin > moderator > member
 */
const ROLE_HIERARCHY: Record<GroupMemberRole, number> = {
  admin: 4,
  sub_admin: 3,
  moderator: 2,
  member: 1,
};

/**
 * Management roles - roles that can manage group (approve members, manage keywords, etc.)
 */
const MANAGEMENT_ROLES: GroupMemberRole[] = ["admin", "sub_admin", "moderator"];

/**
 * Admin roles - roles that can manage settings and perform admin actions
 */
const ADMIN_ROLES: GroupMemberRole[] = ["admin", "sub_admin"];

/**
 * Check if a role can manage group (approve members, manage keywords)
 */
export function canManageGroup(role: GroupMemberRole | null | undefined): boolean {
  if (!role) return false;
  return MANAGEMENT_ROLES.includes(role);
}

/**
 * Check if a role is admin or sub_admin (can modify settings)
 */
export function isGroupAdmin(role: GroupMemberRole | null | undefined): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role);
}

/**
 * Check if a role is exactly admin (full access)
 */
export function isGroupOwner(role: GroupMemberRole | null | undefined): boolean {
  return role === "admin";
}

/**
 * Check if a role is at least moderator
 */
export function isModeratorOrAbove(role: GroupMemberRole | null | undefined): boolean {
  if (!role) return false;
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY.moderator;
}

/**
 * Check if roleA has higher or equal permissions than roleB
 */
export function hasHigherOrEqualRole(
  roleA: GroupMemberRole | null | undefined,
  roleB: GroupMemberRole | null | undefined
): boolean {
  if (!roleA) return false;
  if (!roleB) return true;
  return ROLE_HIERARCHY[roleA] >= ROLE_HIERARCHY[roleB];
}

/**
 * Check if roleA can modify roleB (must be strictly higher)
 */
export function canModifyRole(
  actorRole: GroupMemberRole | null | undefined,
  targetRole: GroupMemberRole | null | undefined
): boolean {
  if (!actorRole) return false;
  if (!targetRole) return true;
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}
