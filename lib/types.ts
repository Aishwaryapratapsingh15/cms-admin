export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  roleId: string;
  fullName: string;
  email: string;
  designation: string | null;
  shortBio: string | null;
  linkedin: string | null;
  twitter: string | null;
  avatarMediaId: string | null;
  avatarMedia: {
    id: string;
    s3Key: string;
    altText: string | null;
    width: number | null;
    height: number | null;
    url: string;
  } | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  role: Role;
  // Only present on the /users list response — the earliest-created ADMIN,
  // who cms-backend refuses to let anyone delete.
  isFirstAdmin?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, "role"> & { role: string };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  heading: string | null;
  description: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export type BlogStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: BlogStatus;
  isFeatured: boolean;
  allowComments: boolean;
  views: number;
  readingTime: number | null;
  publishedAt: string | null;
  scheduledAt: string | null;
  archivedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ctaHeading: string | null;
  ctaDescription: string | null;
  ctaPrimaryText: string | null;
  ctaPrimaryUrl: string | null;
  ctaSecondaryText: string | null;
  ctaSecondaryUrl: string | null;
  featuredMediaId: string | null;
  featuredMedia: {
    id: string;
    s3Key: string;
    altText: string | null;
    width: number | null;
    height: number | null;
    url: string;
  } | null;
  authorId: string;
  author: { id: string; fullName: string; email: string; avatarMediaId: string | null };
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  tags: Tag[];
  faqs: BlogFaq[];
}

export interface BlogFaq {
  id: string;
  question: string;
  answer: string;
  position: number;
}

export interface BlogVersion {
  id: string;
  blogId: string;
  title: string;
  excerpt: string | null;
  content: string;
  editedById: string;
  editedBy: { id: string; fullName: string; email: string };
  createdAt: string;
}

export interface Media {
  id: string;
  originalName: string;
  storedName: string;
  s3Key: string;
  mimeType: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  uploadedById: string;
  uploadedBy: { id: string; fullName: string; email: string };
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalBlogs: number;
  totalCategories: number;
  totalViews: number;
  blogsByStatus: Record<BlogStatus, number>;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  user: { id: string; fullName: string; email: string } | null;
  action: string;
  entity: string;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
}
