import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, trpc } from "../../trpc/server";
import { TaskList } from "./task-list";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery(
    trpc.tasks.list.infiniteQueryOptions(
      {},
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    ),
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TaskList />
      </HydrationBoundary>
    </main>
  );
}
