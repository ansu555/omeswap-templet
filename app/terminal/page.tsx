import { Header } from "./_components/Header";
import { TokenList } from "./_components/TokenList";
import { Chart } from "./_components/Chart";
import { OrderBook } from "./_components/OrderBook";
import { TradePanel } from "./_components/TradePanel";
import { Footer } from "./_components/Footer";

export default function TerminalPage() {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Header />
      <main className="flex-1 flex min-h-0">
        <TokenList />
        <Chart />
        <OrderBook />
        <TradePanel />
      </main>
      <Footer />
    </div>
  );
}
