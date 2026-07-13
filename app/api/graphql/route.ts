import { executeGraphQLRequest } from "@/lib/graphql";

const allowedOrigins = new Set([
  process.env.LLP_WEB_ORIGIN ?? "http://localhost:3001",
  process.env.LLP_ADMIN_ORIGIN ?? "http://localhost:3000",
]);

function corsHeaders(origin: string | null) {
  const headers = new Headers({
    "Access-Control-Allow-Headers": "content-type, authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });

  if (origin && allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }

  return headers;
}

function json(body: unknown, status: number, origin: string | null) {
  return Response.json(body, {
    status,
    headers: corsHeaders(origin),
  });
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: Request) {
  let body: {
    query?: string;
    variables?: Record<string, unknown>;
    operationName?: string;
  };

  try {
    body = await request.json();
  } catch {
    return json(
      { errors: [{ message: "Request body must be valid JSON." }] },
      400,
      request.headers.get("origin"),
    );
  }

  const result = await executeGraphQLRequest(body);

  return json(result, result.errors ? 400 : 200, request.headers.get("origin"));
}