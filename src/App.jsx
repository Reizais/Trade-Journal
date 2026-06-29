import { useState, useEffect } from "react";

const STORAGE_KEY = "options-journal-trades";
const PIN_KEY = "options-journal-pin";
const SESSION_KEY = "options-journal-session";

function PinScreen({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState("enter"); // enter | confirm | unlock
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const hasPin = !!localStorage.getItem(PIN_KEY);

  useEffect(() => {
    setStep(hasPin ? "unlock" : "enter");
  }, [hasPin]);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  function handleDigit(d) {
    setError("");
    if (step === "enter") {
      const next = pin + d;
      setPin(next);
      if (next.length === 6) {
        setTimeout(() => { setStep("confirm"); setPin(""); }, 200);
      }
    } else if (step === "confirm") {
      const next = pin + d;
      setPin(next);
      if (next.length === 6) {
        if (next === confirmPin || confirmPin === "") {
          // first confirmation
          if (confirmPin === "") {
            setConfirmPin(next);
            setPin("");
          }
        }
        setTimeout(() => {
          const saved = confirmPin || next;
          if (confirmPin === "" ) {
            setConfirmPin(next);
            setPin("");
          } else if (next === confirmPin) {
            localStorage.setItem(PIN_KEY, confirmPin);
            sessionStorage.setItem(SESSION_KEY, "1");
            onUnlock();
          } else {
            setError("PINs don't match. Try again.");
            triggerShake();
            setPin("");
            setConfirmPin("");
            setStep("enter");
          }
        }, 200);
      }
    } else if (step === "unlock") {
      const next = pin + d;
      setPin(next);
      if (next.length === 6) {
        setTimeout(() => {
          if (next === localStorage.getItem(PIN_KEY)) {
            sessionStorage.setItem(SESSION_KEY, "1");
            onUnlock();
          } else {
            setError("Incorrect PIN. Try again.");
            triggerShake();
            setPin("");
          }
        }, 200);
      }
    }
  }

  function handleDelete() {
    setPin(p => p.slice(0, -1));
    setError("");
  }

  const digits = [1,2,3,4,5,6,7,8,9,"",0,"⌫"];
  const title = step === "unlock" ? "Enter your PIN" : step === "enter" ? "Set a 6-digit PIN" : "Confirm your PIN";
  const subtitle = step === "unlock" ? "Enter your PIN to access your journal" : step === "enter" ? "Choose a PIN to protect your journal" : "Re-enter your PIN to confirm";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-background-primary)", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: 320, textAlign: "center" }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#3266ad", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M3 3h18v18H3V3zm4 4v10M17 7v10M7 12h10" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 6 }}>Options Journal</div>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{subtitle}</div>
        </div>

        {/* PIN dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 32, animation: shake ? "shake 0.4s ease" : "none" }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${pin.length > i ? "#3266ad" : "var(--color-border-tertiary)"}`, background: pin.length > i ? "#3266ad" : "transparent", transition: "all 0.15s" }} />
          ))}
        </div>

        {/* Error */}
        {error && <div style={{ fontSize: 13, color: "#D4537E", marginBottom: 16, minHeight: 20 }}>{error}</div>}
        {!error && <div style={{ minHeight: 36, marginBottom: 4 }}><span style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500 }}>{title}</span></div>}

        {/* Keypad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {digits.map((d, i) => (
            <button key={i} onClick={() => d === "⌫" ? handleDelete() : d !== "" ? handleDigit(String(d)) : null}
              style={{ height: 64, borderRadius: 12, border: "0.5px solid var(--color-border-tertiary)", background: d === "⌫" ? "var(--color-background-secondary)" : d === "" ? "transparent" : "var(--color-background-secondary)", fontSize: d === "⌫" ? 20 : 22, fontWeight: 500, cursor: d === "" ? "default" : "pointer", color: "var(--color-text-primary)", transition: "background 0.1s", outline: "none",
                ...(d === "" ? { border: "none", background: "transparent" } : {})
              }}>
              {d}
            </button>
          ))}
        </div>

        {step === "unlock" && (
          <button onClick={() => { if (window.confirm("This will reset your PIN and clear all data. Continue?")) { localStorage.clear(); window.location.reload(); } }}
            style={{ marginTop: 24, fontSize: 12, color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            Forgot PIN? Reset app
          </button>
        )}
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }`}</style>
    </div>
  );
}

const STRATEGIES = ["Strategy A — Lottery Ticket Long Call", "Strategy B — Wheel Light Short Put", "Other"];
const STATUSES = ["Open", "Closed — Win", "Closed — Loss", "Closed — Breakeven", "Expired Worthless"];
const CHECKLIST_ITEMS = [
  "Premium outlay under $500?",
  "Fewer than 3 open directional longs?",
  "Total options premium at risk under $4,000?",
  "For short puts: happy owning at this strike?",
];

const emptyTrade = {
  id: null,
  date: new Date().toISOString().slice(0, 10),
  symbol: "",
  strategy: STRATEGIES[0],
  direction: "Long Call",
  strike: "",
  expiry: "",
  contracts: 1,
  premiumPaid: "",
  premiumReceived: "",
  thesis: "",
  checklist: [false, false, false, false],
  status: "Open",
  closeDate: "",
  closePrice: "",
  realizedPnl: "",
  notes: "",
};

function calcPnl(trade) {
  if (trade.realizedPnl !== "" && trade.realizedPnl !== null) return parseFloat(trade.realizedPnl);
  return null;
}

function PnlBadge({ value }) {
  if (value === null) return <span style={{ color: "#888", fontSize: 12 }}>Open</span>;
  const color = value > 0 ? "#1D9E75" : value < 0 ? "#D4537E" : "#888";
  return <span style={{ color, fontWeight: 600, fontSize: 13 }}>{value > 0 ? "+" : ""}{value.toFixed(0)}</span>;
}

function StatusDot({ status }) {
  const colors = {
    "Open": "#3266ad",
    "Closed — Win": "#1D9E75",
    "Closed — Loss": "#D4537E",
    "Closed — Breakeven": "#888",
    "Expired Worthless": "#EF9F27",
  };
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: colors[status] || "#888", marginRight: 6, flexShrink: 0 }} />;
}

function ChecklistItem({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", fontSize: 13, color: checked ? "#1D9E75" : "var(--color-text-secondary)", marginBottom: 6, lineHeight: 1.4 }}>
      <span style={{
        width: 16, height: 16, border: `1.5px solid ${checked ? "#1D9E75" : "#aaa"}`, borderRadius: 3,
        display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
        background: checked ? "#1D9E75" : "transparent", transition: "all 0.15s"
      }}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
      {label}
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
    </label>
  );
}

export default function TradeJournal() {
  const [unlocked, setUnlocked] = useState(!!sessionStorage.getItem(SESSION_KEY));
  const [trades, setTrades] = useState([]);
  const [view, setView] = useState("dashboard");
  const [editTrade, setEditTrade] = useState({ ...emptyTrade });
  const [filterStatus, setFilterStatus] = useState("All");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} />;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTrades(JSON.parse(saved));
    } catch (e) { /* no data */ }
    setLoaded(true);
  }, []);

  function saveTrades(newTrades) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTrades));
      setTrades(newTrades);
    } catch (e) {
      setError("Failed to save. Please try again.");
    }
  }

  function openNew() {
    setEditTrade({ ...emptyTrade, id: Date.now(), date: new Date().toISOString().slice(0, 10) });
    setView("new");
  }

  function openDetail(id) {
    const t = trades.find(t => t.id === id);
    if (t) { setEditTrade({ ...t }); setView("detail"); }
  }

  function submitTrade() {
    if (!editTrade.symbol) { setError("Symbol is required."); return; }
    setError(null);
    const updated = view === "new"
      ? [...trades, editTrade]
      : trades.map(t => t.id === editTrade.id ? editTrade : t);
    saveTrades(updated);
    setView("log");
  }

  function deleteTrade(id) {
    if (!window.confirm("Delete this trade? This cannot be undone.")) return;
    saveTrades(trades.filter(t => t.id !== id));
    setView("log");
  }

  const openTrades = trades.filter(t => t.status === "Open");
  const closedTrades = trades.filter(t => t.status !== "Open");
  const totalPnl = closedTrades.reduce((s, t) => s + (parseFloat(t.realizedPnl) || 0), 0);
  const wins = closedTrades.filter(t => (parseFloat(t.realizedPnl) || 0) > 0);
  const losses = closedTrades.filter(t => (parseFloat(t.realizedPnl) || 0) < 0);
  const winRate = closedTrades.length ? Math.round(wins.length / closedTrades.length * 100) : 0;
  const avgWin = wins.length ? wins.reduce((s, t) => s + parseFloat(t.realizedPnl), 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s, t) => s + parseFloat(t.realizedPnl), 0) / losses.length : 0;
  const totalPremiumAtRisk = openTrades.reduce((s, t) => s + (parseFloat(t.premiumPaid) * (t.contracts || 1) || 0), 0);
  const filteredTrades = filterStatus === "All" ? trades : trades.filter(t => t.status === filterStatus);

  const inputStyle = {
    width: "100%", padding: "7px 10px", fontSize: 13, borderRadius: 6,
    border: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)",
    color: "var(--color-text-primary)", outline: "none",
  };
  const labelStyle = { fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: "0.05em" };
  const fieldStyle = { marginBottom: 14 };
  const btnPrimary = { padding: "8px 18px", borderRadius: 6, border: "none", background: "#3266ad", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" };
  const btnSecondary = { padding: "8px 14px", borderRadius: 6, border: "0.5px solid var(--color-border-tertiary)", background: "transparent", color: "var(--color-text-secondary)", fontSize: 13, cursor: "pointer" };
  const btnDanger = { ...btnSecondary, color: "#D4537E", borderColor: "#D4537E" };

  if (!loaded) return <div style={{ padding: 32, color: "var(--color-text-secondary)", fontSize: 14 }}>Loading journal...</div>;

  const Nav = () => (
    <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
      {[["dashboard", "Dashboard"], ["log", "Trade Log"], ["keynotes", "Keynotes"], ["new", "+ New Trade"]].map(([v, label]) => (
        <button key={v} onClick={() => v === "new" ? openNew() : setView(v)} style={{
          padding: "6px 14px", borderRadius: 6, border: "none", fontSize: 13, cursor: "pointer",
          background: view === v ? "#3266ad" : "transparent",
          color: view === v ? "#fff" : "var(--color-text-secondary)",
          fontWeight: view === v ? 500 : 400,
        }}>{label}</button>
      ))}
      <button onClick={() => { sessionStorage.removeItem(SESSION_KEY); setUnlocked(false); }} style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: 6, border: "0.5px solid var(--color-border-tertiary)", background: "transparent", fontSize: 12, cursor: "pointer", color: "var(--color-text-secondary)" }}>🔒 Lock</button>
    </div>
  );

  // KEYNOTES
  if (view === "keynotes") {
    const keynotes = [
      {
        number: "01", title: "Cap Your Premium Outlay", color: "#3266ad", bg: "#E6F1FB",
        rule: "Never pay more than $500 premium for a single long option position.",
        body: "Your trade history is conclusive — every trade under $400 premium outlay (RBRK, ZS early entries) consistently worked. Every trade over $1,500 premium (CRM $2,645, NVDA $2,000, FTNT) consistently lost. Cheap options with asymmetric payoff are your edge. Yes, they expire worthless more often — but when they hit, they more than compensate.",
        bullets: ["Max premium per single options trade: $500–$800 (~0.3–0.4% of NAV)", "Prefer OTM options with 4–8 weeks to expiry for maximum asymmetry", "If you can't find a position under $500, don't force the trade"],
      },
      {
        number: "02", title: "Position Sizing: The 1% Rule", color: "#1D9E75", bg: "#EAF3DE",
        rule: "Max 3 open directional longs. Max $4,000 total premium at risk at any time.",
        body: "Your February cluster loss (5 losing positions simultaneously) was the most damaging event of the year — not because any single trade was oversized, but because they all moved against you at the same time. Correlation risk across time is as dangerous as concentration across tickers.",
        bullets: ["Max premium per trade: $500–$800 (~0.3–0.4% of NAV at $194k)", "Max total options premium at risk at any time: $3,000–$4,000 (~1.5–2% of NAV)", "Max 3 open directional long call positions simultaneously", "If a new trade would breach any of these, close an existing position first"],
      },
      {
        number: "03", title: "Two Strategies Only", color: "#7F77DD", bg: "#EEEDFE",
        rule: "Strategy A: Cheap OTM long calls. Strategy B: Short puts on stocks you want to own.",
        body: "Your win patterns cluster tightly around two approaches. Everything else — expensive ATM calls, vertical spreads, complex structures — has been a net drain. Discipline means saying no to trades that don't fit one of these two boxes, even when they feel compelling.",
        bullets: ["Strategy A (Lottery Ticket): Buy OTM calls at $50–$300 premium, 4–8 weeks out. Target 3x–5x. Exit rule: sell at 3x or cut at 50% loss.", "Strategy B (Wheel Light): Sell cash-secured puts 5–10% OTM, 3–5 weeks out. Exit rule: buy back at 50% profit, don't hold to expiry.", "Best Strategy A candidates: HOOD, RBRK, ZS, UBER", "Best Strategy B candidates: SE, SCHW, WFC, BAC, NEM, LMND"],
      },
      {
        number: "04", title: "The Pre-Trade Checklist", color: "#EF9F27", bg: "#FAEEDA",
        rule: "All 4 must be Yes. If any answer is No, don't trade.",
        body: "Every losing trade this year could have been filtered by at least one of these four questions. The checklist isn't bureaucracy — it's the distilled lesson of your actual P&L. The discipline to not trade when a check fails is where the edge lives.",
        bullets: ["Is my premium outlay under $500?", "Do I have fewer than 3 open directional longs?", "Is my total options premium at risk under $4,000?", "For short puts: am I happy owning this stock at the strike price?"],
      },
    ];

    return (
      <div style={{ padding: "20px 16px", fontFamily: "system-ui, sans-serif", maxWidth: 800, margin: "0 auto" }}>
        <Nav />
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: "var(--color-text-primary)" }}>Keynotes</h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>Your personal trading framework — derived from your own trade history and P&L analysis.</p>
        </div>
        {keynotes.map((k) => (
          <div key={k.number} style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ background: k.bg, padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: k.color, background: "white", borderRadius: 6, padding: "3px 8px", letterSpacing: "0.08em", flexShrink: 0, marginTop: 2 }}>{k.number}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: k.color, marginBottom: 4 }}>{k.title}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: k.color, opacity: 0.85, fontStyle: "italic" }}>"{k.rule}"</div>
              </div>
            </div>
            <div style={{ padding: "14px 18px" }}>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{k.body}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {k.bullets.map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: k.bg, color: k.color, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // DASHBOARD
  if (view === "dashboard") return (
    <div style={{ padding: "20px 16px", fontFamily: "system-ui, sans-serif", maxWidth: 800, margin: "0 auto" }}>
      <Nav />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: 10, marginBottom: 20 }}>
        {[
          ["Total P&L", `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(0)}`, totalPnl >= 0 ? "#1D9E75" : "#D4537E"],
          ["Open Trades", openTrades.length, "#3266ad"],
          ["Win Rate", `${winRate}%`, winRate >= 55 ? "#1D9E75" : "#D4537E"],
          ["Avg Win", avgWin ? `+$${avgWin.toFixed(0)}` : "—", "#1D9E75"],
          ["Avg Loss", avgLoss ? `$${avgLoss.toFixed(0)}` : "—", "#D4537E"],
          ["Premium at Risk", `$${totalPremiumAtRisk.toFixed(0)}`, totalPremiumAtRisk > 4000 ? "#D4537E" : "#1D9E75"],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 500, color }}>{val}</div>
          </div>
        ))}
      </div>

      {totalPremiumAtRisk > 4000 && (
        <div style={{ background: "#FBEAF0", borderLeft: "3px solid #D4537E", padding: "10px 14px", borderRadius: "0 6px 6px 0", marginBottom: 14, fontSize: 13, color: "#72243E" }}>
          ⚠ <strong>Premium at risk exceeds $4,000.</strong> You have ${totalPremiumAtRisk.toFixed(0)} in open long premium — consider closing or trimming.
        </div>
      )}
      {openTrades.filter(t => t.direction === "Long Call" || t.strategy?.includes("A")).length >= 3 && (
        <div style={{ background: "#FBEAF0", borderLeft: "3px solid #D4537E", padding: "10px 14px", borderRadius: "0 6px 6px 0", marginBottom: 14, fontSize: 13, color: "#72243E" }}>
          ⚠ <strong>3 or more directional long calls open.</strong> Max concurrent directional longs reached.
        </div>
      )}

      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Open Positions</div>
      {openTrades.length === 0
        ? <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 20 }}>No open trades. <button onClick={openNew} style={{ ...btnPrimary, padding: "4px 12px", fontSize: 12 }}>Add one</button></div>
        : <div style={{ marginBottom: 20 }}>
          {openTrades.map(t => (
            <div key={t.id} onClick={() => openDetail(t.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)", marginBottom: 8, cursor: "pointer", background: "var(--color-background-primary)" }}>
              <StatusDot status={t.status} />
              <span style={{ fontWeight: 500, fontSize: 14, minWidth: 50 }}>{t.symbol}</span>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)", flex: 1 }}>{t.direction} · {t.strike} · exp {t.expiry}</span>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{t.strategy?.includes("A") ? "🎯 Strat A" : "💰 Strat B"}</span>
              <span style={{ fontSize: 12, color: "#3266ad" }}>${((parseFloat(t.premiumPaid) || 0) * (t.contracts || 1)).toFixed(0)} at risk</span>
            </div>
          ))}
        </div>}

      {closedTrades.length > 0 && <>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Recent Closed</div>
        {closedTrades.slice(-5).reverse().map(t => (
          <div key={t.id} onClick={() => openDetail(t.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-tertiary)", marginBottom: 6, cursor: "pointer" }}>
            <StatusDot status={t.status} />
            <span style={{ fontWeight: 500, fontSize: 13, minWidth: 50 }}>{t.symbol}</span>
            <span style={{ fontSize: 12, color: "var(--color-text-secondary)", flex: 1 }}>{t.direction} · {t.closeDate}</span>
            <PnlBadge value={calcPnl(t)} />
          </div>
        ))}
      </>}
    </div>
  );

  // TRADE LOG
  if (view === "log") return (
    <div style={{ padding: "20px 16px", fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <Nav />
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {["All", "Open", "Closed — Win", "Closed — Loss", "Expired Worthless"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: "4px 12px", borderRadius: 20, border: "0.5px solid var(--color-border-tertiary)", fontSize: 12,
            background: filterStatus === s ? "#3266ad" : "transparent",
            color: filterStatus === s ? "#fff" : "var(--color-text-secondary)", cursor: "pointer",
          }}>{s}</button>
        ))}
      </div>
      {filteredTrades.length === 0
        ? <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>No trades found. <button onClick={openNew} style={{ ...btnPrimary, padding: "4px 12px", fontSize: 12 }}>Add one</button></div>
        : <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>{["Date", "Symbol", "Direction", "Strike", "Expiry", "Strategy", "Status", "P&L", ""].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "6px 10px", color: "var(--color-text-secondary)", fontWeight: 500, borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filteredTrades.slice().reverse().map(t => (
                <tr key={t.id} style={{ cursor: "pointer" }} onClick={() => openDetail(t.id)}>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--color-border-tertiary)", whiteSpace: "nowrap" }}>{t.date}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--color-border-tertiary)", fontWeight: 500 }}>{t.symbol}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>{t.direction}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>{t.strike || "—"}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>{t.expiry || "—"}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--color-border-tertiary)", fontSize: 11, color: "var(--color-text-secondary)" }}>{t.strategy?.includes("A") ? "Strat A" : t.strategy?.includes("B") ? "Strat B" : "Other"}</td>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                    <span style={{ display: "flex", alignItems: "center" }}><StatusDot status={t.status} /><span style={{ fontSize: 12 }}>{t.status}</span></span>
                  </td>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}><PnlBadge value={calcPnl(t)} /></td>
                  <td style={{ padding: "8px 10px", borderBottom: "0.5px solid var(--color-border-tertiary)", color: "#3266ad", fontSize: 12 }}>View →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
    </div>
  );

  // NEW / EDIT FORM
  if (view === "new" || view === "detail") {
    const isEdit = view === "detail";
    const t = editTrade;
    const set = (k, v) => setEditTrade(prev => ({ ...prev, [k]: v }));
    const setCheck = (i, v) => setEditTrade(prev => { const c = [...prev.checklist]; c[i] = v; return { ...prev, checklist: c }; });
    const allChecked = t.checklist.every(Boolean);

    return (
      <div style={{ padding: "20px 16px", fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto" }}>
        <Nav />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>{isEdit ? `${t.symbol} — ${t.direction}` : "New Trade"}</h2>
          {isEdit && <button onClick={() => deleteTrade(t.id)} style={btnDanger}>Delete</button>}
        </div>

        {error && <div style={{ background: "#FBEAF0", border: "0.5px solid #D4537E", borderRadius: 6, padding: "8px 12px", fontSize: 13, color: "#D4537E", marginBottom: 14 }}>{error}</div>}

        <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-secondary)", marginBottom: 10 }}>Pre-Trade Checklist</div>
          {CHECKLIST_ITEMS.map((item, i) => (
            <ChecklistItem key={i} label={item} checked={t.checklist[i]} onChange={e => setCheck(i, e.target.checked)} />
          ))}
          {!allChecked && <div style={{ fontSize: 12, color: "#EF9F27", marginTop: 6 }}>⚠ Complete all checklist items before entering this trade.</div>}
          {allChecked && <div style={{ fontSize: 12, color: "#1D9E75", marginTop: 6 }}>✓ All checks passed — trade is eligible.</div>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Symbol *</label>
            <input style={inputStyle} value={t.symbol} onChange={e => set("symbol", e.target.value.toUpperCase())} placeholder="e.g. RBRK" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Entry Date</label>
            <input type="date" style={inputStyle} value={t.date} onChange={e => set("date", e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Strategy</label>
            <select style={inputStyle} value={t.strategy} onChange={e => set("strategy", e.target.value)}>
              {STRATEGIES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Direction</label>
            <select style={inputStyle} value={t.direction} onChange={e => set("direction", e.target.value)}>
              {["Long Call", "Short Put", "Long Put", "Short Call", "Call Spread", "Put Spread"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Strike Price</label>
            <input style={inputStyle} value={t.strike} onChange={e => set("strike", e.target.value)} placeholder="e.g. 85" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Expiry Date</label>
            <input type="date" style={inputStyle} value={t.expiry} onChange={e => set("expiry", e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Contracts</label>
            <input type="number" style={inputStyle} value={t.contracts} min={1} onChange={e => set("contracts", parseInt(e.target.value) || 1)} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Premium Paid (per contract $)</label>
            <input type="number" style={inputStyle} value={t.premiumPaid} onChange={e => set("premiumPaid", e.target.value)} placeholder="e.g. 70" step="0.01" />
          </div>
        </div>

        {t.premiumPaid && (
          <div style={{ fontSize: 13, color: "#3266ad", marginBottom: 14, padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: 6 }}>
            Total premium outlay: <strong>${(parseFloat(t.premiumPaid) * (t.contracts || 1)).toFixed(0)}</strong>
            {parseFloat(t.premiumPaid) * (t.contracts || 1) > 500 && <span style={{ color: "#D4537E", marginLeft: 8 }}>⚠ Exceeds $500 limit</span>}
          </div>
        )}

        <div style={fieldStyle}>
          <label style={labelStyle}>Trade Thesis</label>
          <textarea style={{ ...inputStyle, height: 80, resize: "vertical" }} value={t.thesis} onChange={e => set("thesis", e.target.value)} placeholder="e.g. RBRK breaking out above 50-day MA, earnings catalyst in 3 weeks..." />
        </div>

        <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 14, marginTop: 4, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-secondary)", marginBottom: 12 }}>Close Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={t.status} onChange={e => set("status", e.target.value)}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Close Date</label>
              <input type="date" style={inputStyle} value={t.closeDate} onChange={e => set("closeDate", e.target.value)} />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Realised P&L ($)</label>
              <input type="number" style={inputStyle} value={t.realizedPnl} onChange={e => set("realizedPnl", e.target.value)} placeholder="e.g. 268" step="0.01" />
            </div>
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Post-trade notes / lessons learned</label>
          <textarea style={{ ...inputStyle, height: 70, resize: "vertical" }} value={t.notes} onChange={e => set("notes", e.target.value)} placeholder="e.g. Should have taken profit at 3x instead of holding..." />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button onClick={submitTrade} style={btnPrimary}>{isEdit ? "Save Changes" : "Add Trade"}</button>
          <button onClick={() => setView(isEdit ? "log" : "dashboard")} style={btnSecondary}>Cancel</button>
        </div>
      </div>
    );
  }

  return null;
}
