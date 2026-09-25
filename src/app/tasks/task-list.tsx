"use client";
import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Card } from "../../components/Card";
import { useToast } from "../../components/Toast";
import { useTRPC } from "../../trpc/client";

export const TaskList = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const showToast = useToast();
  // Os dados já chegam hidratados do prefetch feito no servidor (page.tsx).
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useSuspenseInfiniteQuery(
    trpc.tasks.list.infiniteQueryOptions(
      {},
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );
  const tasks = data.pages.flatMap((page) => page.items);

  // Infinite scroll: ao aproximar o sentinela do fim da lista, carrega a próxima página.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (
      !sentinel ||
      !hasNextPage ||
      isFetchingNextPage ||
      isFetchNextPageError
    ) {
      return;
    }
    // Recriado a cada página carregada: se o sentinela continuar visível (tela alta),
    // o observer novo dispara de imediato e busca a página seguinte.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const deleteTask = useMutation(
    trpc.tasks.delete.mutationOptions({
      onSuccess: () => {
        showToast({
          status: "success",
          message: "Tarefa excluída com sucesso.",
        });
      },
      onError: (error) => {
        showToast({
          status: "error",
          message:
            error.data?.code === "NOT_FOUND"
              ? "Esta tarefa não existe mais."
              : "Não foi possível excluir a tarefa. Tente novamente.",
        });
      },
      // Em ambos os casos a lista é recarregada para refletir o estado do servidor.
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: trpc.tasks.list.pathKey() }),
    }),
  );

  if (tasks.length === 0) {
    return (
      <p className="text-center text-gray-500">Nenhuma tarefa cadastrada.</p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {tasks.map((task) => (
          <li key={task.id}>
            <Card
              task={task}
              onDelete={(id) => deleteTask.mutate({ id })}
              isDeleting={
                deleteTask.isPending && deleteTask.variables?.id === task.id
              }
            />
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} className="py-6 text-center text-sm text-gray-500">
        {isFetchingNextPage ? (
          <p role="status">Carregando mais tarefas...</p>
        ) : isFetchNextPageError ? (
          <p role="alert" className="text-error">
            Não foi possível carregar mais tarefas.{" "}
            <button
              type="button"
              onClick={() => fetchNextPage()}
              className="cursor-pointer font-semibold underline"
            >
              Tentar novamente
            </button>
          </p>
        ) : (
          !hasNextPage && <p>Não existem mais tarefas.</p>
        )}
      </div>
    </>
  );
};
