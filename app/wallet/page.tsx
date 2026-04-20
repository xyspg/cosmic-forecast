"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Disclaimer } from "@/components/bureau/Disclaimer";
import { FlareTicker } from "@/components/bureau/FlareTicker";
import { GovHeaderStrip } from "@/components/bureau/GovHeaderStrip";
import { Nav } from "@/components/bureau/Nav";
import { WalletSkeleton } from "@/components/Skeleton";
import { useHydrated } from "@/hooks/useHydrated";
import { useCosmicStore } from "@/lib/store";

// Apple Pay JS types
interface ApplePaySessionConstructor {
  new (version: number, request: unknown): ApplePaySessionInstance;
  canMakePayments(): boolean;
}
interface ApplePaySessionInstance {
  begin(): void;
  abort(): void;
  completePayment(status: unknown): void;
  completePaymentMethodSelection(update: unknown): void;
  // biome-ignore lint/suspicious/noExplicitAny: Apple Pay JS surface is vendor-typed
  onvalidatemerchant: ((event: any) => void) | null;
  // biome-ignore lint/suspicious/noExplicitAny: Apple Pay JS surface is vendor-typed
  onpaymentmethodselected: ((event: any) => void) | null;
  // biome-ignore lint/suspicious/noExplicitAny: Apple Pay JS surface is vendor-typed
  onpaymentauthorized: ((event: any) => void) | null;
  oncancel: (() => void) | null;
}

const DEPOSIT_AMOUNTS = [100, 250, 500, 1000];

const TH_CLS =
  "p-3 font-medium font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3";
const TD_CLS = "p-3 align-middle";

function fmtUSD(n: number) {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function StatCell({
  label,
  value,
  hint,
  last,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  last?: boolean;
}) {
  return (
    <div
      className={`px-6 py-[22px] ${last ? "" : "border-r border-ink max-[960px]:border-r-0 max-[960px]:border-b max-[960px]:border-ink"}`}
    >
      <div className="bureau-eyebrow">{label}</div>
      <div className="bureau-num bureau-serif text-[32px] font-medium leading-[1.1] tracking-[-0.02em]">
        {value}
      </div>
      <div className="bureau-mono mt-1 text-[10px] uppercase tracking-[0.1em] text-ink-3">
        {hint}
      </div>
    </div>
  );
}

function StmtBtn({
  primary,
  onClick,
  disabled,
  children,
}: {
  primary?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-[10px] font-mono text-[10px] font-semibold uppercase tracking-stamp ${
        primary
          ? "border-0 bg-ink text-paper"
          : "border border-ink bg-paper text-ink"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

export default function WalletPage() {
  const hydrated = useHydrated();
  const balance = useCosmicStore((s) => s.balance);
  const positions = useCosmicStore((s) => s.positions);
  const resolutions = useCosmicStore((s) => s.resolutions);
  const deposits = useCosmicStore((s) => s.deposits ?? []);
  const getPnL = useCosmicStore((s) => s.getPnL);
  const recordDeposit = useCosmicStore((s) => s.recordDeposit);

  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState(100);
  const [activeTab, setActiveTab] = useState<"positions" | "history" | "tax">(
    "positions",
  );

  const rows = useMemo(() => {
    return positions.map((pos) => {
      const res = resolutions.find((r) => r.marketId === pos.marketId);
      const pnl = getPnL(pos.marketId);
      const won = res ? pos.side === res.outcome : null;
      const status = won === null ? "OPEN" : won ? "WON" : "LOST";
      return {
        pos,
        resolution: res,
        pnl,
        won,
        status,
        ref: `POS-${String(pos.timestamp).slice(-6)}-${pos.marketId.slice(0, 3).toUpperCase()}`,
      };
    });
  }, [positions, resolutions, getPnL]);

  const stats = useMemo(() => {
    const totalWagered = positions.reduce((a, p) => a + p.amount, 0);
    const settled = rows.filter((r) => r.pnl !== null);
    const wonCount = settled.filter((r) => (r.pnl ?? 0) > 0).length;
    const winRate = settled.length
      ? Math.round((wonCount / settled.length) * 100)
      : 0;
    const activeCost = rows
      .filter((r) => r.pnl === null)
      .reduce((a, r) => a + r.pos.amount, 0);
    const settledPL = settled.reduce((a, r) => a + (r.pnl ?? 0), 0);
    return {
      totalWagered,
      settled: settled.length,
      wonCount,
      winRate,
      activeCost,
      activeCount: rows.length - settled.length,
      settledPL,
    };
  }, [rows, positions]);

  const totalCost = positions.reduce((a, p) => a + p.amount, 0);

  const handleDeposit = () => {
    const ApplePay = (
      window as unknown as { ApplePaySession?: ApplePaySessionConstructor }
    ).ApplePaySession;

    let canPay = false;
    try {
      canPay = !!ApplePay?.canMakePayments?.();
    } catch {
      // requires HTTPS
    }

    if (canPay && ApplePay) {
      let version = 3;
      try {
        // biome-ignore lint/suspicious/noExplicitAny: Apple Pay version probe
        if ((ApplePay as any).supportsVersion?.(6)) version = 6;
        // biome-ignore lint/suspicious/noExplicitAny: Apple Pay version probe
        else if ((ApplePay as any).supportsVersion?.(4)) version = 4;
      } catch {
        // fallback to 3
      }

      const paymentTotal = {
        label: "Cosmic Forecast",
        amount: depositAmount.toFixed(2),
        type: "final" as const,
      };

      const session = new ApplePay(version, {
        countryCode: "US",
        currencyCode: "USD",
        supportedNetworks: [
          "visa",
          "masterCard",
          "amex",
          "discover",
          "chinaUnionPay",
        ],
        merchantCapabilities: ["supports3DS"],
        total: paymentTotal,
      });

      // biome-ignore lint/suspicious/noExplicitAny: Apple Pay event
      session.onvalidatemerchant = (event: any) => {
        event.completeMerchantValidation();
      };
      session.onpaymentmethodselected = () => {
        session.completePaymentMethodSelection({ newTotal: paymentTotal });
      };
      session.oncancel = () => {
        recordDeposit(depositAmount);
        setShowDeposit(false);
      };
      session.onpaymentauthorized = () => {
        session.completePayment({ status: 1 });
      };

      session.begin();
    } else {
      recordDeposit(depositAmount);
      setShowDeposit(false);
    }
  };

  const depositForm = (
    <div className="border border-ink bg-paper-2 p-[18px]">
      <div className="bureau-eyebrow mb-[10px]">
        Deposit principal — test mode
      </div>
      <div className="mb-[10px] grid grid-cols-4 gap-[6px] max-sm:grid-cols-2">
        {DEPOSIT_AMOUNTS.map((a) => {
          const active = depositAmount === a;
          return (
            <button
              key={a}
              type="button"
              onClick={() => setDepositAmount(a)}
              className={`cursor-pointer border border-rule py-[10px] font-mono text-[11px] tracking-wire ${active ? "bg-ink text-paper" : "bg-paper text-ink-2"}`}
            >
              ${a}
            </button>
          );
        })}
      </div>
      <div className="relative mb-[10px]">
        <span className="bureau-mono absolute left-[10px] top-1/2 -translate-y-1/2 text-ink-3">
          $
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={depositAmount}
          onChange={(e) =>
            setDepositAmount(
              Math.max(0, Number(e.target.value.replace(/[^\d.]/g, "")) || 0),
            )
          }
          className="box-border w-full border border-rule bg-paper py-3 pl-6 pr-3 font-mono text-[16px] text-ink outline-none"
        />
      </div>
      <button
        type="button"
        onClick={handleDeposit}
        className="w-full cursor-pointer border-0 bg-ink py-3 font-mono text-[11px] font-semibold uppercase tracking-stamp text-paper"
      >
        Credit ${depositAmount.toLocaleString()} to account
      </button>
    </div>
  );

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-paper">
        <GovHeaderStrip />
        <FlareTicker />
        <Nav active="ledger" />
        <WalletSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <GovHeaderStrip />
      <FlareTicker />
      <Nav active="ledger" />

      <div className="bureau-page">
        <div className="border-b-[3px] border-double border-ink pb-4">
          <div className="flex items-baseline justify-between max-sm:flex-col max-sm:items-start max-sm:gap-[10px]">
            <div>
              <div className="bureau-eyebrow mb-1">
                Statement of account · period ending April 19, 2026
              </div>
              <div className="bureau-serif text-[clamp(26px,6vw,38px)] font-medium leading-none tracking-[-0.025em] max-sm:text-[28px]">
                Declarant ledger
              </div>
            </div>
            <div className="bureau-mono text-right font-mono text-[10px] uppercase leading-[1.7] tracking-[0.12em] text-ink-3 max-sm:text-left">
              <div>ACCT · 0042188-NYU</div>
              <div>OPENED · 12 SEP 2025</div>
              <div>
                STATUS · <span className="text-ink">IN GOOD STANDING</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] border border-t-0 border-ink max-[960px]:grid-cols-2 max-sm:grid-cols-1">
          <div className="border-r border-ink px-6 py-[22px] max-[960px]:border-r-0 max-[960px]:border-b max-[960px]:border-ink">
            <div className="bureau-eyebrow">Cash balance</div>
            <div
              className="bureau-num bureau-serif text-[clamp(28px,7vw,42px)] font-medium leading-[1.05] tracking-[-0.02em]"
              suppressHydrationWarning
            >
              {fmtUSD(balance)}
            </div>
            <div
              className={`bureau-mono mt-1 text-[11px] ${stats.settledPL >= 0 ? "text-pl-pos" : "text-pl-neg"}`}
            >
              {stats.settledPL >= 0 ? "+" : "−"}
              {fmtUSD(Math.abs(stats.settledPL))} lifetime
            </div>
            <div className="mt-[14px] flex gap-2">
              <StmtBtn primary onClick={() => setShowDeposit((v) => !v)}>
                ◆ Deposit
              </StmtBtn>
              <StmtBtn disabled>Withdraw</StmtBtn>
            </div>
            {showDeposit && <div className="mt-4 sm:hidden">{depositForm}</div>}
          </div>
          <StatCell
            label="Total principal wagered"
            value={fmtUSD(stats.totalWagered)}
            hint="LIFETIME"
          />
          <StatCell
            label="Win rate"
            value={stats.settled > 0 ? `${stats.winRate}%` : "—"}
            hint={`${stats.wonCount} of ${stats.settled} settled`}
          />
          <StatCell
            label="Active positions"
            value={stats.activeCount}
            hint={`${fmtUSD(stats.activeCost)} committed`}
            last
          />
        </div>

        {showDeposit && <div className="mt-5 max-sm:hidden">{depositForm}</div>}

        <div className="scrollbar-none mt-8 flex border-b-2 border-ink max-sm:overflow-x-auto max-sm:whitespace-nowrap">
          {[
            { k: "positions" as const, label: "Positions" },
            { k: "history" as const, label: "Transaction history" },
            { k: "tax" as const, label: "Tax documents" },
          ].map(({ k, label }) => {
            const active = activeTab === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setActiveTab(k)}
                className={`cursor-pointer border-0 px-[18px] py-3 font-mono text-[11px] font-medium uppercase tracking-eyebrow ${active ? "bg-ink text-paper" : "bg-transparent text-ink-3"}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {activeTab === "tax" ? (
          <div className="border border-t-0 border-rule bg-paper-2 px-5 py-[60px] text-center">
            <div className="bureau-mono mb-[10px] text-[10px] uppercase tracking-mark text-ink-3">
              — FORM 1099-COS —
            </div>
            <div className="bureau-serif mb-[10px] text-[22px] font-medium leading-[1.3] tracking-[-0.015em]">
              Tax document not available for 2025
            </div>
            <div className="bureau-serif mx-auto max-w-[520px] text-[14px] italic leading-[1.5] text-ink-3">
              Year-end statements are issued by the Bureau on or before 15
              February of the following calendar year. Documents for tax year
              2026 will be prepared upon conclusion of the reporting period.
            </div>
          </div>
        ) : activeTab === "positions" ? (
          rows.length === 0 ? (
            <div className="border border-t-0 border-rule px-5 py-12 text-center font-serif text-[15px] italic text-ink-3">
              No positions on file.{" "}
              <Link href="/" className="text-ink underline">
                Browse the market index
              </Link>{" "}
              to open a position.
            </div>
          ) : (
            <div className="bureau-table-scroll">
              <table className="w-full min-w-[920px] border-collapse font-sans text-[13px]">
                <thead>
                  <tr className="text-left">
                    <th className={TH_CLS}>Position ref</th>
                    <th className={TH_CLS}>Market</th>
                    <th className={`${TH_CLS} text-center`}>Side</th>
                    <th className={`${TH_CLS} text-right`}>Shares</th>
                    <th className={`${TH_CLS} text-right`}>Entry</th>
                    <th className={`${TH_CLS} text-right`}>Principal</th>
                    <th className={`${TH_CLS} text-right`}>Net outcome</th>
                    <th className={`${TH_CLS} text-center`}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const colorCls =
                      r.status === "WON"
                        ? "text-pl-pos"
                        : r.status === "LOST"
                          ? "text-pl-neg"
                          : "text-ink-3";
                    const borderColorCls =
                      r.status === "WON"
                        ? "border-pl-pos"
                        : r.status === "LOST"
                          ? "border-pl-neg"
                          : "border-ink-3";
                    return (
                      <tr
                        key={`${r.pos.marketId}-${r.pos.timestamp}`}
                        className={`border-t border-rule ${i % 2 === 0 ? "" : "bg-black/[0.015]"}`}
                      >
                        <td
                          className={`${TD_CLS} font-mono text-[10px] tracking-[0.06em] text-ink-3`}
                        >
                          {r.ref}
                        </td>
                        <td className={TD_CLS}>
                          <Link
                            href={`/market/${r.pos.marketId}`}
                            className="text-inherit no-underline"
                          >
                            <div className="bureau-serif max-w-[520px] text-[14px] leading-[1.3]">
                              {r.pos.marketQuestion}
                            </div>
                          </Link>
                        </td>
                        <td className={`${TD_CLS} text-center`}>
                          <span
                            className={`bureau-mono border px-2 py-[3px] text-[10px] tracking-eyebrow ${r.pos.side === "YES" ? "border-ink text-ink" : "border-ink-3 text-ink-3"}`}
                          >
                            {r.pos.side}
                          </span>
                        </td>
                        <td className={`${TD_CLS} text-right`}>
                          <span className="bureau-num">
                            {r.pos.shares.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td className={`${TD_CLS} text-right`}>
                          <span className="bureau-num text-ink-3">
                            {Math.round(r.pos.price * 100)}¢
                          </span>
                        </td>
                        <td className={`${TD_CLS} text-right`}>
                          <span className="bureau-num">
                            {fmtUSD(r.pos.amount)}
                          </span>
                        </td>
                        <td className={`${TD_CLS} text-right`}>
                          {r.pnl === null ? (
                            <span className="bureau-mono text-[11px] tracking-wire text-ink-3">
                              — PENDING —
                            </span>
                          ) : (
                            <span
                              className={`bureau-num text-[14px] font-medium ${colorCls}`}
                            >
                              {r.pnl > 0 ? "+" : "−"}
                              {fmtUSD(Math.abs(r.pnl))}
                            </span>
                          )}
                        </td>
                        <td className={`${TD_CLS} text-center`}>
                          <span
                            className={`bureau-mono border px-2 py-[3px] text-[10px] tracking-eyebrow ${colorCls} ${borderColorCls}`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-ink bg-paper-2">
                    <td className={TD_CLS} colSpan={5}>
                      <span className="bureau-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
                        Totals · {rows.length} positions
                      </span>
                    </td>
                    <td className={`${TD_CLS} text-right`}>
                      <span className="bureau-num text-[15px] font-medium">
                        {fmtUSD(totalCost)}
                      </span>
                    </td>
                    <td className={`${TD_CLS} text-right`}>
                      <span
                        className={`bureau-num text-[15px] font-medium ${stats.settledPL < 0 ? "text-pl-neg" : "text-pl-pos"}`}
                      >
                        {stats.settledPL >= 0 ? "+" : "−"}
                        {fmtUSD(Math.abs(stats.settledPL))}
                      </span>
                    </td>
                    <td className={TD_CLS} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        ) : deposits.length === 0 ? (
          <div className="border border-t-0 border-rule px-5 py-12 text-center font-serif text-[15px] italic text-ink-3">
            No deposits on file. Use{" "}
            <span className="text-ink">◆ Deposit</span> above to add principal
            to your account.
          </div>
        ) : (
          <div className="bureau-table-scroll">
            <table className="w-full min-w-[820px] border-collapse font-sans text-[13px]">
              <thead>
                <tr className="text-left">
                  <th className={TH_CLS}>Deposit ref</th>
                  <th className={TH_CLS}>Filed</th>
                  <th className={TH_CLS}>Method</th>
                  <th className={`${TH_CLS} text-center`}>Type</th>
                  <th className={`${TH_CLS} text-right`}>Amount</th>
                  <th className={`${TH_CLS} text-center`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...deposits]
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((d, i) => (
                    <tr
                      key={d.id}
                      className={`border-t border-rule ${i % 2 === 0 ? "" : "bg-black/[0.015]"}`}
                    >
                      <td
                        className={`${TD_CLS} font-mono text-[10px] tracking-[0.06em] text-ink-3`}
                      >
                        {d.id.toUpperCase()}
                      </td>
                      <td className={TD_CLS}>
                        <span className="bureau-mono text-[11px] text-ink-2">
                          {new Date(d.timestamp)
                            .toUTCString()
                            .replace("GMT", "UTC")}
                        </span>
                      </td>
                      <td className={TD_CLS}>
                        <span className="bureau-mono text-[11px] text-ink-2">
                          Apple Pay · test mode
                        </span>
                      </td>
                      <td className={`${TD_CLS} text-center`}>
                        <span className="bureau-mono border border-ink-3 px-2 py-[3px] text-[10px] tracking-eyebrow text-ink-3">
                          CREDIT
                        </span>
                      </td>
                      <td className={`${TD_CLS} text-right`}>
                        <span className="bureau-num text-[14px] font-medium text-pl-pos">
                          +{fmtUSD(d.amount)}
                        </span>
                      </td>
                      <td className={`${TD_CLS} text-center`}>
                        <span className="bureau-mono border border-pl-pos px-2 py-[3px] text-[10px] tracking-eyebrow text-pl-pos">
                          POSTED
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ink bg-paper-2">
                  <td className={TD_CLS} colSpan={4}>
                    <span className="bureau-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
                      Totals · {deposits.length} deposit
                      {deposits.length === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td className={`${TD_CLS} text-right`}>
                    <span className="bureau-num text-[15px] font-medium text-pl-pos">
                      +{fmtUSD(deposits.reduce((a, d) => a + d.amount, 0))}
                    </span>
                  </td>
                  <td className={TD_CLS} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div className="mt-8 border border-rule bg-paper-2 px-5 py-4 font-serif text-[13px] italic leading-[1.55] text-ink-2">
          This statement reflects activity recorded through 19 April 2026, 14:22
          UTC. Settled positions are final and non-appealable. Open positions
          reflect mark-to-market fair value based on last observed trade and may
          differ from terminal settlement value. For questions regarding the
          resolution of any market listed above, consult the corresponding entry
          in the public resolution archive.
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}
