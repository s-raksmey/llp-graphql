export const categorySchema = `
    enum CategoryScope {
        COURSE
        LECTURE
        BOTH
    }
    
    enum CategoryStatus {
        ACTIVE
        ARCHIVED
    }

    type Category {
        id: ID!
        name: String!
        slug: String!
        description: String
        scope: CategoryScope!
        status: CategoryStatus!
        lectureCount: Int!
        outlineItemCount: Int!
        outlineItems: [CategoryOutlineItem!]!
        lectures: [Lecture!]!
        createdAt: String
        updatedAt: String
    }

    type CategoryOutlineItem {
        id: ID!
        categoryId: ID!
        parentId: ID
        title: String!
        sortOrder: Int!
        createdAt: String
        updatedAt: String
    }

    type DeleteCategoryPayload {
        id: ID!
        success: Boolean!
        message: String!
    }

    input CreateCategoryInput {
        name: String!
        slug: String!
        description: String
        scope: CategoryScope!
    }

    input UpdateCategoryInput {
        id: ID!
        name: String!
        slug: String!
        description: String
        scope: CategoryScope!
    }

    input UpdateCategoryStatusInput {
        id: ID!
        status: CategoryStatus!
    }

    extend type Query {
        categories(status: CategoryStatus, scope: CategoryScope): [Category!]!
        category(slug: String!): Category
    }

    extend type Mutation {
        createCategory(input: CreateCategoryInput!): Category!
        updateCategory(input: UpdateCategoryInput!): Category!
        updateCategoryStatus(input: UpdateCategoryStatusInput!): Category!
        deleteCategory(id: ID!): DeleteCategoryPayload!
    }
`
