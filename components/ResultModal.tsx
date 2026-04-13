"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

interface ResultModalProps {
  open: boolean;
  onClose: () => void;
  won: boolean;
  amount: number;
  pnl: number;
  marketQuestion: string;
  betAmount: number;
  side: "YES" | "NO";
}

function ResultContent({
  won,
  amount,
  pnl,
  marketQuestion,
  betAmount,
  side,
  onClose,
}: Omit<ResultModalProps, "open">) {
  const returnPct =
    betAmount > 0 ? Math.round(((amount - betAmount) / betAmount) * 100) : 0;

  return (
    <div className="flex flex-col items-center text-center px-2 py-4">
      {/* Icon */}
      <div
        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
          won ? "bg-green/15" : "bg-red/15"
        }`}
      >
        {won ? (
          <svg
            viewBox="0 0 24 24"
            className="h-9 w-9 text-green"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="h-9 w-9 text-red"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        )}
      </div>

      {/* Main amount */}
      <h2
        className={`text-3xl font-black tabular-nums mb-1 ${won ? "text-green" : "text-red"}`}
      >
        {won ? "You won" : "You lost"} ${Math.abs(pnl).toFixed(2)}
      </h2>

      {/* Subtitle */}
      <p className="text-sm text-muted mb-6">
        {won
          ? "Great job predicting the future on Cosmic Forecast!"
          : "The cosmos ruled against you. Better luck next time."}
      </p>

      {/* Market details */}
      <div className="w-full rounded-lg bg-gray-50 p-3 text-left mb-6">
        <p className="text-sm font-medium text-foreground line-clamp-2 mb-1.5">
          {marketQuestion}
        </p>
        <p className="text-xs text-muted tabular-nums">
          Bet ${betAmount.toFixed(2)} on {side}
          {won ? (
            <span className="text-green">
              {" "}
              · Won ${amount.toFixed(2)} (+{returnPct}%)
            </span>
          ) : (
            <span className="text-red"> · Lost ${betAmount.toFixed(2)}</span>
          )}
        </p>
      </div>

      {/* CTA button */}
      <button
        type="button"
        onClick={onClose}
        className={`w-full rounded-xl py-3.5 text-sm font-bold text-white transition-colors active:scale-[0.98] ${
          won
            ? "bg-green hover:bg-green/90"
            : "bg-foreground hover:bg-foreground/90"
        }`}
      >
        {won ? "Claim proceeds" : "Back to markets"}
      </button>
    </div>
  );
}

export function ResultModal({
  open,
  onClose,
  won,
  amount,
  pnl,
  marketQuestion,
  betAmount,
  side,
}: ResultModalProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent showCloseButton>
          <DialogHeader className="sr-only">
            <DialogTitle>{won ? "You won!" : "Market resolved"}</DialogTitle>
            <DialogDescription>Bet result</DialogDescription>
          </DialogHeader>
          <ResultContent
            won={won}
            amount={amount}
            pnl={pnl}
            marketQuestion={marketQuestion}
            betAmount={betAmount}
            side={side}
            onClose={onClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader className="sr-only">
          <DrawerTitle>{won ? "You won!" : "Market resolved"}</DrawerTitle>
          <DrawerDescription>Bet result</DrawerDescription>
        </DrawerHeader>
        <ResultContent
          won={won}
          amount={amount}
          pnl={pnl}
          marketQuestion={marketQuestion}
          betAmount={betAmount}
          side={side}
          onClose={onClose}
        />
        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  );
}
