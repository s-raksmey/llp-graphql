export const lectureSchema = `
    scalar JSON

    enum LectureStatus {
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

    extend type Mutation {
        createLecture(input: CreateLectureInput!): Lecture!
    }

    extend type Query {
        lectures(status: LectureStatus, categoryId: ID): [Lecture!]!
        lecture(slug: String!): Lecture
    }
`