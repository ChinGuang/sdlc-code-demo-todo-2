import { Link } from "react-router-dom";

/** Placeholder for the todo list screen (Walking Skeleton). */
export function TodoListScreen() {
  return (
    <section className="space-y-4">
      <h1 className="text-4xl font-semibold">Todo List</h1>
      <p className="text-slate-400">No todos yet.</p>
      <Link to="/health" className="underline">
        Check API health
      </Link>
    </section>
  );
}