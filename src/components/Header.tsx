import Link from "next/link";
import { Logo } from "./icons/Logo";
import { Plus } from "./icons/Plus";

export const Header = () => {
  return (
    <header className="bg-secondary text-secondary-foreground">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
        <Logo className="size-8 text-primary" />
        <h1 className="text-xl font-bold">Productivity App</h1>
        <Link
          href="/tasks/new"
          className="ml-auto flex cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          <Plus className="size-3.5" />
          Criar nova tarefa
        </Link>
      </div>
    </header>
  );
};
