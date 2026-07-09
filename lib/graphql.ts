import { buildSchema, graphql, type GraphQLError, type GraphQLSchema } from "graphql";
import {
  courses,
  lectures,
  mediaFiles,
  settings,
  users,
  type Course,
  type CourseStatus,
  type Lecture,
  type LectureStatus,
  type MediaKind,
} from "./data";

type GraphQLRequest = {
  query?: string;
  variables?: Record<string, unknown>;
  operationName?: string;
};

type CreateCourseInput = {
  title: string;
  slug: string;
  description: string;
  status?: CourseStatus;
  thumbnailUrl?: string | null;
};

type CreateLectureInput = {
  courseId: string;
  title: string;
  slug: string;
  content: string;
  status?: LectureStatus;
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

type UpdateSettingsInput = {
  websiteName?: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  contactEmail?: string | null;
  defaultSeoTitle?: string | null;
  defaultSeoDescription?: string | null;
  analyticsId?: string | null;
};

export const schema: GraphQLSchema = buildSchema(`
  enum CourseStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  enum LectureStatus {
    DRAFT
    PUBLISHED
    SCHEDULED
  }

  enum MediaKind {
    IMAGE
    PDF
    ZIP
    VIDEO
    FILE
  }

  enum UserRole {
    SUPER_ADMIN
    ADMIN
    EDITOR
  }

  type Health {
    ok: Boolean!
    service: String!
    version: String!
  }

  type Course {
    id: ID!
    title: String!
    slug: String!
    description: String!
    status: CourseStatus!
    thumbnailUrl: String
    lectureCount: Int!
    lectures(status: LectureStatus): [Lecture!]!
  }

  type Lecture {
    id: ID!
    courseId: ID!
    course: Course
    title: String!
    slug: String!
    content: String!
    status: LectureStatus!
    publishedAt: String
    seoTitle: String
    seoDescription: String
  }

  type MediaFile {
    id: ID!
    kind: MediaKind!
    name: String!
    url: String!
    size: Int!
  }

  type AdminUser {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
    disabled: Boolean!
  }

  type SiteSettings {
    websiteName: String!
    logoUrl: String
    faviconUrl: String
    contactEmail: String
    defaultSeoTitle: String
    defaultSeoDescription: String
    analyticsId: String
  }

  type SearchResult {
    id: ID!
    type: String!
    title: String!
    slug: String!
    excerpt: String!
  }

  type AuthPayload {
    token: String!
    user: AdminUser!
  }

  input CreateCourseInput {
    title: String!
    slug: String!
    description: String!
    status: CourseStatus = DRAFT
    thumbnailUrl: String
  }

  input CreateLectureInput {
    courseId: ID!
    title: String!
    slug: String!
    content: String!
    status: LectureStatus = DRAFT
    publishedAt: String
    seoTitle: String
    seoDescription: String
  }

  input UpdateSettingsInput {
    websiteName: String
    logoUrl: String
    faviconUrl: String
    contactEmail: String
    defaultSeoTitle: String
    defaultSeoDescription: String
    analyticsId: String
  }

  type Query {
    health: Health!
    courses(status: CourseStatus, search: String, limit: Int = 20, offset: Int = 0): [Course!]!
    course(id: ID, slug: String): Course
    lectures(courseId: ID, status: LectureStatus, search: String, limit: Int = 20, offset: Int = 0): [Lecture!]!
    lecture(id: ID, slug: String): Lecture
    mediaFiles(kind: MediaKind, search: String): [MediaFile!]!
    users: [AdminUser!]!
    settings: SiteSettings!
    search(term: String!, courseId: ID): [SearchResult!]!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    createCourse(input: CreateCourseInput!): Course!
    updateCourseStatus(id: ID!, status: CourseStatus!): Course!
    createLecture(input: CreateLectureInput!): Lecture!
    publishLecture(id: ID!): Lecture!
    updateSettings(input: UpdateSettingsInput!): SiteSettings!
  }
`);

const bySearchText = <T>(
  items: T[],
  search: string | undefined,
  getText: (item: T) => string,
) => {
  if (!search?.trim()) {
    return items;
  }

  const searchTerm = search.trim().toLowerCase();
  return items.filter((item) => getText(item).toLowerCase().includes(searchTerm));
};

const paginate = <T>(items: T[], limit = 20, offset = 0) =>
  items.slice(Math.max(offset, 0), Math.max(offset, 0) + Math.max(limit, 0));

const coursePresenter = (course: Course) => ({
  ...course,
  lectureCount: () => lectures.filter((lecture) => lecture.courseId === course.id).length,
  lectures: ({ status }: { status?: LectureStatus }) =>
    lectures
      .filter((lecture) => lecture.courseId === course.id && (!status || lecture.status === status))
      .map(lecturePresenter),
});

const lecturePresenter = (lecture: Lecture) => ({
  ...lecture,
  course: () => {
    const course = courses.find((item) => item.id === lecture.courseId);
    return course ? coursePresenter(course) : null;
  },
});

export const rootValue = {
  health: () => ({
    ok: true,
    service: "llp-graphql",
    version: "0.1.0",
  }),
  courses: ({
    status,
    search,
    limit,
    offset,
  }: {
    status?: CourseStatus;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const filteredByStatus = courses.filter((course) => !status || course.status === status);
    return paginate(
      bySearchText(
        filteredByStatus,
        search,
        (course) => `${course.title} ${course.slug} ${course.description}`,
      ),
      limit,
      offset,
    ).map(coursePresenter);
  },
  course: ({ id, slug }: { id?: string; slug?: string }) => {
    const course = courses.find((item) => item.id === id || item.slug === slug);
    return course ? coursePresenter(course) : null;
  },
  lectures: ({
    courseId,
    status,
    search,
    limit,
    offset,
  }: {
    courseId?: string;
    status?: LectureStatus;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const filtered = lectures.filter(
      (lecture) =>
        (!courseId || lecture.courseId === courseId) && (!status || lecture.status === status),
    );
    return paginate(
      bySearchText(
        filtered,
        search,
        (lecture) => `${lecture.title} ${lecture.slug} ${lecture.content}`,
      ),
      limit,
      offset,
    ).map(lecturePresenter);
  },
  lecture: ({ id, slug }: { id?: string; slug?: string }) => {
    const lecture = lectures.find((item) => item.id === id || item.slug === slug);
    return lecture ? lecturePresenter(lecture) : null;
  },
  mediaFiles: ({ kind, search }: { kind?: MediaKind; search?: string }) =>
    bySearchText(
      mediaFiles.filter((file) => !kind || file.kind === kind),
      search,
      (file) => `${file.name} ${file.url} ${file.kind}`,
    ),
  users: () => users,
  settings: () => settings,
  search: ({ term, courseId }: { term: string; courseId?: string }) => {
    const courseResults = bySearchText(
      courses,
      term,
      (course) => `${course.title} ${course.slug} ${course.description}`,
    ).map((course) => ({
      id: course.id,
      type: "COURSE",
      title: course.title,
      slug: course.slug,
      excerpt: course.description,
    }));

    const lectureResults = bySearchText(
      lectures.filter((lecture) => !courseId || lecture.courseId === courseId),
      term,
      (lecture) => `${lecture.title} ${lecture.slug} ${lecture.content}`,
    ).map((lecture) => ({
      id: lecture.id,
      type: "LECTURE",
      title: lecture.title,
      slug: lecture.slug,
      excerpt: lecture.content,
    }));

    return [...courseResults, ...lectureResults];
  },
  login: ({ email }: { email: string; password: string }) => {
    const user = users.find((item) => item.email === email && !item.disabled);

    if (!user) {
      throw new Error("Invalid credentials.");
    }

    return {
      token: `dev-token-${user.id}`,
      user,
    };
  },
  createCourse: ({ input }: { input: CreateCourseInput }) => {
    if (courses.some((course) => course.slug === input.slug)) {
      throw new Error("A course with this slug already exists.");
    }

    const course: Course = {
      id: `course-${Date.now()}`,
      title: input.title,
      slug: input.slug,
      description: input.description,
      status: input.status ?? "DRAFT",
      thumbnailUrl: input.thumbnailUrl ?? null,
    };

    courses.push(course);
    return coursePresenter(course);
  },
  updateCourseStatus: ({ id, status }: { id: string; status: CourseStatus }) => {
    const course = courses.find((item) => item.id === id);

    if (!course) {
      throw new Error("Course not found.");
    }

    course.status = status;
    return coursePresenter(course);
  },
  createLecture: ({ input }: { input: CreateLectureInput }) => {
    if (!courses.some((course) => course.id === input.courseId)) {
      throw new Error("Course not found.");
    }

    if (lectures.some((lecture) => lecture.slug === input.slug)) {
      throw new Error("A lecture with this slug already exists.");
    }

    const lecture: Lecture = {
      id: `lecture-${Date.now()}`,
      courseId: input.courseId,
      title: input.title,
      slug: input.slug,
      content: input.content,
      status: input.status ?? "DRAFT",
      publishedAt: input.publishedAt ?? null,
      seoTitle: input.seoTitle ?? null,
      seoDescription: input.seoDescription ?? null,
    };

    lectures.push(lecture);
    return lecturePresenter(lecture);
  },
  publishLecture: ({ id }: { id: string }) => {
    const lecture = lectures.find((item) => item.id === id);

    if (!lecture) {
      throw new Error("Lecture not found.");
    }

    lecture.status = "PUBLISHED";
    lecture.publishedAt = new Date().toISOString();
    return lecturePresenter(lecture);
  },
  updateSettings: ({ input }: { input: UpdateSettingsInput }) => {
    Object.assign(settings, input);
    return settings;
  },
};

export async function executeGraphQLRequest({ query, variables, operationName }: GraphQLRequest) {
  if (!query) {
    return {
      errors: [
        {
          message: "GraphQL request body must include a query.",
        },
      ],
    };
  }

  return graphql({
    schema,
    source: query,
    rootValue,
    variableValues: variables,
    operationName,
  });
}

export function formatGraphQLError(error: GraphQLError | { message: string }) {
  if (!("locations" in error)) {
    return error;
  }

  return {
    message: error.message,
    locations: error.locations,
    path: error.path,
  };
}
