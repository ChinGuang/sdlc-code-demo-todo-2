import { useEffect, useState } from "react";
import { getJson, sendJson } from "../api.js";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export function DeleteTodoScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const data = await getJson<Todo[]>("/todos");
        if (!cancelled) {
          setTodos(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setTodos([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTodos();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (todo: Todo) => {
    setDeleting(prev => new Set(prev).add(todo.id));
    try {
      await sendJson<void>("DELETE", `/todos/${todo.id}`);
      setTodos(prev => prev.filter(t => t.id !== todo.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      // Refetch to ensure consistency
      const data = await getJson<Todo[]>("/todos");
      setTodos(data);
    } finally {
      setDeleting(prev => {
        const copy = new Set(prev);
        copy.delete(todo.id);
        return copy;
      });
    }
  };

  if (loading) {
    return <p className="text-slate-400">Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-4xl font-semibold">Delete Todo</h1>
      {todos.length === 0 ? (
        <p className="text-slate-400">No todos yet</p>
      ) : (
        <ul className="divide-y">
          {todos.map((todo) => (
            <li key={todo.id} className="py-3 flex items-center space-x-3">
              <span className="w-1/2 break-all">{todo.title}</span>
              <span className="w-1/4 text-center">{todo.completed ? "Done" : "Pending"}</span>
              <button
                onClick={() => handleDelete(todo)}
                disabled={deleting.has(todo.id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {deleting.has(todo.id) ? "Deleting..." : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}