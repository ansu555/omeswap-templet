"use client";

import { Ban, ExternalLink } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <main className="container mx-auto px-4 py-8 pt-32 flex justify-center">
        <div className="swap-card w-full max-w-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center">
            <Ban className="w-6 h-6 text-destructive" />
          </div>

          <h1 className="text-2xl font-semibold">Trade Page Disabled</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            In-app trading is temporarily disabled while router configuration is finalized.
            This route has been intentionally turned off.
          </p>

          <a
            href="https://hub.0g.ai/swap"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
          >
            Open 0G Hub Swap
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </main>
    </div>
  );
}
