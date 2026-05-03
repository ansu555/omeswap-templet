import type { Metadata } from "next";
import "./terminal.css";

export const metadata: Metadata = {
  title: "Perps · Phantom-style Trading",
  description:
    "Trade perpetual futures with up to 50x leverage on a sleek Phantom-inspired interface.",
};

export default function TerminalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="terminal-page">{children}</div>;
}
