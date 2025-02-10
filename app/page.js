"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const getTodos = async () => {
  return JSON.parse(localStorage.getItem("todos")) || [];
};

const setTodos = (todos) => {
  localStorage.setItem("todos", JSON.stringify(todos));
};

export default function TodoList() {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");

  const { data: todos = [] } = useQuery({
    queryKey: ["todos"],
    queryFn: getTodos,
  });

  const addTodoMutation = useMutation({
    mutationFn: (newTodo) => {
      const updatedTodos = [...todos, newTodo];
      setTodos(updatedTodos);
      return updatedTodos;
    },
    onSuccess: (newTodos) => {
      queryClient.setQueryData(["todos"], newTodos);
      setInput("");
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: (id) => {
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
      return updatedTodos;
    },
    onSuccess: (newTodos) => {
      queryClient.setQueryData(["todos"], newTodos);
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, newText }) => {
      const updatedTodos = todos.map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      );
      setTodos(updatedTodos);
      return updatedTodos;
    },
    onSuccess: (newTodos) => {
      queryClient.setQueryData(["todos"], newTodos);
    },
  });

  const addTodo = () => {
    if (input.trim()) {
      addTodoMutation.mutate({ id: Date.now(), text: input });
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Todo Here</h1>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border p-2 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2" onClick={addTodo}>
          Add
        </button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex justify-between items-center p-2 border-b"
          >
            <input
              type="text"
              value={todo.text}
              onChange={(e) =>
                updateTodoMutation.mutate({ id: todo.id, newText: e.target.value })
              }
              className="flex-1 border-none focus:outline-none"
            />
            <button
              className="text-red-500"
              onClick={() => deleteTodoMutation.mutate(todo.id)}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
