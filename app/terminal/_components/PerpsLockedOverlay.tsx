"use client";

import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";

interface PerpsLockedOverlayProps {
  /** Deep-link to the external DEX (e.g. GMX trade page for this market) */
  externalUrl?: string;
  /** DEX name shown in the "Open on …" button label */
  dex?: string;
}

/**
 * Full-panel blur overlay for perp markets.
 * Render this as a sibling inside a `relative` parent — it uses `absolute inset-0`
 * so the underlying chart / depth / trade-history content remains visible behind
 * the backdrop blur.
 */
export function PerpsLockedOverlay({ externalUrl, dex = "GMX" }: PerpsLockedOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-md bg-background/60">
      <div className="flex flex-col items-center gap-3 text-center px-6 py-5 rounded-2xl border border-border/60 bg-card/80 shadow-2xl max-w-[240px]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <Clock size={10} />
          Perps · Coming Soon
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Direct perp execution is in development. Trade on {dex} while we build.
        </p>
        {externalUrl && (
          <Link
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-panel px-4 py-2 text-xs font-medium text-foreground hover:bg-panel-hover hover:border-border/70 transition-colors"
          >
            Open on {dex}
            <ExternalLink size={10} />
          </Link>
        )}
      </div>
    </div>
  );
}
