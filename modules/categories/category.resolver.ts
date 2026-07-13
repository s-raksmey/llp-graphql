import {
  categoryRepository,
  CreateCategoryInput,
  type CategoryFilters,
  type CategoryRow,
  type UpdateCategoryInput,
  type UpdateCategoryStatusInput,
} from "./category.repository";
import { lectureRepository } from "../lectures/lecture.repository";

type CategorySource = Pick<CategoryRow, "id">;

export const categoryResolvers = {
  categories: (args: CategoryFilters) => {
    return categoryRepository.findAll(args);
  },

  category: (args: { slug: string }) => {
    return categoryRepository.findBySlug(args.slug);
  },

  createCategory: (args: { input: CreateCategoryInput }) => {
    return categoryRepository.create(args.input);
  },

  updateCategory: (args: { input: UpdateCategoryInput }) => {
    return categoryRepository.update(args.input);
  },

  updateCategoryStatus: (args: { input: UpdateCategoryStatusInput }) => {
    return categoryRepository.updateStatus(args.input);
  },

  deleteCategory: (args: { id: string }) => {
    return categoryRepository.deleteById(args.id);
  },

  Category: {
    lectureCount: (category: CategorySource) => {
      return categoryRepository.countLectures(category.id);
    },

    outlineItemCount: (category: CategorySource) => {
      return categoryRepository.countOutlineItems(category.id);
    },

    outlineItems: (category: CategorySource) => {
      return categoryRepository.findOutlineItems(category.id);
    },

    lectures: (category: CategorySource) => {
      return lectureRepository.findAll({ categoryId: category.id });
    },
  },
};
