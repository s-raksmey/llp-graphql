import {
  GraphQLScalarType,
  Kind,
  buildSchema,
  graphql,
  type GraphQLResolveInfo,
} from "graphql";

import { categoryResolvers } from "@/modules/categories/category.resolver";
import { categorySchema } from "@/modules/categories/category.schema";
import { lectureResolvers } from "@/modules/lectures/lecture.resolver";
import { lectureSchema } from "@/modules/lectures/lecture.schema";

type GraphQLRequestInput = {
  query?: string;
  variables?: Record<string, unknown>;
  operationName?: string;
};

type NestedResolver = (
  source: unknown,
  args: Record<string, unknown>,
  context: unknown,
  info: GraphQLResolveInfo,
) => unknown;

type ResolverMap = Record<string, Record<string, NestedResolver>>;

const baseSchema = `
  type Query {
    health: Health!
  }

  type Mutation {
    _empty: String
  }

  type Health {
    ok: Boolean!
    service: String!
  }
`;

export const schema = buildSchema(`
  ${baseSchema}
  ${categorySchema}
  ${lectureSchema}
`);

const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return ast.value;
    if (ast.kind === Kind.INT) return Number(ast.value);
    if (ast.kind === Kind.FLOAT) return Number(ast.value);
    if (ast.kind === Kind.BOOLEAN) return ast.value;
    return null;
  },
});

const nestedResolvers: ResolverMap = {
  Category: {
    outlineItems: (source) =>
      categoryResolvers.Category.outlineItems(
        source as Parameters<typeof categoryResolvers.Category.outlineItems>[0],
      ),
    lectures: (source) =>
      categoryResolvers.Category.lectures(
        source as Parameters<typeof categoryResolvers.Category.lectures>[0],
      ),
  },
  Lecture: {
    category: (source) =>
      lectureResolvers.Lecture.category(
        source as Parameters<typeof lectureResolvers.Lecture.category>[0],
      ),
    outlineItems: (source) =>
      lectureResolvers.Lecture.outlineItems(
        source as Parameters<typeof lectureResolvers.Lecture.outlineItems>[0],
      ),
  },
};

export const rootValue = {
  JSON: JSONScalar,

  health: () => ({
    ok: true,
    service: "llp-graphql",
  }),

  categories: categoryResolvers.categories,
  category: categoryResolvers.category,
  createCategory: categoryResolvers.createCategory,

  lectures: lectureResolvers.lectures,
  lecture: lectureResolvers.lecture,
};

export async function executeGraphQLRequest(input: GraphQLRequestInput) {
  if (!input.query) {
    return {
      errors: [{ message: "GraphQL request body must include a query." }],
    };
  }

  return graphql({
    schema,
    source: input.query,
    rootValue,
    variableValues: input.variables,
    operationName: input.operationName,
    fieldResolver: async (source, args, context, info) => {
      const typeResolvers = nestedResolvers[info.parentType.name];
      const typeResolver = typeResolvers?.[info.fieldName];

      if (typeResolver) {
        return typeResolver(source, args, context, info);
      }

      if (source && typeof source === "object") {
        const value = (source as Record<string, unknown>)[info.fieldName];

        if (typeof value === "function") {
          if (info.parentType.name === "Query" || info.parentType.name === "Mutation") {
            return (value as (args: Record<string, unknown>) => unknown)(args);
          }

          return (value as NestedResolver)(source, args, context, info);
        }

        return value;
      }

      return null;
    },
  });
}
