import { useEffect, useState } from "react";
import { getJson, sendJson } from "../api.js";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

interface Props {
  heading?: string;
  showAddForm?: boolean;
}

export function TodoListScreen({ heading = "Todo App", showAddForm = true }: Props) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<Set<string>>(new Set());

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

  const handleToggle = async (todo: Todo) => {
    setToggling(prev => new Set(prev).add(todo.id));
    try {
      const updated = await sendJson<Todo>("PATCH", `/todos/${todo.id}`, {
        completed: !todo.completed,
      });
      setTodos(prev =>
        prev.map(t => (t.id === todo.id ? updated : t))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      const data = await getJson<Todo[]>("/todos");
      setTodos(data);
    } finally {
      setToggling(prev => {
        const copy = new Set(prev);
        copy.delete(todo.id);
        return copy;
      });
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-4xl font-semibold">{heading}</h1>
      {showAddForm && (
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="New todo title"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Add
          </button>
        </div>
      )}
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        todos.length === 0 ? (
          <p className="text-slate-400">No todos yet</p>
        ) : (
          <ul className="divide-y">
            {todos.map((todo) => (
              <li key={todo.id} className="py-3 flex items-center space-x-3">
                <span className="w-1/2 break-all">{todo.title}</span>
                <span className="w-1/4 text-center" data-testid="todo-status">{todo.completed ? "Done" : "Pending"}</span>
                <button
                  onClick={() => handleToggle(todo)}
                  disabled={toggling.has(todo.id)}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  {toggling.has(todo.id) ? "Toggling..." : "Toggle"}
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  );
}