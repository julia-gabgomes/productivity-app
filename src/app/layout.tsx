import { Header } from "../components/Header";
import { ToastProvider } from "../components/Toast";
import "../input.css";
import { TRPCReactProvider } from "../trpc/client";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <TRPCReactProvider>
          <ToastProvider>
            <Header />
            {children}
          </ToastProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
