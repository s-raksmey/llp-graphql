import { db } from "@/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export type LectureStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type LectureContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

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

export type LectureContentRow = RowDataPacket & {
  id: number;
  lectureId: number;
  outlineItemId: number;
  content: unknown | null;
  status: LectureContentStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type LectureFilters = {
  status?: LectureStatus;
  categoryId?: string | number;
};

export type CreateLectureOutlineItemInput = {
  title: string;
  children: string[];
};

export type CreateLectureInput = {
  categoryId?: string | number;
  title: string;
  slug: string;
  description?: string;
  readingTime?: string;
  outlineItems: CreateLectureOutlineItemInput[];
};

export type SaveLectureContentInput = {
  lectureId: string | number;
  outlineItemId: string | number;
  content: unknown;
  status?: LectureContentStatus;
};

export type UpdateLectureStatusInput = {
  id: string | number;
  status: LectureStatus;
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

  async findContentByOutlineItem(
    outlineItemId: string | number,
  ): Promise<LectureContentRow | null> {
    const [rows] = await db.query<LectureContentRow[]>(
      `
      SELECT
        id,
        lecture_id AS lectureId,
        outline_item_id AS outlineItemId,
        content,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM lecture_contents
      WHERE outline_item_id = ?
      LIMIT 1
      `,
      [outlineItemId],
    );

    return rows[0] ?? null;
  },

  async findById(id: string | number): Promise<LectureRow | null> {
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
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    return rows[0] ?? null;
  },

  async create(input: CreateLectureInput): Promise<LectureRow> {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [lectureResult] = await connection.execute<ResultSetHeader>(
        `
        INSERT INTO lectures (
          category_id,
          title,
          slug,
          description,
          content,
          status,
          reading_time,
          published_at
        )
        VALUES (?, ?, ?, ?, ?, 'DRAFT', ?, NULL)
        `,
        [
          input.categoryId ?? null,
          input.title,
          input.slug,
          input.description ?? null,
          JSON.stringify({ type: "doc", content: [] }),
          input.readingTime ?? "5 minutes",
        ],
      );

      const lectureId = lectureResult.insertId;
      let sortOrder = 0;

      for (const item of input.outlineItems) {
        const [parentResult] = await connection.execute<ResultSetHeader>(
          `
          INSERT INTO lecture_outline_items (
            lecture_id,
            parent_id,
            title,
            sort_order
          )
          VALUES (?, NULL, ?, ?)
          `,
          [lectureId, item.title, sortOrder],
        );

        const parentId = parentResult.insertId;
        sortOrder += 1;

        for (const childTitle of item.children) {
          await connection.execute(
            `
            INSERT INTO lecture_outline_items (
              lecture_id,
              parent_id,
              title,
              sort_order
            )
            VALUES (?, ?, ?, ?)
            `,
            [lectureId, parentId, childTitle, sortOrder],
          );

          sortOrder += 1;
        }
      }

      await connection.commit();

      const lecture = await this.findById(lectureId);

      if (!lecture) {
        throw new Error("Lecture was created but could not be loaded.");
      }

      return lecture;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async saveContent(input: SaveLectureContentInput): Promise<LectureContentRow> {
    const status = input.status ?? "DRAFT";

    await db.execute(
      `
      INSERT INTO lecture_contents (
        lecture_id,
        outline_item_id,
        content,
        status
      )
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        content = VALUES(content),
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP
      `,
      [
        input.lectureId,
        input.outlineItemId,
        JSON.stringify(input.content),
        status,
      ],
    );

    const content = await this.findContentByOutlineItem(input.outlineItemId);

    if (!content) {
      throw new Error("Lecture content was saved but could not be loaded.");
    }

    return content;
  },

  async updateStatus(input: UpdateLectureStatusInput): Promise<LectureRow> {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute(
      `
      UPDATE lectures
      SET
        status = ?,
        published_at = CASE
          WHEN ? = 'PUBLISHED' AND published_at IS NULL THEN CURRENT_TIMESTAMP
          ELSE published_at
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [input.status, input.status, input.id],
      );

      if (input.status === "PUBLISHED" || input.status === "DRAFT") {
        await connection.execute(
          `
          UPDATE lecture_contents
          SET
            status = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE lecture_id = ?
          `,
          [input.status, input.id],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const lecture = await this.findById(input.id);

    if (!lecture) {
      throw new Error("Lecture status was updated but could not be loaded.");
    }

    return lecture;
  },
};
