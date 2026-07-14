export const lectureSchema = `
    scalar JSON

    enum LectureStatus {
        DRAFT
        PUBLISHED
        ARCHIVED
    }

    enum LectureContentStatus {
        DRAFT
        PUBLISHED
        ARCHIVED
    }

    type Lecture {
        id: ID!
        categoryId: ID
        category: Category
        title: String!
        slug: String!
        description: String
        content: JSON
        status: LectureStatus!
        readingTime: String
        publishedAt: String
        outlineItems: [LectureOutlineItem!]!
        createdAt: String 
        updatedAt: String
    }

    type LectureOutlineItem {
        id: ID!
        lectureId: ID!
        parentId: ID
        title: String!
        sortOrder: Int!
        content: LectureContent
        createdAt: String
        updatedAt: String
    }

    type LectureContent {
        id: ID!
        lectureId: ID!
        outlineItemId: ID!
        content: JSON
        status: LectureContentStatus!
        createdAt: String
        updatedAt: String
    }

    input CreateLectureInput {
        categoryId: ID
        title: String!
        slug: String!
        description: String
        readingTime: String
        outlineItems: [CreateLectureOutlineItemInput!]!
    }

    input CreateLectureOutlineItemInput {
        title: String!
        children: [String!]!
    }

    input SaveLectureContentInput {
        lectureId: ID!
        outlineItemId: ID!
        content: JSON!
        status: LectureContentStatus = DRAFT
    }

    input UpdateLectureStatusInput {
        id: ID!
        status: LectureStatus!
    }

    extend type Mutation {
        createLecture(input: CreateLectureInput!): Lecture!
        saveLectureContent(input: SaveLectureContentInput!): LectureContent!
        updateLectureStatus(input: UpdateLectureStatusInput!): Lecture!
    }

    extend type Query {
        lectures(status: LectureStatus, categoryId: ID): [Lecture!]!
        lecture(slug: String!): Lecture
    }
`
