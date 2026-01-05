import { AppWriteProvider } from "@/hooks/useAppWrite";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Noto_Sans } from "next/font/google";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${notoSans.variable} font-sans antialiased`}>
      <AppWriteProvider>
        <Component {...pageProps} />
      </AppWriteProvider>
    </div>
  );
}
