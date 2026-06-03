import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BrowserAI — Sign In",
  description: "Sign in or create your BrowserAI account to start automating your browser with AI voice control.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
