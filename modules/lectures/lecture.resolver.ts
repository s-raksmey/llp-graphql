import { categoryRepository } from "../categories/category.repository";
import {
  lectureRepository,
  type LectureFilters,
  type LectureRow,
  type CreateLectureInput,
} from "./lecture.repository";

type LectureSource = Pick<LectureRow, "id" | "categoryId">;

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
};
