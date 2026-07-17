import { categoryRepository } from "../categories/category.repository";
import {
  lectureRepository,
  type LectureFilters,
  type LectureRow,
  type CreateLectureInput,
  type LectureContentRow,
  type SaveLectureContentInput,
  type UpdateLectureStatusInput,
} from "./lecture.repository";

type LectureSource = Pick<LectureRow, "id" | "categoryId">;
type LectureOutlineItemSource = {
  id: string | number;
};

function toLectureContent(content: LectureContentRow | null) {
  if (!content) {
    return null;
  }

  return {
    id: String(content.id),
    lectureId: String(content.lectureId),
    outlineItemId: String(content.outlineItemId),
    content: content.content,
    status: content.status,
    createdAt: content.createdAt,
    updatedAt: content.updatedAt,
  };
}

export const lectureResolvers = {
  lectures: (args: LectureFilters) => {
    return lectureRepository.findAll(args);
  },

  lecture: (args: { slug: string }) => {
    return lectureRepository.findBySlug(args.slug);
  },

  createLecture: (args: { input: CreateLectureInput }) => {
    return lectureRepository.create(args.input);
  },

  saveLectureContent: async (args: { input: SaveLectureContentInput }) => {
    const content = await lectureRepository.saveContent(args.input);
    return toLectureContent(content);
  },

  updateLectureStatus: (args: { input: UpdateLectureStatusInput }) => {
    return lectureRepository.updateStatus(args.input);
  },

  deleteLecture: (args: { id: string }) => {
    return lectureRepository.deleteById(args.id);
  },

  Lecture: {
    category: (lecture: LectureSource) => {
      if (!lecture.categoryId) {
        return null;
      }

      return categoryRepository.findById(lecture.categoryId);
    },

    outlineItems: (lecture: LectureSource) => {
      return lectureRepository.findOutlineItems(lecture.id);
    },
  },

  LectureOutlineItem: {
    content: async (outlineItem: LectureOutlineItemSource) => {
      const content = await lectureRepository.findContentByOutlineItem(
        outlineItem.id,
      );
      return toLectureContent(content);
    },
  },
};
