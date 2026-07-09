import { executeGraphQLRequest, formatGraphQLError } from "@/lib/graphql";

const allowedOrigins = new Set([
  process.env.LLP_WEB_ORIGIN ?? "http://localhost:3001",
  process.env.LLP_ADMIN_ORIGIN ?? "http://localhost:3000",
]);

const corsHeaders = (origin: string | null) => {
  const headers = new Headers({
    "Access-Control-Allow-Headers": "content-type, authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  });

  if (origin && allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }

  return headers;
};

const json = (body: unknown, status: number, origin: string | null) =>
  Response.json(body, {
    status,
    headers: corsHeaders(origin),
  });

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? undefined;
  const variablesParam = url.searchParams.get("variables");
  const operationName = url.searchParams.get("operationName") ?? undefined;

  let variables: Record<string, unknown> | undefined;

  if (variablesParam) {
    try {
      variables = JSON.parse(variablesParam) as Record<string, unknown>;
    } catch {
      return json(
        { errors: [{ message: "Variables must be valid JSON." }] },
        400,
        request.headers.get("origin"),
      );
    }
  }

  const result = await executeGraphQLRequest({ query, variables, operationName });

  return json(
    {
      ...result,
      errors: result.errors?.map(formatGraphQLError),
    },
    result.errors ? 400 : 200,
    request.headers.get("origin"),
  );
}

export async function POST(request: Request) {
  let body: {
    query?: string;
    variables?: Record<string, unknown>;
    operationName?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json(
      { errors: [{ message: "Request body must be valid JSON." }] },
      400,
      request.headers.get("origin"),
    );
  }

  const result = await executeGraphQLRequest(body);

  return json(
    {
      ...result,
      errors: result.errors?.map(formatGraphQLError),
    },
    result.errors ? 400 : 200,
    request.headers.get("origin"),
  );
}
