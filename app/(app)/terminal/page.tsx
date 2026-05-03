"use client";

import { TerminalShell } from "@/components/terminal/TerminalShell";

export default function TerminalPage() {
  return (
    <div className="relative z-10 h-[calc(100vh-72px)] pt-20">
      <TerminalShell />
    </div>
  );
}
