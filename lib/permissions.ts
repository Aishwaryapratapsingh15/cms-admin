import { ROLES } from "./constants";

// UI-convenience mirror of the backend's seeded RolePermission grants
// (cms-backend/src/seed/seed.ts) — this only controls what's shown/enabled in
// the admin panel. The backend re-checks every one of these independently on
// every request (PermissionsGuard + BlogsService's ownership/publish checks),
// so a mismatch here is a UX bug, never a security hole.
export interface Capabilities {
  canManageUsers: boolean;
  // Create-only: AUTHOR has categories:create/tags:create on the backend but
  // not update/delete, so this is deliberately separate from canManage* below.
  canCreateCategories: boolean;
  canCreateTags: boolean;
  canManageCategories: boolean;
  canManageTags: boolean;
  canUploadMedia: boolean;
  canManageAnyMedia: boolean;
  canManageAllBlogs: boolean;
  canPublishBlogs: boolean;
  canDeleteBlogs: boolean;
  canViewAudit: boolean;
}

export function getCapabilities(roleName: string | undefined): Capabilities {
  const isAdmin = roleName === ROLES.ADMIN;
  const isEditor = roleName === ROLES.EDITOR;
  const isAuthor = roleName === ROLES.AUTHOR;

  return {
    canManageUsers: isAdmin,
    canCreateCategories: isAdmin || isEditor || isAuthor,
    canCreateTags: isAdmin || isEditor || isAuthor,
    canManageCategories: isAdmin || isEditor,
    canManageTags: isAdmin || isEditor,
    canUploadMedia: isAdmin || isEditor || isAuthor,
    canManageAnyMedia: isAdmin || isEditor,
    canManageAllBlogs: isAdmin || isEditor,
    canPublishBlogs: isAdmin || isEditor,
    canDeleteBlogs: isAdmin || isEditor,
    canViewAudit: isAdmin,
  };
}
