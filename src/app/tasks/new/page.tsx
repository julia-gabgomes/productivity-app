import { Box } from "../../../components/Box";
import { TaskForm } from "../../../components/TaskForm";

export default function NewTaskPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h2 className="mb-4 text-lg font-bold text-gray-700">Nova tarefa</h2>
      <Box>
        <TaskForm />
      </Box>
    </main>
  );
}
