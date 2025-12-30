import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "https://bioverityai.com",
  "https://www.bioverityai.com",
  "http://localhost:3000",
];

function getAllowedOrigin(req?: Request) {
  const origin = req?.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  return "https://bioverityai.com";
}

export function withCors(data: any, status = 200, req?: Request) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": getAllowedOrigin(req),
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export function corsOptions(req?: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": getAllowedOrigin(req),
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
