/* eslint-disable react/react-in-jsx-scope */
"use client";

import { useEffect, useRef, useState } from "react";
import { GlobalStyles } from "./ui/theme/GlobalStyles";
import { todoController } from "./ui/controller/todo";
import { Todo } from "./ui/schema/todo";

const bg = "/bg.jpeg"; // inside public folder

export default function Home() {
  const initialLoadCompleted = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [search, setSearch] = useState("");
  const [newTodoContent, setNewTodoContent] = useState<string>("");

  const homeTodos = todoController.filterTodosByContent(todos, search);
  const hasNoTodos = homeTodos.length === 0 && !isLoading;
  const hasMorePages = page < totalPages;

  useEffect(() => {
    if (!initialLoadCompleted.current) {
      loadTodos();
    }
  }, []);

  function loadTodos() {
    todoController
      .get()
      .then(({ todos, pages }) => {
        setTodos(todos);
        setTotalPages(pages);
      })
      .finally(() => {
        setIsLoading(false);
        initialLoadCompleted.current = true;
      });
  }

  function loadMore(_page = 1) {
    setIsLoading(true);
    todoController
      .get({ page: _page })
      .then(({ todos, pages }) => {
        setTodos((prevTodos) => [...prevTodos, ...todos]);
        setTotalPages(pages);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    const content = event.target.value;
    setSearch(content);
  }

  function handleNewTodo(event: React.ChangeEvent<HTMLInputElement>) {
    const content = event.target.value;
    setNewTodoContent(content);
  }

  function handleCreateNewTodo() {
    const content = newTodoContent;

    todoController.create({ content }).then((todo) => {
      setTodos((prevTodos) => [todo, ...prevTodos]);
    });

    setNewTodoContent("");
  }

  function handleToggle(id: string) {
    todoController.toggleDone(id);
    setTodos((prevTodos) => {
      return prevTodos.map((todo) => {
        if (todo.id === id) {
          return {
            ...todo,
            done: !todo.done,
          };
        }

        return todo;
      });
    });
  }

  function handleDeleteById(id: string) {
    todoController.deleteById(id);
    setTodos((prevTodos) => {
      return prevTodos.filter((todo) => todo.id !== id);
    });
  }

  return (
    <main>
      <GlobalStyles themeName="indigo" />
      <header
        style={{
          backgroundImage: `url('${bg}')`,
        }}
      >
        <div className="typewriter">
          <h1>O que fazer hoje?</h1>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleCreateNewTodo();
          }}
        >
          <input
            name="add-todo"
            type="text"
            placeholder="Correr, Estudar..."
            onChange={handleNewTodo}
            value={newTodoContent}
          />
          <button type="submit" aria-label="Adicionar novo item">
            +
          </button>
        </form>
      </header>

      <section>
        <form>
          <input
            type="text"
            placeholder="Filtrar lista atual, ex: Dentista"
            onChange={handleSearch}
          />
        </form>

        <table border={1}>
          <thead>
            <tr>
              <th align="left">
                <input type="checkbox" disabled />
              </th>
              <th align="left">Id</th>
              <th align="left">Conteúdo</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {homeTodos.map((todo) => (
              <tr key={todo.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => handleToggle(todo.id)}
                  />
                </td>
                <td>{todo.id.substring(0, 4)}</td>
                <td>
                  {!todo.done && todo.content}
                  {todo.done && <s>todo.content</s>}
                </td>
                <td align="right">
                  <button
                    data-type="delete"
                    onClick={() => handleDeleteById(todo.id)}
                  >
                    Apagar
                  </button>
                </td>
              </tr>
            ))}

            {isLoading && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: "center" }}>
                  Carregando...
                </td>
              </tr>
            )}

            {hasNoTodos && (
              <tr>
                <td colSpan={4} align="center">
                  Nenhum item encontrado
                </td>
              </tr>
            )}

            {hasMorePages && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: "center" }}>
                  <button
                    data-type="load-more"
                    onClick={() => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      loadMore(nextPage);
                    }}
                  >
                    Página: {page} Carregar mais{" "}
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: "4px",
                        fontSize: "1.2em",
                      }}
                    >
                      ↓
                    </span>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
