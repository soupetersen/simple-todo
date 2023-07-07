import { NextResponse } from "next/server";
import { todoRepository } from "../repository/todo";
import { z as schema } from "zod";
import { HttpNotFoundError } from "../infra/errors";

async function get(req: Request) {
  const url = new URL(req.url);
  const searchParams = new URLSearchParams(url.search);

  const p = searchParams.get("page");
  const l = searchParams.get("limit");

  const page = Number(p);
  const limit = Number(l);

  if (page && isNaN(page)) {
    return NextResponse.json({ error: "page is required" }, { status: 400 });
  }

  if (limit && isNaN(limit)) {
    return NextResponse.json({ error: "limit is required" }, { status: 400 });
  }

  const output = await todoRepository.get();
  return NextResponse.json(output, { status: 200 });
}

async function post() {
  return NextResponse.json({ todos: [] }, { status: 200 });
}

const TodoCreateBodySchema = schema.object({
  content: schema.string(),
});

async function create(req: Request) {
  const body = TodoCreateBodySchema.safeParse(req);

  if (body.success === false) {
    return NextResponse.json({ error: body.error }, { status: 400 });
  }

  const output = await todoRepository.createByContent(body.data.content);

  return NextResponse.json(output, { status: 201 });
}

async function toggleDone(req: Request, id: string) {
  try {
    const updatedTodo = await todoRepository.toggleDone(req, id);
    return NextResponse.json({ todo: updatedTodo }, { status: 200 });
  } catch (error) {
    if (error instanceof HttpNotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json({ error: error }, { status: 404 });
  }
}

async function deleteById(id: string) {
  const QueryParamsSchema = schema.object({
    id: schema.string().uuid().nonempty(),
  });

  const query = QueryParamsSchema.safeParse(id);

  if (query.success === false) {
    return NextResponse.json({ error: query.error }, { status: 400 });
  }

  const todoId = query.data.id;

  try {
    await todoRepository.deleteById(todoId);
    return NextResponse.json({ status: 204 });
  } catch (error) {
    if (error instanceof HttpNotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      {
        error: {
          message: `Internal server error: ${error.message}`,
        },
      },
      { status: 500 },
    );
  }
}

export const todoController = {
  get,
  create,
  toggleDone,
  post,
  deleteById,
};
