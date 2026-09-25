"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { createTaskInput, type Task } from "../server/tasks/task.schema";
import { useTRPC } from "../trpc/client";
import { useToast } from "./Toast";

type FieldErrors = { titulo?: string[]; descricao?: string[] };

// Sem `task`, o formulário cadastra uma nova tarefa; com `task`, edita a existente.
export const TaskForm = ({ task }: { task?: Task }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const showToast = useToast();
  const isEditing = task !== undefined;

  const [titulo, setTitulo] = useState(task?.titulo ?? "");
  const [descricao, setDescricao] = useState(task?.descricao ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const mutationCallbacks = {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trpc.tasks.pathKey() });
      showToast({
        status: "success",
        message: isEditing
          ? "Tarefa atualizada com sucesso."
          : "Tarefa criada com sucesso.",
      });
      router.push("/tasks");
    },
    onError: (error: { data?: { code?: string } | null }) => {
      showToast({
        status: "error",
        message:
          error.data?.code === "NOT_FOUND"
            ? "Esta tarefa não existe mais."
            : "Não foi possível salvar a tarefa. Tente novamente.",
      });
    },
  };
  const createTask = useMutation(
    trpc.tasks.create.mutationOptions(mutationCallbacks),
  );
  const updateTask = useMutation(
    trpc.tasks.update.mutationOptions(mutationCallbacks),
  );
  const isPending = createTask.isPending || updateTask.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Mesmo schema Zod usado pelo backend: bloqueia o envio sem título.
    const result = createTaskInput.safeParse({ titulo, descricao });
    if (!result.success) {
      setFieldErrors(z.flattenError(result.error).fieldErrors);
      return;
    }
    setFieldErrors({});

    if (isEditing) {
      updateTask.mutate({ id: task.id, ...result.data });
    } else {
      createTask.mutate(result.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="titulo" className="text-sm font-semibold text-gray-700">
          Título <span className="text-error">*</span>
        </label>
        <input
          id="titulo"
          value={titulo}
          onChange={(event) => {
            setTitulo(event.target.value);
            setFieldErrors((errors) => ({ ...errors, titulo: undefined }));
          }}
          aria-invalid={!!fieldErrors.titulo}
          aria-describedby={fieldErrors.titulo ? "titulo-error" : undefined}
          className="rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 aria-invalid:border-error aria-invalid:ring-error/30"
        />
        {fieldErrors.titulo && (
          <p id="titulo-error" className="text-sm text-error">
            {fieldErrors.titulo[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="descricao"
          className="text-sm font-semibold text-gray-700"
        >
          Descrição
        </label>
        <textarea
          id="descricao"
          rows={4}
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          className="resize-y rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Link
          href="/tasks"
          className="rounded-md px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
        >
          {isPending
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Criar tarefa"}
        </button>
      </div>
    </form>
  );
};
