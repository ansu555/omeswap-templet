import Image from "next/image";
import { Search, ChevronDown } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center gap-6 px-4 h-14 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-2 rounded-full bg-background/5 border border-border backdrop-blur-lg shadow-lg pl-1.5 pr-3 py-1">
        <Image
          src="/logo.png"
          alt="Omeswap"
          width={28}
          height={28}
          className="flex-shrink-0 rounded-full"
          priority
        />
        <span className="text-sm font-semibold text-foreground tracking-tight">Omeswap</span>
      </div>
      <nav className="flex items-center gap-5 text-sm font-medium">
        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          Explore <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button className="text-foreground border-b-2 border-primary pb-[18px] -mb-[18px]">Trade</button>
        <button className="text-muted-foreground hover:text-foreground">Agents</button>
        <button className="text-muted-foreground hover:text-foreground">Portfolio</button>
      </nav>
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search coins, perps, wallets"
            className="w-full bg-panel border border-border rounded-full pl-9 pr-10 h-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">/</span>
        </div>
      </div>
      <button className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary px-4 h-9 rounded-full text-sm font-medium border border-primary/30 shadow-[0_0_24px_-6px_hsl(var(--primary)/0.5)]">
        <span className="h-2 w-2 rounded-full bg-primary" /> Connect Wallet
      </button>
    </header>
  );
}
