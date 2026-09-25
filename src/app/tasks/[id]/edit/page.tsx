import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";
import { Box } from "../../../../components/Box";
import { TaskForm } from "../../../../components/TaskForm";
import { getQueryClient, trpc } from "../../../../trpc/server";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const task = await getQueryClient()
    .fetchQuery(trpc.tasks.byId.queryOptions({ id }))
    .catch((error) => {
      // Tarefa inexistente ou id inválido (não é UUID): exibe a página 404.
      if (
        error instanceof TRPCError &&
        (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")
      ) {
        notFound();
      }
      throw error;
    });

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h2 className="mb-4 text-lg font-bold text-gray-700">Editar tarefa</h2>
      <Box>
        <TaskForm task={task} />
      </Box>
    </main>
  );
}
