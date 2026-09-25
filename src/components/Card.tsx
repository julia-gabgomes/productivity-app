import Link from "next/link";
import type { Task } from "../server/tasks/task.schema";
import { Box } from "./Box";
import { Pencil } from "./icons/Pencil";
import { Trash } from "./icons/Trash";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export const Card = ({
  task,
  onDelete,
  isDeleting = false,
}: {
  task: Task;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}) => {
  return (
    <Box className="cursor-pointer border-l-4 border-l-primary transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
      <article className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold text-gray-500">{task.titulo}</h2>
          <div className="flex shrink-0 gap-1">
            <Link
              href={`/tasks/${task.id}/edit`}
              aria-label="Editar tarefa"
              title="Editar"
              onClick={(event) => event.stopPropagation()}
              className="rounded-md p-1.5 text-gray-500 transition hover:bg-info/10 hover:text-info"
            >
              <Pencil className="size-4" />
            </Link>
            <button
              type="button"
              aria-label="Excluir tarefa"
              title="Excluir"
              disabled={isDeleting}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(task.id);
              }}
              className="cursor-pointer rounded-md p-1.5 text-gray-500 transition hover:bg-error/10 hover:text-error disabled:cursor-wait disabled:opacity-50"
            >
              <Trash className="size-4" />
            </button>
          </div>
        </div>
        {task.descricao && (
          <p className="text-sm text-gray-700">{task.descricao}</p>
        )}
        <time
          dateTime={task.dataCriacao.toISOString()}
          className="text-xs text-gray-500"
        >
          Criada em {dateFormatter.format(task.dataCriacao)}
        </time>
      </article>
    </Box>
  );
};
