"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

// Apple Pay JS types (only available in Safari)
interface ApplePaySessionConstructor {
  new (version: number, request: unknown): ApplePaySessionInstance;
  canMakePayments(): boolean;
}
interface ApplePaySessionInstance {
  begin(): void;
  abort(): void;
  completePayment(status: unknown): void;
  completePaymentMethodSelection(update: unknown): void;
  onvalidatemerchant: ((event: any) => void) | null;
  onpaymentmethodselected: ((event: any) => void) | null;
  onpaymentauthorized: ((event: any) => void) | null;
  oncancel: (() => void) | null;
}
import { useCosmicStore } from "@/lib/store";
import { useHydrated } from "@/hooks/useHydrated";

const DEPOSIT_AMOUNTS = [100, 250, 500, 1000];

type Transaction = {
  id: string;
  type: "bet" | "win" | "loss" | "deposit";
  label: string;
  amount: number;
  timestamp: number;
  marketId?: string;
  side?: "YES" | "NO";
};

export default function WalletPage() {
  const hydrated = useHydrated();
  const balance = useCosmicStore((s) => s.balance);
  const positions = useCosmicStore((s) => s.positions);
  const resolutions = useCosmicStore((s) => s.resolutions);
  const getPnL = useCosmicStore((s) => s.getPnL);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState(100);

  const addBalance = useCosmicStore((s) => s.addBalance);

  // Build transaction history from positions + resolutions
  const transactions = useMemo(() => {
    const txs: Transaction[] = [];

    for (const pos of positions) {
      txs.push({
        id: `bet-${pos.marketId}-${pos.timestamp}`,
        type: "bet",
        label: pos.marketQuestion,
        amount: -pos.amount,
        timestamp: pos.timestamp,
        marketId: pos.marketId,
        side: pos.side,
      });
    }

    for (const res of resolutions) {
      const pos = positions.find((p) => p.marketId === res.marketId);
      if (!pos) continue;

      const won = pos.side === res.outcome;
      txs.push({
        id: `resolve-${res.marketId}-${res.timestamp}`,
        type: won ? "win" : "loss",
        label: pos.marketQuestion,
        amount: won ? pos.shares : 0,
        timestamp: res.timestamp,
        marketId: res.marketId,
        side: pos.side,
      });
    }

    return txs.sort((a, b) => b.timestamp - a.timestamp);
  }, [positions, resolutions]);

  // Portfolio stats
  const stats = useMemo(() => {
    let totalWagered = 0;
    let totalWon = 0;
    let totalLost = 0;
    let wins = 0;
    let losses = 0;

    for (const pos of positions) {
      totalWagered += pos.amount;
    }

    for (const res of resolutions) {
      const pnl = getPnL(res.marketId);
      if (pnl === null) continue;
      if (pnl >= 0) {
        totalWon += pnl;
        wins++;
      } else {
        totalLost += Math.abs(pnl);
        losses++;
      }
    }

    const activeBets = positions.filter(
      (p) => !resolutions.some((r) => r.marketId === p.marketId),
    ).length;

    return { totalWagered, totalWon, totalLost, wins, losses, activeBets };
  }, [positions, resolutions, getPnL]);

  const netPnL = stats.totalWon - stats.totalLost;

  const handleDeposit = () => {
    const ApplePay = (window as unknown as { ApplePaySession?: ApplePaySessionConstructor }).ApplePaySession;

    let canPay = false;
    try { canPay = !!ApplePay?.canMakePayments?.(); } catch { /* requires HTTPS */ }

    if (canPay && ApplePay) {
      // Negotiate highest supported version
      let version = 3;
      try {
        if ((ApplePay as any).supportsVersion?.(6)) version = 6;
        else if ((ApplePay as any).supportsVersion?.(4)) version = 4;
      } catch { /* fallback to 3 */ }

      const paymentTotal = {
        label: "Cosmic Forecast",
        amount: depositAmount.toFixed(2),
        type: "final" as const,
      };

      const session = new ApplePay(version, {
        countryCode: "US",
        currencyCode: "USD",
        supportedNetworks: ["visa", "masterCard", "amex", "discover", "chinaUnionPay"],
        merchantCapabilities: ["supports3DS"],
        total: paymentTotal,
      });

      session.onvalidatemerchant = (event: any) => {
        // No real merchant — call completeMerchantValidation to keep sheet open
        event.completeMerchantValidation();
      };

      session.onpaymentmethodselected = () => {
        session.completePaymentMethodSelection({ newTotal: paymentTotal });
      };

      session.oncancel = () => {
        addBalance(depositAmount);
        setShowDeposit(false);
      };

      session.onpaymentauthorized = () => {
        // Real payment went through — never add balance, just fail it
        session.completePayment({ status: 1 /* failure */ });
      };

      session.begin();
    } else {
      // Non-Apple device — just add balance
      addBalance(depositAmount);
      setShowDeposit(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Balance Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 mb-6">
          <p className="text-sm text-muted mb-1">Total Balance</p>
          <p className="text-4xl font-black tabular-nums text-gray-900 mb-1">
            ${hydrated ? balance.toFixed(2) : "1,000.00"}
          </p>
          <p
            className={`text-sm font-medium tabular-nums ${netPnL >= 0 ? "text-green" : "text-red"}`}
          >
            {hydrated
              ? `${netPnL >= 0 ? "+" : ""}$${netPnL.toFixed(2)} All Time`
              : "$0.00 All Time"}
          </p>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setShowDeposit(!showDeposit)}
              className="flex-1 rounded-lg bg-green py-2.5 text-sm font-bold text-white transition-colors hover:bg-green/90"
            >
              Deposit
            </button>
            <button
              type="button"
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50 cursor-not-allowed opacity-50"
              disabled
            >
              Withdraw
            </button>
          </div>

          {/* Deposit panel */}
          {showDeposit && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-medium text-muted mb-3">
                Add funds to your account
              </p>
              <div className="flex gap-2 mb-3">
                {DEPOSIT_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setDepositAmount(a)}
                    className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
                      depositAmount === a
                        ? "bg-foreground text-background"
                        : "bg-white border border-gray-200 text-muted hover:bg-gray-100"
                    }`}
                  >
                    ${a}
                  </button>
                ))}
              </div>
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                  $
                </span>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) =>
                    setDepositAmount(Number(e.target.value) || 0)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-7 pr-3 text-sm font-medium tabular-nums focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <button
                type="button"
                onClick={handleDeposit}
                className="w-full rounded-lg bg-green py-2.5 text-sm font-bold text-white transition-colors hover:bg-green/90"
              >
                Add ${depositAmount.toLocaleString()}
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        {hydrated && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-muted mb-1">Total Wagered</p>
              <p className="text-lg font-bold tabular-nums">
                ${stats.totalWagered.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-muted mb-1">Win Rate</p>
              <p className="text-lg font-bold tabular-nums">
                {stats.wins + stats.losses > 0
                  ? `${Math.round((stats.wins / (stats.wins + stats.losses)) * 100)}%`
                  : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-muted mb-1">Active Bets</p>
              <p className="text-lg font-bold tabular-nums">
                {stats.activeBets}
              </p>
            </div>
          </div>
        )}

        {/* Positions */}
        {hydrated && positions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-3">
              Your Positions
            </h2>
            <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
              {positions.map((pos) => {
                const resolution = resolutions.find(
                  (r) => r.marketId === pos.marketId,
                );
                const pnl = getPnL(pos.marketId);
                const won = resolution
                  ? pos.side === resolution.outcome
                  : null;

                return (
                  <Link
                    key={`${pos.marketId}-${pos.timestamp}`}
                    href={`/market/${pos.marketId}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1 mr-4">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {pos.marketQuestion}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs font-bold ${pos.side === "YES" ? "text-green" : "text-red"}`}
                        >
                          {pos.side}
                        </span>
                        <span className="text-xs text-muted">
                          {pos.shares.toFixed(2)} shares @{" "}
                          {Math.round(pos.price * 100)}¢
                        </span>
                        {resolution && (
                          <span
                            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                              won
                                ? "bg-green-bg text-green"
                                : "bg-red-bg text-red"
                            }`}
                          >
                            {won ? "Won" : "Lost"}
                          </span>
                        )}
                        {!resolution && (
                          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold tabular-nums">
                        ${pos.amount.toFixed(2)}
                      </p>
                      {pnl !== null && (
                        <p
                          className={`text-xs font-medium tabular-nums ${pnl >= 0 ? "text-green" : "text-red"}`}
                        >
                          {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3">
            Transaction History
          </h2>
          {hydrated && transactions.length > 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        tx.type === "bet"
                          ? "bg-blue-50 text-blue-600"
                          : tx.type === "win"
                            ? "bg-green-bg text-green"
                            : tx.type === "deposit"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-red-bg text-red"
                      }`}
                    >
                      {tx.type === "bet" && (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      )}
                      {tx.type === "win" && (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {tx.type === "loss" && (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      )}
                      {tx.type === "deposit" && (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path d="M12 2v20M17 7l-5-5-5 5" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {tx.type === "bet"
                          ? `Bought ${tx.side}`
                          : tx.type === "win"
                            ? "Payout"
                            : tx.type === "loss"
                              ? "Market resolved"
                              : "Deposit"}
                      </p>
                      <p className="text-xs text-muted line-clamp-1">
                        {tx.type === "deposit"
                          ? "Added funds"
                          : tx.label}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p
                      className={`text-sm font-bold tabular-nums ${
                        tx.amount > 0
                          ? "text-green"
                          : tx.amount < 0
                            ? "text-gray-900"
                            : "text-muted"
                      }`}
                    >
                      {tx.amount > 0
                        ? `+$${tx.amount.toFixed(2)}`
                        : tx.amount < 0
                          ? `-$${Math.abs(tx.amount).toFixed(2)}`
                          : "$0.00"}
                    </p>
                    <p className="text-xs text-muted tabular-nums">
                      {new Date(tx.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-sm text-muted">No transactions yet</p>
              <Link
                href="/"
                className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
              >
                Browse markets to get started
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
