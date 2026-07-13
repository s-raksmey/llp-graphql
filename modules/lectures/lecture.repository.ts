import { db } from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export type LectureStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type LectureRow = RowDataPacket & {
  id: number;
  categoryId: number | null;
  title: string;
  slug: string;
  description: string | null;
  content: unknown | null;
  status: LectureStatus;
  readingTime: string | null;
  publishedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type LectureOutlineItemRow = RowDataPacket & {
  id: number;
  lectureId: number;
  parentId: number | null;
  title: string;
  sortOrder: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type LectureFilters = {
  status?: LectureStatus;
  categoryId?: string | number;
};

export const lectureRepository = {
  async findAll(args: LectureFilters = {}): Promise<LectureRow[]> {
    const where: string[] = [];
    const values: unknown[] = [];

    if (args.status) {
      where.push("status = ?");
      values.push(args.status);
    }

    if (args.categoryId) {
      where.push("category_id = ?");
      values.push(args.categoryId);
    }

    const [rows] = await db.query<LectureRow[]>(
      `
      SELECT
        id,
        category_id AS categoryId,
        title,
        slug,
        description,
        content,
        status,
        reading_time AS readingTime,
        published_at AS publishedAt,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM lectures
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY published_at DESC, id DESC
      `,
      values,
    );

    return rows;
  },

  async findBySlug(slug: string): Promise<LectureRow | null> {
    const [rows] = await db.query<LectureRow[]>(
      `
      SELECT
        id,
        category_id AS categoryId,
        title,
        slug,
        description,
        content,
        status,
        reading_time AS readingTime,
        published_at AS publishedAt,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM lectures
      WHERE slug = ?
      LIMIT 1
      `,
      [slug],
    );

    return rows[0] ?? null;
  },

  async findOutlineItems(lectureId: string | number): Promise<LectureOutlineItemRow[]> {
    const [rows] = await db.query<LectureOutlineItemRow[]>(
      `
      SELECT
        id,
        lecture_id AS lectureId,
        parent_id AS parentId,
        title,
        sort_order AS sortOrder,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM lecture_outline_items
      WHERE lecture_id = ?
      ORDER BY sort_order ASC, id ASC
      `,
      [lectureId],
    );

    return rows;
  },
};
