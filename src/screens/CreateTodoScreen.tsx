import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTodo } from "../api";

export function CreateTodoScreen() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createTodo(title);
      // After successful creation, go back to the list
      navigate("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-4xl font-semibold">Create Todo</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Todo title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-40 px-4 py-2 bg-blue-600 text-white rounded"
        >
          {loading ? "Saving…" : "Save"}
        </button>
        {error && <p className="text-red-500" role="alert">{error}</p>}
      </form>
    </section>
  );
}