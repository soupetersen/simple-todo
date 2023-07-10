import { Todo, TodoSchema } from "../schema/todo";
import { z as schema } from "zod";

interface TodoRepositoryGetParams {
  page?: number;
  limit?: number;
}

interface TodoRepositoryGetOutput {
  todos: Todo[];
  total: number;
  pages: number;
}

async function get({
  page,
  limit,
}: TodoRepositoryGetParams): Promise<TodoRepositoryGetOutput> {
  const response = await fetch(`/api/todos?page=${page}&limit=${limit}`).then(
    async (res) => parseTodosFromServer(await res.json()),
  );

  return {
    todos: response.todos,
    total: response.total,
    pages: response.pages,
  };
}

function parseTodosFromServer(responseBody: unknown): {
  total: number;
  pages: number;
  todos: Todo[];
} {
  if (
    responseBody !== null &&
    typeof responseBody === "object" &&
    "todos" in responseBody &&
    "total" in responseBody &&
    "pages" in responseBody &&
    Array.isArray(responseBody.todos)
  ) {
    return {
      total: Number(responseBody.total),
      pages: Number(responseBody.pages),
      todos: responseBody.todos.map((todo: unknown) => {
        if (todo === null || typeof todo !== "object") {
          throw new Error("Invalid todo from api");
        }

        const { id, content, date, done } = todo as {
          id: string;
          content: string;
          date: string;
          done: boolean;
        };

        return {
          id,
          content,
          date: date,
          done,
        };
      }),
    };
  }
}

async function createByContent(content: string): Promise<Todo> {
  return fetch("/api/todos", {
    method: "POST",
    body: JSON.stringify({ content }),
    headers: {
      "Content-Type": "application/json",
    },
  }).then(async (res) => {
    const responseBody = await res.json();

    if (res.ok) {
      const ServerResponseSchema = schema.object({
        todo: TodoSchema,
      });

      const serverResponseParsed = ServerResponseSchema.safeParse(responseBody);

      if (serverResponseParsed.success === false) {
        throw new Error(serverResponseParsed.error.message);
      }

      return serverResponseParsed.data.todo;
    }
    throw new Error(responseBody.error);
  });
}

async function toggleDone(id: string): Promise<Todo> {
  return fetch(`/api/todos/${id}/toggle-done`, {
    method: "PUT",
  }).then(async (res) => {
    const responseBody = await res.json();

    if (res.ok) {
      const ServerResponseSchema = schema.object({
        todo: TodoSchema,
      });

      const serverResponseParsed = ServerResponseSchema.safeParse(responseBody);

      if (serverResponseParsed.success === false) {
        throw new Error(serverResponseParsed.error.message);
      }

      return serverResponseParsed.data.todo;
    }

    throw new Error(responseBody.error);
  });
}

async function deleteById(id: string): Promise<void> {
  return fetch(`/api/todos/${id}`, {
    method: "DELETE",
  }).then(async (res) => {
    const responseBody = await res.json();

    if (res.ok) {
      return;
    }

    throw new Error(responseBody.error);
  });
}

export const todoRepository = {
  get,
  toggleDone,
  createByContent,
  deleteById,
};
