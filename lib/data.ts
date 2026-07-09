export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type LectureStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";
export type MediaKind = "IMAGE" | "PDF" | "ZIP" | "VIDEO" | "FILE";
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR";

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: CourseStatus;
  thumbnailUrl?: string | null;
};

export type Lecture = {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  content: string;
  status: LectureStatus;
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type MediaFile = {
  id: string;
  kind: MediaKind;
  name: string;
  url: string;
  size: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  disabled: boolean;
};

export type SiteSettings = {
  websiteName: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  contactEmail?: string | null;
  defaultSeoTitle?: string | null;
  defaultSeoDescription?: string | null;
  analyticsId?: string | null;
};

export const courses: Course[] = [
  {
    id: "course-nextjs",
    title: "Next.js Foundations",
    slug: "nextjs-foundations",
    description: "Build production-ready student portals with routing, rendering, and data fetching.",
    status: "PUBLISHED",
    thumbnailUrl: "/course-nextjs.jpg",
  },
  {
    id: "course-graphql",
    title: "GraphQL for Learning Platforms",
    slug: "graphql-for-learning-platforms",
    description: "Design flexible schemas for courses, lectures, search, media, and CMS workflows.",
    status: "PUBLISHED",
    thumbnailUrl: "/course-graphql.jpg",
  },
  {
    id: "course-editor",
    title: "Rich Lecture Authoring",
    slug: "rich-lecture-authoring",
    description: "A draft course for managing rich text, embeds, attachments, and SEO metadata.",
    status: "DRAFT",
    thumbnailUrl: null,
  },
];

export const lectures: Lecture[] = [
  {
    id: "lecture-app-router",
    courseId: "course-nextjs",
    title: "App Router Basics",
    slug: "app-router-basics",
    content: "Learn how layouts, pages, and route handlers shape the public website.",
    status: "PUBLISHED",
    publishedAt: "2026-07-09T02:00:00.000Z",
    seoTitle: "App Router Basics",
    seoDescription: "A beginner lecture about Next.js App Router fundamentals.",
  },
  {
    id: "lecture-schema-design",
    courseId: "course-graphql",
    title: "Schema Design for Courses and Lectures",
    slug: "schema-design-for-courses-and-lectures",
    content: "Model courses, lectures, media files, search, settings, and admin users in GraphQL.",
    status: "PUBLISHED",
    publishedAt: "2026-07-09T03:00:00.000Z",
    seoTitle: "GraphQL Schema Design",
    seoDescription: "How to model lecture learning content in GraphQL.",
  },
  {
    id: "lecture-editor-blocks",
    courseId: "course-editor",
    title: "Editor Blocks and Attachments",
    slug: "editor-blocks-and-attachments",
    content: "Draft notes for images, tables, code blocks, YouTube embeds, PDFs, and downloadable files.",
    status: "DRAFT",
    publishedAt: null,
    seoTitle: null,
    seoDescription: null,
  },
];

export const mediaFiles: MediaFile[] = [
  {
    id: "media-hero",
    kind: "IMAGE",
    name: "Homepage hero thumbnail",
    url: "/uploads/homepage-hero.jpg",
    size: 240128,
  },
  {
    id: "media-syllabus",
    kind: "PDF",
    name: "Course syllabus",
    url: "/uploads/course-syllabus.pdf",
    size: 95480,
  },
];

export const users: AdminUser[] = [
  {
    id: "user-super-admin",
    name: "LLP Super Admin",
    email: "admin@llp.local",
    role: "SUPER_ADMIN",
    disabled: false,
  },
  {
    id: "user-editor",
    name: "Content Editor",
    email: "editor@llp.local",
    role: "EDITOR",
    disabled: false,
  },
];

export const settings: SiteSettings = {
  websiteName: "Lecture Learning Platform",
  logoUrl: null,
  faviconUrl: null,
  contactEmail: "hello@llp.local",
  defaultSeoTitle: "Lecture Learning Platform",
  defaultSeoDescription: "Courses, lectures, media, and learning content delivered through GraphQL.",
  analyticsId: null,
};
