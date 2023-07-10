import { z as schema } from "zod";
import { todoRepository } from "../repository/todo";
import { Todo } from "../schema/todo";

interface TodoControllerGetParams {
  page?: number;
  limit?: number;
}

interface TodoControllerCreateParams {
  content?: string;
}

async function get({ page, limit = 3 }: TodoControllerGetParams = {}) {
  return todoRepository.get({ page: page ?? 1, limit });
}

function filterTodosByContent(todos: Todo[], search: string): Todo[] {
  return todos.filter((todo) =>
    todo.content.toLowerCase().includes(search.toLowerCase()),
  );
}

async function create({ content }: TodoControllerCreateParams) {
  const parsedParams = schema.string().nonempty().safeParse(content);

  if (parsedParams.success === false) {
    throw new Error(parsedParams.error.message);
  }

  return todoRepository.createByContent(parsedParams.data);
}

async function toggleDone(id: string) {
  const parsedParams = schema.string().nonempty().safeParse(id);

  if (parsedParams.success === false) {
    throw new Error(parsedParams.error.message);
  }

  try {
    return todoRepository.toggleDone(parsedParams.data);
  } catch (error) {
    throw new Error(error.message);
  }
}

async function deleteById(id: string) {
  const parsedParams = schema.string().nonempty().safeParse(id);

  if (parsedParams.success === false) {
    throw new Error(parsedParams.error.message);
  }

  try {
    return todoRepository.deleteById(parsedParams.data);
  } catch (error) {
    throw new Error(error.message);
  }
}

export const todoController = {
  get,
  create,
  toggleDone,
  filterTodosByContent,
  deleteById,
};
