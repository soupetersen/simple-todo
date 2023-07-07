import { v4 as uuid } from "uuid";
import { HttpNotFoundError } from "../infra/errors";

export const allTodos: Todo[] = [
  {
    id: uuid(),
    content: "Todo 1",
    date: new Date().toISOString(),
    done: false,
  },
  {
    id: uuid(),
    content: "Todo 2",
    date: new Date().toISOString(),
    done: false,
  },
].reverse();

interface TodoRepositoryGetParams {
  page?: number;
  limit?: number;
}

interface TodoRepositoryGetOutput {
  todos: Todo[];
  total: number;
  pages: number;
}

interface Todo {
  id: string;
  content: string;
  date: string;
  done: boolean;
}

async function get(
  { page, limit }: TodoRepositoryGetParams = {
    page: 1,
    limit: 5,
  },
): Promise<TodoRepositoryGetOutput> {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedTodos = allTodos.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allTodos.length / limit);

  return {
    total: allTodos.length,
    todos: paginatedTodos,
    pages: totalPages,
  };
}

async function createByContent(content: string): Promise<{ todo: Todo }> {
  const todo = {
    id: uuid(),
    content: content,
    date: new Date().toISOString(),
    done: false,
  };

  allTodos.push(todo);

  return { todo };
}

async function toggleDone(req: Request, id: string) {
  const todo = allTodos.find((todo) => todo.id === id);

  if (!todo) {
    throw new Error(`Todo id: ${id} not found`);
  }

  todo.done = !todo.done;

  return todo;
}

async function deleteById(id: string) {
  const todoIndex = allTodos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    throw new HttpNotFoundError(`Todo id: ${id} not found`);
  }

  const deletedTodo = allTodos.splice(todoIndex, 1);

  return deletedTodo[0];
}

export const todoRepository = {
  get,
  createByContent,
  toggleDone,
  deleteById,
};
