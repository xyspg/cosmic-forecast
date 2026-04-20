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

const TH: React.CSSProperties = { padding: "10px 12px", fontWeight: 500 };
const TD: React.CSSProperties = {
  padding: "12px 12px",
  verticalAlign: "middle",
};

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
      style={{
        padding: "22px 24px",
        borderRight: last ? "none" : "1px solid var(--ink)",
      }}
    >
      <div className="bureau-eyebrow">{label}</div>
      <div
        className="bureau-num bureau-serif"
        style={{
          fontSize: 32,
          lineHeight: 1.1,
          fontWeight: 500,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        className="bureau-mono"
        style={{
          fontSize: 10,
          color: "var(--ink-3)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginTop: 4,
        }}
      >
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
      style={{
        padding: "10px 16px",
        background: primary ? "var(--ink)" : "var(--paper)",
        color: primary ? "var(--paper)" : "var(--ink)",
        border: primary ? 0 : "1px solid var(--ink)",
        fontFamily: "var(--ff-mono)",
        fontSize: 10,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 600,
        opacity: disabled ? 0.5 : 1,
      }}
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

  if (!hydrated) {
    return (
      <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
        <GovHeaderStrip />
        <FlareTicker />
        <Nav active="ledger" />
        <WalletSkeleton />
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        minHeight: "100vh",
      }}
    >
      <GovHeaderStrip />
      <FlareTicker />
      <Nav active="ledger" />

      <div className="bureau-page">
        <div
          style={{
            paddingBottom: 16,
            borderBottom: "3px double var(--ink)",
          }}
        >
          <div
            className="bureau-wallet-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <div>
              <div className="bureau-eyebrow" style={{ marginBottom: 4 }}>
                Statement of account · period ending April 19, 2026
              </div>
              <div
                className="bureau-serif bureau-masthead__title"
                style={{
                  fontSize: "clamp(26px, 6vw, 38px)",
                  letterSpacing: "-0.025em",
                  lineHeight: 1,
                  fontWeight: 500,
                }}
              >
                Declarant ledger
              </div>
            </div>
            <div
              className="bureau-wallet-header__meta"
              style={{
                textAlign: "right",
                fontFamily: "var(--ff-mono)",
                fontSize: 10,
                color: "var(--ink-3)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                lineHeight: 1.7,
              }}
            >
              <div>ACCT · 0042188-NYU</div>
              <div>OPENED · 12 SEP 2025</div>
              <div>
                STATUS ·{" "}
                <span style={{ color: "var(--ink)" }}>IN GOOD STANDING</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="bureau-stat-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
            border: "1px solid var(--ink)",
            borderTop: "none",
          }}
        >
          <div
            style={{
              padding: "22px 24px",
              borderRight: "1px solid var(--ink)",
            }}
          >
            <div className="bureau-eyebrow">Cash balance</div>
            <div
              className="bureau-num bureau-serif"
              style={{
                fontSize: "clamp(28px, 7vw, 42px)",
                lineHeight: 1.05,
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
              suppressHydrationWarning
            >
              {fmtUSD(balance)}
            </div>
            <div
              className="bureau-mono"
              style={{
                fontSize: 11,
                color: stats.settledPL >= 0 ? "var(--pl-pos)" : "var(--pl-neg)",
                marginTop: 4,
              }}
            >
              {stats.settledPL >= 0 ? "+" : "−"}
              {fmtUSD(Math.abs(stats.settledPL))} lifetime
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <StmtBtn primary onClick={() => setShowDeposit((v) => !v)}>
                ◆ Deposit
              </StmtBtn>
              <StmtBtn disabled>Withdraw</StmtBtn>
            </div>
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

        {showDeposit && (
          <div
            style={{
              marginTop: 20,
              border: "1px solid var(--ink)",
              padding: 18,
              background: "var(--paper-2)",
            }}
          >
            <div className="bureau-eyebrow" style={{ marginBottom: 10 }}>
              Deposit principal — test mode
            </div>
            <div
              className="bureau-deposit-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 6,
                marginBottom: 10,
              }}
            >
              {DEPOSIT_AMOUNTS.map((a) => {
                const active = depositAmount === a;
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setDepositAmount(a)}
                    style={{
                      padding: "10px 0",
                      border: "1px solid var(--rule)",
                      cursor: "pointer",
                      background: active ? "var(--ink)" : "var(--paper)",
                      color: active ? "var(--paper)" : "var(--ink-2)",
                      fontFamily: "var(--ff-mono)",
                      fontSize: 11,
                      letterSpacing: "0.08em",
                    }}
                  >
                    ${a}
                  </button>
                );
              })}
            </div>
            <div style={{ position: "relative", marginBottom: 10 }}>
              <span
                className="bureau-mono"
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--ink-3)",
                }}
              >
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={depositAmount}
                onChange={(e) =>
                  setDepositAmount(
                    Math.max(
                      0,
                      Number(e.target.value.replace(/[^\d.]/g, "")) || 0,
                    ),
                  )
                }
                style={{
                  width: "100%",
                  padding: "12px 12px 12px 24px",
                  border: "1px solid var(--rule)",
                  background: "var(--paper)",
                  fontFamily: "var(--ff-mono)",
                  fontSize: 16,
                  color: "var(--ink)",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleDeposit}
              style={{
                width: "100%",
                padding: "12px 0",
                background: "var(--ink)",
                color: "var(--paper)",
                border: 0,
                cursor: "pointer",
                fontFamily: "var(--ff-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Credit ${depositAmount.toLocaleString()} to account
            </button>
          </div>
        )}

        <div
          className="bureau-tabs"
          style={{
            display: "flex",
            gap: 0,
            borderBottom: "2px solid var(--ink)",
            marginTop: 32,
          }}
        >
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
                style={{
                  padding: "12px 18px",
                  fontFamily: "var(--ff-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "var(--paper)" : "var(--ink-3)",
                  cursor: "pointer",
                  fontWeight: 500,
                  border: 0,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {activeTab === "tax" ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              border: "1px solid var(--rule)",
              borderTop: "none",
              background: "var(--paper-2)",
            }}
          >
            <div
              className="bureau-mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.28em",
                color: "var(--ink-3)",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              — FORM 1099-COS —
            </div>
            <div
              className="bureau-serif"
              style={{
                fontSize: 22,
                letterSpacing: "-0.015em",
                fontWeight: 500,
                lineHeight: 1.3,
                marginBottom: 10,
              }}
            >
              Tax document not available for 2025
            </div>
            <div
              className="bureau-serif"
              style={{
                fontSize: 14,
                fontStyle: "italic",
                color: "var(--ink-3)",
                lineHeight: 1.5,
                maxWidth: 520,
                margin: "0 auto",
              }}
            >
              Year-end statements are issued by the Bureau on or before 15
              February of the following calendar year. Documents for tax year
              2026 will be prepared upon conclusion of the reporting period.
            </div>
          </div>
        ) : activeTab === "positions" ? (
          rows.length === 0 ? (
            <div
              style={{
                padding: "48px 20px",
                textAlign: "center",
                border: "1px solid var(--rule)",
                borderTop: "none",
                fontFamily: "var(--ff-serif)",
                fontSize: 15,
                fontStyle: "italic",
                color: "var(--ink-3)",
              }}
            >
              No positions on file.{" "}
              <Link
                href="/"
                style={{ color: "var(--ink)", textDecoration: "underline" }}
              >
                Browse the market index
              </Link>{" "}
              to open a position.
            </div>
          ) : (
            <div className="bureau-table-scroll">
              <table
                style={{
                  width: "100%",
                  minWidth: 920,
                  borderCollapse: "collapse",
                  fontFamily: "var(--ff-sans)",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      fontFamily: "var(--ff-mono)",
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--ink-3)",
                      textAlign: "left",
                    }}
                  >
                    <th style={TH}>Position ref</th>
                    <th style={TH}>Market</th>
                    <th style={{ ...TH, textAlign: "center" }}>Side</th>
                    <th style={{ ...TH, textAlign: "right" }}>Shares</th>
                    <th style={{ ...TH, textAlign: "right" }}>Entry</th>
                    <th style={{ ...TH, textAlign: "right" }}>Principal</th>
                    <th style={{ ...TH, textAlign: "right" }}>Net outcome</th>
                    <th style={{ ...TH, textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const color =
                      r.status === "WON"
                        ? "var(--pl-pos)"
                        : r.status === "LOST"
                          ? "var(--pl-neg)"
                          : "var(--ink-3)";
                    return (
                      <tr
                        key={`${r.pos.marketId}-${r.pos.timestamp}`}
                        style={{
                          borderTop: "1px solid var(--rule)",
                          background:
                            i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)",
                        }}
                      >
                        <td
                          style={{
                            ...TD,
                            fontFamily: "var(--ff-mono)",
                            fontSize: 10,
                            color: "var(--ink-3)",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {r.ref}
                        </td>
                        <td style={TD}>
                          <Link
                            href={`/market/${r.pos.marketId}`}
                            style={{ color: "inherit", textDecoration: "none" }}
                          >
                            <div
                              className="bureau-serif"
                              style={{
                                fontSize: 14,
                                lineHeight: 1.3,
                                maxWidth: 520,
                              }}
                            >
                              {r.pos.marketQuestion}
                            </div>
                          </Link>
                        </td>
                        <td style={{ ...TD, textAlign: "center" }}>
                          <span
                            className="bureau-mono"
                            style={{
                              fontSize: 10,
                              letterSpacing: "0.14em",
                              padding: "3px 8px",
                              border: `1px solid ${r.pos.side === "YES" ? "var(--ink)" : "var(--ink-3)"}`,
                              color:
                                r.pos.side === "YES"
                                  ? "var(--ink)"
                                  : "var(--ink-3)",
                            }}
                          >
                            {r.pos.side}
                          </span>
                        </td>
                        <td style={{ ...TD, textAlign: "right" }}>
                          <span className="bureau-num">
                            {r.pos.shares.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </td>
                        <td style={{ ...TD, textAlign: "right" }}>
                          <span
                            className="bureau-num"
                            style={{ color: "var(--ink-3)" }}
                          >
                            {Math.round(r.pos.price * 100)}¢
                          </span>
                        </td>
                        <td style={{ ...TD, textAlign: "right" }}>
                          <span className="bureau-num">
                            {fmtUSD(r.pos.amount)}
                          </span>
                        </td>
                        <td style={{ ...TD, textAlign: "right" }}>
                          {r.pnl === null ? (
                            <span
                              className="bureau-mono"
                              style={{
                                color: "var(--ink-3)",
                                fontSize: 11,
                                letterSpacing: "0.08em",
                              }}
                            >
                              — PENDING —
                            </span>
                          ) : (
                            <span
                              className="bureau-num"
                              style={{
                                color,
                                fontSize: 14,
                                fontWeight: 500,
                              }}
                            >
                              {r.pnl > 0 ? "+" : "−"}
                              {fmtUSD(Math.abs(r.pnl))}
                            </span>
                          )}
                        </td>
                        <td style={{ ...TD, textAlign: "center" }}>
                          <span
                            className="bureau-mono"
                            style={{
                              fontSize: 10,
                              letterSpacing: "0.14em",
                              padding: "3px 8px",
                              border: `1px solid ${color}`,
                              color,
                            }}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      borderTop: "2px solid var(--ink)",
                      background: "var(--paper-2)",
                    }}
                  >
                    <td style={TD} colSpan={5}>
                      <span
                        className="bureau-mono"
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--ink-3)",
                        }}
                      >
                        Totals · {rows.length} positions
                      </span>
                    </td>
                    <td style={{ ...TD, textAlign: "right" }}>
                      <span
                        className="bureau-num"
                        style={{ fontSize: 15, fontWeight: 500 }}
                      >
                        {fmtUSD(totalCost)}
                      </span>
                    </td>
                    <td style={{ ...TD, textAlign: "right" }}>
                      <span
                        className="bureau-num"
                        style={{
                          fontSize: 15,
                          fontWeight: 500,
                          color:
                            stats.settledPL < 0
                              ? "var(--pl-neg)"
                              : "var(--pl-pos)",
                        }}
                      >
                        {stats.settledPL >= 0 ? "+" : "−"}
                        {fmtUSD(Math.abs(stats.settledPL))}
                      </span>
                    </td>
                    <td style={TD} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        ) : deposits.length === 0 ? (
          <div
            style={{
              padding: "48px 20px",
              textAlign: "center",
              border: "1px solid var(--rule)",
              borderTop: "none",
              fontFamily: "var(--ff-serif)",
              fontSize: 15,
              fontStyle: "italic",
              color: "var(--ink-3)",
            }}
          >
            No deposits on file. Use{" "}
            <span style={{ color: "var(--ink)" }}>◆ Deposit</span> above to add
            principal to your account.
          </div>
        ) : (
          <div className="bureau-table-scroll">
            <table
              style={{
                width: "100%",
                minWidth: 820,
                borderCollapse: "collapse",
                fontFamily: "var(--ff-sans)",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    fontFamily: "var(--ff-mono)",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--ink-3)",
                    textAlign: "left",
                  }}
                >
                  <th style={TH}>Deposit ref</th>
                  <th style={TH}>Filed</th>
                  <th style={TH}>Method</th>
                  <th style={{ ...TH, textAlign: "center" }}>Type</th>
                  <th style={{ ...TH, textAlign: "right" }}>Amount</th>
                  <th style={{ ...TH, textAlign: "center" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...deposits]
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((d, i) => (
                    <tr
                      key={d.id}
                      style={{
                        borderTop: "1px solid var(--rule)",
                        background:
                          i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.015)",
                      }}
                    >
                      <td
                        style={{
                          ...TD,
                          fontFamily: "var(--ff-mono)",
                          fontSize: 10,
                          color: "var(--ink-3)",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {d.id.toUpperCase()}
                      </td>
                      <td style={TD}>
                        <span
                          className="bureau-mono"
                          style={{ fontSize: 11, color: "var(--ink-2)" }}
                        >
                          {new Date(d.timestamp)
                            .toUTCString()
                            .replace("GMT", "UTC")}
                        </span>
                      </td>
                      <td style={TD}>
                        <span
                          className="bureau-mono"
                          style={{ fontSize: 11, color: "var(--ink-2)" }}
                        >
                          Apple Pay · test mode
                        </span>
                      </td>
                      <td style={{ ...TD, textAlign: "center" }}>
                        <span
                          className="bureau-mono"
                          style={{
                            fontSize: 10,
                            letterSpacing: "0.14em",
                            padding: "3px 8px",
                            border: "1px solid var(--ink-3)",
                            color: "var(--ink-3)",
                          }}
                        >
                          CREDIT
                        </span>
                      </td>
                      <td style={{ ...TD, textAlign: "right" }}>
                        <span
                          className="bureau-num"
                          style={{
                            color: "var(--pl-pos)",
                            fontSize: 14,
                            fontWeight: 500,
                          }}
                        >
                          +{fmtUSD(d.amount)}
                        </span>
                      </td>
                      <td style={{ ...TD, textAlign: "center" }}>
                        <span
                          className="bureau-mono"
                          style={{
                            fontSize: 10,
                            letterSpacing: "0.14em",
                            padding: "3px 8px",
                            border: "1px solid var(--pl-pos)",
                            color: "var(--pl-pos)",
                          }}
                        >
                          POSTED
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr
                  style={{
                    borderTop: "2px solid var(--ink)",
                    background: "var(--paper-2)",
                  }}
                >
                  <td style={TD} colSpan={4}>
                    <span
                      className="bureau-mono"
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--ink-3)",
                      }}
                    >
                      Totals · {deposits.length} deposit
                      {deposits.length === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td style={{ ...TD, textAlign: "right" }}>
                    <span
                      className="bureau-num"
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        color: "var(--pl-pos)",
                      }}
                    >
                      +{fmtUSD(deposits.reduce((a, d) => a + d.amount, 0))}
                    </span>
                  </td>
                  <td style={TD} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <div
          style={{
            marginTop: 32,
            padding: "16px 20px",
            background: "var(--paper-2)",
            border: "1px solid var(--rule)",
            fontFamily: "var(--ff-serif)",
            fontSize: 13,
            fontStyle: "italic",
            color: "var(--ink-2)",
            lineHeight: 1.55,
          }}
        >
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
