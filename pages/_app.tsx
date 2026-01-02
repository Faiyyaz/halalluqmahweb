import { AppWriteProvider } from "@/hooks/useAppWrite";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppWriteProvider>
      <Component {...pageProps} />
    </AppWriteProvider>
  );
}
