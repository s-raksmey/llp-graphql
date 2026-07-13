import { db } from "@/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export type CategoryScope = "COURSE" | "LECTURE" | "BOTH";
export type CategoryStatus = "ACTIVE" | "ARCHIVED";

export type CategoryRow = RowDataPacket & {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  scope: CategoryScope;
  status: CategoryStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type CategoryOutlineItemRow = RowDataPacket & {
  id: number;
  categoryId: number;
  parentId: number | null;
  title: string;
  sortOrder: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type CategoryFilters = {
  status?: CategoryStatus;
  scope?: CategoryScope;
};

export type CreateCategoryInput = {
  name: string;
  slug: string;
  description?: string;
  scope: CategoryScope;
};

export type UpdateCategoryInput = CreateCategoryInput & {
  id: string | number;
};

export type UpdateCategoryStatusInput = {
  id: string | number;
  status: CategoryStatus;
};

export type CountRow = RowDataPacket & {
  total: number;
};

export type DeleteCategoryResult = {
  id: string;
  success: boolean;
  message: string;
};

export const categoryRepository = {
  async findAll(args: CategoryFilters = {}): Promise<CategoryRow[]> {
    const where: string[] = [];
    const values: unknown[] = [];

    if (args.status) {
      where.push("status = ?");
      values.push(args.status);
    }

    if (args.scope) {
      where.push("scope IN (?, 'BOTH')");
      values.push(args.scope);
    }

    const [rows] = await db.query<CategoryRow[]>(
      `
      SELECT
        id,
        name,
        slug,
        description,
        scope,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM categories
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY id DESC
      `,
      values,
    );

    return rows;
  },

  async findById(id: string | number): Promise<CategoryRow | null> {
    const [rows] = await db.query<CategoryRow[]>(
      `
      SELECT
        id,
        name,
        slug,
        description,
        scope,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM categories
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    return rows[0] ?? null;
  },

  async findBySlug(slug: string): Promise<CategoryRow | null> {
    const [rows] = await db.query<CategoryRow[]>(
      `
      SELECT
        id,
        name,
        slug,
        description,
        scope,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM categories
      WHERE slug = ?
      LIMIT 1
      `,
      [slug],
    );

    return rows[0] ?? null;
  },

  async findOutlineItems(categoryId: string | number): Promise<CategoryOutlineItemRow[]> {
    const [rows] = await db.query<CategoryOutlineItemRow[]>(
      `
      SELECT
        id,
        category_id AS categoryId,
        parent_id AS parentId,
        title,
        sort_order AS sortOrder,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM category_outline_items
      WHERE category_id = ?
      ORDER BY sort_order ASC, id ASC
      `,
      [categoryId],
    );

    return rows;
  },

  async countOutlineItems(categoryId: string | number): Promise<number> {
    const [rows] = await db.query<CountRow[]>(
      `
      SELECT COUNT(*) AS total
      FROM category_outline_items
      WHERE category_id = ?
      `,
      [categoryId],
    );

    return rows[0]?.total ?? 0;
  },

  async countLectures(categoryId: string | number): Promise<number> {
    const [rows] = await db.query<CountRow[]>(
      `
      SELECT COUNT(*) AS total
      FROM lectures
      WHERE category_id = ?
      `,
      [categoryId],
    );

    return rows[0]?.total ?? 0;
  },

  async create(input: CreateCategoryInput): Promise<CategoryRow> {
    const [result] = await db.execute<ResultSetHeader>(
      `
      INSERT INTO categories (
        name,
        slug,
        description,
        scope,
        status
      )
      VALUES (?, ?, ?, ?, 'ACTIVE')
      `,
      [
        input.name,
        input.slug,
        input.description ?? null,
        input.scope,
      ],
    );

    const category = await this.findById(result.insertId);

    if (!category) {
      throw new Error("Category was created but could not be loaded.");
    }

    return category;
  },

  async update(input: UpdateCategoryInput): Promise<CategoryRow> {
    const existingSlug = await this.findBySlug(input.slug);

    if (existingSlug && String(existingSlug.id) !== String(input.id)) {
      throw new Error("Another category already uses this slug.");
    }

    const [result] = await db.execute<ResultSetHeader>(
      `
      UPDATE categories
      SET
        name = ?,
        slug = ?,
        description = ?,
        scope = ?
      WHERE id = ?
      `,
      [
        input.name,
        input.slug,
        input.description ?? null,
        input.scope,
        input.id,
      ],
    );

    if (result.affectedRows === 0) {
      throw new Error("Category was not found.");
    }

    const category = await this.findById(input.id);

    if (!category) {
      throw new Error("Category was updated but could not be loaded.");
    }

    return category;
  },

  async updateStatus(input: UpdateCategoryStatusInput): Promise<CategoryRow> {
    const [result] = await db.execute<ResultSetHeader>(
      `
      UPDATE categories
      SET status = ?
      WHERE id = ?
      `,
      [input.status, input.id],
    );

    if (result.affectedRows === 0) {
      throw new Error("Category was not found.");
    }

    const category = await this.findById(input.id);

    if (!category) {
      throw new Error("Category status was updated but could not be loaded.");
    }

    return category;
  },

  async deleteById(id: string | number): Promise<DeleteCategoryResult> {
    const [lectureRows] = await db.query<CountRow[]>(
      `
      SELECT COUNT(*) AS total
      FROM lectures
      WHERE category_id = ?
      `,
      [id],
    );

    const lectureCount = lectureRows[0]?.total ?? 0;

    if (lectureCount > 0) {
      return {
        id: String(id),
        success: false,
        message: "Category is used by lectures. Archive it instead.",
      };
    }

    const [result] = await db.execute<ResultSetHeader>(
      `
      DELETE FROM categories
      WHERE id = ?
      `,
      [id],
    );

    if (result.affectedRows === 0) {
      return {
        id: String(id),
        success: false,
        message: "Category was not found.",
      };
    }

    return {
      id: String(id),
      success: true,
      message: "Category deleted.",
    };
  },
};
