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
  }
};
