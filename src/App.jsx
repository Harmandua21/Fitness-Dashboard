import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ----------------------------------------------------------------------------
// DATA — Evolt 360 scan (Harman, 29-05-2026) + computed 10% / more-muscle goal
// ----------------------------------------------------------------------------
const profile = {
  name: "Harman",
  date: "29 May 2026 · 13:47",
  gender: "Male",
  age: 30,
  height: 170,
  curWeight: 82.5,
  tgtWeight: 70.0,
  site: "Anytime Fitness · Shastri Nagar, Meerut",
};

const GOAL = "#8be9ff"; // target accent (the destination)

// rating refers to CURRENT value vs population band
// good: which direction is the improvement ('up' | 'down' | 'flat')
const composition = [
  { id: 2, label: "Skeletal Muscle Mass", unit: "kg", past: 29.2, cur: 33.2, tgt: 35.0, low: 26.4, high: 32.3, rating: "high", good: "up" },
  { id: 1, label: "Lean Body Mass", unit: "kg", past: 52.8, cur: 60.1, tgt: 63.0, low: 47.3, high: 57.8, rating: "high", good: "up" },
  { id: 3, label: "Protein", unit: "kg", past: 10.7, cur: 12.1, tgt: 12.7, low: 9.5, high: 11.7, rating: "high", good: "up" },
  { id: 5, label: "Total Body Water", unit: "kg", past: 38.0, cur: 43.3, tgt: 45.4, low: 34.5, high: 42.2, rating: "high", good: "up" },
  { id: 4, label: "Mineral", unit: "kg", past: 4.1, cur: 4.7, tgt: 4.8, low: 3.2, high: 4.0, rating: "high", good: "flat" },
  { id: 10, label: "Total Body Fat", unit: "%", past: 26.0, cur: 27.2, tgt: 10.0, low: 15, high: 20, rating: "high", good: "down" },
  { id: 6, label: "Body Fat Mass", unit: "kg", past: 18.6, cur: 22.4, tgt: 7.0, low: 8.9, high: 13.3, rating: "high", good: "down" },
  { id: 9, label: "Visceral Fat Area", unit: "cm²", past: 86, cur: 96, tgt: 40, low: 50, high: 100, rating: "optimal", good: "down" },
];

const fatDetail = [
  { label: "Subcutaneous Fat", cur: 19.1, tgt: 6.0 },
  { label: "Visceral Fat", cur: 3.3, tgt: 1.0 },
];

const fluids = { icf: { cur: 28.6, tgt: 30.2 }, ecf: { cur: 14.7, tgt: 14.9 }, icfPct: { cur: 66, tgt: 67 }, ecfPct: { cur: 34, tgt: 33 } };

const metabolism = {
  bmr: { past: 1510, cur: 1668, tgt: 1731 },
  tee: { past: 2325, cur: 2568, tgt: 2664 },
  bioAge: { past: 30, cur: 33, tgt: 26 },
  bwi: { cur: 6.6, tgt: 9.0 },
  fitnessPast: 74,
  visceralLevel: { past: 9, cur: 10, tgt: 5 },
};

const segments = {
  rightArm: { name: "Right Arm", lean: { past: 2.71, cur: 3.51, tgt: 3.70, low: 2.57, high: 3.14 }, fat: { past: 1.32, cur: 1.15, tgt: 0.40, low: 0.69, high: 1.04 } },
  leftArm: { name: "Left Arm", lean: { past: 2.84, cur: 3.60, tgt: 3.80, low: 2.57, high: 3.14 }, fat: { past: 1.12, cur: 1.19, tgt: 0.40, low: 0.69, high: 1.04 } },
  torso: { name: "Torso", lean: { past: 23.38, cur: 27.26, tgt: 28.60, low: 19.34, high: 23.64 }, fat: { past: 10.32, cur: 13.42, tgt: 4.20, low: 5.85, high: 8.78 } },
  rightLeg: { name: "Right Leg", lean: { past: 7.66, cur: 7.98, tgt: 8.40, low: 7.10, high: 8.67 }, fat: { past: 3.03, cur: 3.30, tgt: 1.05, low: 1.65, high: 2.47 } },
  leftLeg: { name: "Left Leg", lean: { past: 7.58, cur: 7.93, tgt: 8.30, low: 7.10, high: 8.67 }, fat: { past: 2.81, cur: 3.35, tgt: 1.05, low: 1.65, high: 2.47 } },
};

const PAST_DATE = "12 Dec 2024";
const journey = [
  { key: "Weight", unit: "kg", past: 71.4, now: 82.5, goal: 70.0, dir: "down" },
  { key: "Body Fat", unit: "%", past: 26.0, now: 27.2, goal: 10.0, dir: "down" },
  { key: "Muscle", unit: "kg", past: 29.2, now: 33.2, goal: 35.0, dir: "up" },
  { key: "Fat Mass", unit: "kg", past: 18.6, now: 22.4, goal: 7.0, dir: "down" },
  { key: "Bio Age", unit: "", past: 30, now: 33, goal: 26, dir: "down" },
  { key: "Visceral", unit: "lvl", past: 9, now: 10, goal: 5, dir: "down" },
];

const balance = {
  abdominal: { cur: 96.3, tgt: 80 },
  whr: { cur: 0.86, tgt: 0.80 },
};

const nutrition = {
  calories: { cur: [2968, 3068], tgt: [2000, 2100] },
  protein: { cur: [223, 230], tgt: [180, 190], pct: 37, color: "#34e0a1" },
  carbs: { cur: [334, 345], tgt: [170, 185], pct: 34, color: "#7cc4ff" },
  fat: { cur: [82, 85], tgt: [60, 70], pct: 29, color: "#f5b94a" },
};

const supplements = ["Whey or Plant Protein", "Creatine Monohydrate", "BCAAs (intra-workout)"];

// ------------------------------------------------------------------ TRAINING
const splitVerdict = {
  pick: "Push / Pull / Legs — run twice (6 days)",
  why: [
    "Every muscle gets trained 2× a week — the sweet spot for building and keeping muscle while you diet.",
    "Built-in recovery: you never smash the same muscle two days running, so each session is fresh.",
    "Balanced volume and easy to dial back on low-energy days, which matters a lot in a deficit.",
  ],
  alt: "Your back+bi / chest+tri / shoulder+legs plan (reversed the next three days) also hits everything 2×/week — it's a solid Arnold-style hybrid. Two snags: shoulders+legs in one session is brutally fatiguing, and triceps get hit close together across chest and arm days. If you love that style it works, but PPL recovers cleaner for a fat-loss block.",
};

const weekPlan = [
  { d: "Mon", w: "Push" }, { d: "Tue", w: "Pull" }, { d: "Wed", w: "Legs" },
  { d: "Thu", w: "Push" }, { d: "Fri", w: "Pull" }, { d: "Sat", w: "Legs" }, { d: "Sun", w: "Rest" },
];

const blocks = [
  { id: 1, weeks: "Weeks 1–4", name: "Foundation", color: "#34e0a1", intensity: "RPE 7 · 3 reps in reserve", liss: "20 min post-lift", hiit: "None yet", focus: "Nail your form, build the 6-day habit, ease into the deficit. Add a little weight or one rep each week — momentum over intensity." },
  { id: 2, weeks: "Weeks 5–8", name: "Progression", color: "#7cc4ff", intensity: "RPE 8 · 2 reps left", liss: "25 min post-lift", hiit: "1×/week (not after legs)", focus: "Push the working weights up. Volume creeps from ~14 to ~16 hard sets per muscle per week. Take a lighter week if you feel beaten up by week 8." },
  { id: 3, weeks: "Weeks 9–12", name: "Intensification", color: "#f5b94a", intensity: "RPE 8–9 · 1 rep left", liss: "30 min post-lift", hiit: "2×/week max", focus: "The hardest block — highest volume and intensity. Sleep 7–8h, keep protein high, and accept that strength may dip slightly as fat drops. That's normal in a deficit." },
  { id: 4, weeks: "Weeks 13–16", name: "Refine & Peak", color: "#8be9ff", intensity: "RPE 8 · deload week 13", liss: "30–35 min", hiit: "1–2×/week", focus: "Deload in week 13 to recover, then finish hard. If fat loss stalls, add cardio minutes before cutting food further. This is where 10% comes into view." },
];

const workouts = {
  Push: { sub: "Chest · Shoulders · Triceps", items: [
    { n: "Barbell Bench / Machine Chest Press", t: "Chest", s: "4 × 6–8", h: "Your strongest press — do it first while fresh. Shoulder blades pinned back and down, lower to mid-chest, drive up and slightly back." },
    { n: "Incline Dumbbell Press", t: "Upper Chest", s: "3 × 8–12", h: "Hits the upper chest the flat press under-works. Bench at ~30°, let the dumbbells stretch at the bottom." },
    { n: "Seated Overhead Press", t: "Front / Side Delts", s: "3 × 8–10", h: "Main shoulder mass builder. Brace the core and press overhead without flaring the ribs." },
    { n: "Lateral Raise", t: "Side Delts", s: "3 × 12–15", h: "Side delts give shoulders width and that capped look. Lead with the elbows, no swinging, lower under control." },
    { n: "Rope Triceps Pushdown", t: "Triceps", s: "3 × 10–15", h: "Keep elbows pinned to your sides; spread the rope apart at the bottom and squeeze." },
    { n: "Overhead Triceps Extension", t: "Triceps · long head", s: "3 × 10–12", h: "The overhead stretch targets the long head — the part pushdowns miss. Real arm size lives here." },
  ]},
  Pull: { sub: "Back · Rear Delts · Biceps", items: [
    { n: "Pull-up or Lat Pulldown", t: "Lats · width", s: "4 × 6–10", h: "Builds the V-taper. Drive your elbows down toward your sides and pull with the back, not the arms." },
    { n: "Chest-supported / Barbell Row", t: "Mid-back · thickness", s: "4 × 8–10", h: "Pull to the lower ribs and squeeze the shoulder blades. Chest-supported saves your lower back while dieting." },
    { n: "Seated Cable Row", t: "Mid-back", s: "3 × 10–12", h: "Constant tension for back detail. Keep the torso still — don't rock back to move the weight." },
    { n: "Face Pull", t: "Rear Delts", s: "3 × 15–20", h: "Balances all the pressing and fixes desk posture. Pull to your forehead, thumbs pointing back." },
    { n: "EZ-bar / Dumbbell Curl", t: "Biceps", s: "3 × 8–12", h: "Main biceps mass. Lock the elbows in place — no swinging or shoulder help." },
    { n: "Hammer Curl", t: "Brachialis / Forearm", s: "3 × 10–12", h: "Neutral grip builds the brachialis under the biceps, adding thickness and arm width." },
  ]},
  Legs: { sub: "Quads · Hams · Glutes · Calves", items: [
    { n: "Back Squat or Hack Squat", t: "Quads / Glutes", s: "4 × 6–8", h: "The big one. At least to parallel, knees tracking over toes, brace hard. Hack squat is a joint-friendly swap on a cut." },
    { n: "Romanian Deadlift", t: "Hamstrings / Glutes", s: "3 × 8–10", h: "Hip hinge: soft knees, push the hips back, feel the hamstrings stretch, neutral spine. Never round the back." },
    { n: "Leg Press or Walking Lunge", t: "Quads / Glutes", s: "3 × 10–12", h: "More leg volume with less spinal load — useful when recovery is lower in a deficit." },
    { n: "Lying / Seated Leg Curl", t: "Hamstrings", s: "3 × 10–15", h: "Direct hamstring work the squat can't fully reach. Squeeze hard at the peak." },
    { n: "Leg Extension", t: "Quads", s: "3 × 12–15", h: "Quad isolation and a safe finisher you can push close to failure." },
    { n: "Standing Calf Raise", t: "Calves", s: "4 × 12–20", h: "Calves like high reps with a full stretch at the bottom and a pause at the top." },
  ]},
  Rest: { sub: "Recovery — walk, stretch, sleep", items: [] },
};

const coreNote = "Add 2–3 core sets (hanging leg raises or cable crunches, 3 × 12–15) at the end of any two sessions a week.";

const cardioPlan = {
  pre: { title: "BEFORE WEIGHTS · warm-up only", accent: "#7cc4ff", lines: [
    "5–10 minutes, easy. Incline walk, easy bike, or rower at ~50–60% max heart rate — you should finish barely breathing hard.",
    "The job is to raise core temperature, loosen joints, and wake up the nervous system. It is not a workout.",
    "Then do 2–3 light ramp-up sets of your first lift. That's the real warm-up that protects your strength.",
    "Why not more: 30+ minutes of cardio first burns through glycogen and tanks your lifting — exactly the tiredness you want to avoid.",
  ]},
  post: { title: "AFTER WEIGHTS · the fat-loss cardio", accent: "#f5b94a", lines: [
    "20–35 minutes steady-state (LISS): incline treadmill walk, bike, or row at ~60–70% max HR — a pace you could talk at.",
    "Glycogen is already low after lifting, so steady cardio now pulls more from fat and can't sabotage lifts that already happened.",
    "Optional HIIT 1–2×/week (e.g. 10 rounds of 30s hard / 90s easy). Skip it right after leg day — too much overlapping fatigue on a cut.",
    "Let diet create most of the deficit. Add cardio minutes only when fat loss actually stalls — keep something in reserve.",
  ]},
};

// ----------------------------------------------------------------------------
const RATING = {
  low: { c: "#7cc4ff", label: "LOW" },
  optimal: { c: "#34e0a1", label: "OPTIMAL" },
  high: { c: "#f5b94a", label: "HIGH" },
  over: { c: "#ff6b6b", label: "OVER RANGE" },
  lean: { c: GOAL, label: "LEAN" },
};

const fmt = (n) => (Number.isInteger(n) ? n : n.toFixed(1));

function deltaText(cur, tgt, unit) {
  const d = tgt - cur;
  const sign = d > 0 ? "+" : "";
  return `${sign}${fmt(d)}${unit === "%" ? " pts" : ` ${unit}`}`;
}

function RangeBar({ cur, tgt, low, high, unit = "", rating, mode, past }) {
  const hasPast = typeof past === "number" && !isNaN(past);
  const vals = hasPast ? [cur, tgt, low, high, past] : [cur, tgt, low, high];
  const dataMin = Math.min(...vals), dataMax = Math.max(...vals);
  const pad = (dataMax - dataMin) * 0.16 + (high - low) * 0.12 + 0.001;
  const dMin = dataMin - pad, dMax = dataMax + pad, span = dMax - dMin;
  const pct = (x) => Math.max(0, Math.min(100, ((x - dMin) / span) * 100));
  const curPos = pct(cur), tgtPos = pct(tgt), bandL = pct(low), bandR = pct(high), pastPos = pct(past);
  const curColor = RATING[rating].c;
  const lo = Math.min(curPos, tgtPos), hi = Math.max(curPos, tgtPos);
  const nowMode = mode === "now";

  return (
    <div style={{ width: "100%" }}>
      <div style={{ position: "relative", height: 16 }}>
        <div style={{ position: "absolute", inset: "3px 0", borderRadius: 99, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", left: `${bandL}%`, width: `${bandR - bandL}%`, top: 3, bottom: 3, background: "rgba(52,224,161,0.16)", borderLeft: "1px dashed rgba(52,224,161,0.5)", borderRight: "1px dashed rgba(52,224,161,0.5)" }} />
        <div style={{ position: "absolute", left: `${lo}%`, width: `${hi - lo}%`, top: "50%", height: 2, transform: "translateY(-50%)", background: `repeating-linear-gradient(90deg, ${GOAL}99 0 4px, transparent 4px 8px)`, transition: "all .9s cubic-bezier(.2,.9,.2,1)" }} />
        {hasPast && <div title={`Dec '24 · ${fmt(past)}${unit}`} style={{ position: "absolute", left: `${pastPos}%`, top: "50%", transform: "translate(-50%,-50%)", width: 11, height: 11, borderRadius: 99, background: "#070a09", border: "2px solid rgba(255,255,255,0.4)", zIndex: 1 }} />}
        <div title={`Now ${fmt(cur)}${unit}`} style={{ position: "absolute", left: `${curPos}%`, top: "50%", transform: `translate(-50%,-50%) scale(${nowMode ? 1 : 0.62})`, width: 16, height: 16, borderRadius: 99, background: curColor, opacity: nowMode ? 1 : 0.55, boxShadow: nowMode ? `0 0 0 3px #070a09, 0 0 14px ${curColor}` : "0 0 0 2px #070a09", transition: "all .9s cubic-bezier(.2,.9,.2,1)", zIndex: nowMode ? 3 : 2 }} />
        <div title={`Goal ${fmt(tgt)}${unit}`} style={{ position: "absolute", left: `${tgtPos}%`, top: "50%", transform: `translate(-50%,-50%) scale(${nowMode ? 0.72 : 1.05})`, width: 16, height: 16, borderRadius: 99, background: "#070a09", border: `3px solid ${GOAL}`, opacity: nowMode ? 0.6 : 1, boxShadow: nowMode ? "none" : `0 0 12px ${GOAL}`, transition: "all .9s cubic-bezier(.2,.9,.2,1)", zIndex: nowMode ? 2 : 3 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>
        <span>{low}</span>
        <span style={{ color: "rgba(52,224,161,0.7)", letterSpacing: ".04em" }}>OPTIMAL {low}–{high}{unit}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function Pill({ rating }) {
  const r = RATING[rating];
  return <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, fontWeight: 600, letterSpacing: ".08em", padding: "3px 8px", borderRadius: 99, color: r.c, background: `${r.c}1f`, border: `1px solid ${r.c}55`, whiteSpace: "nowrap" }}>{r.label}</span>;
}

function ValueArrow({ cur, tgt, unit, good, mode }) {
  const isImprove = good === "flat" ? null : (good === "up" ? tgt > cur : tgt < cur);
  const dColor = isImprove === null ? "rgba(255,255,255,0.5)" : isImprove ? "#34e0a1" : "#ff6b6b";
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, color: mode === "now" ? "#fff" : "rgba(255,255,255,0.4)", transition: "color .4s" }}>{fmt(cur)}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}> {unit}</span></span>
      <span style={{ color: GOAL, fontSize: 13 }}>→</span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, color: mode === "goal" ? GOAL : "rgba(139,233,255,0.45)", transition: "color .4s" }}>{fmt(tgt)}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}> {unit}</span></span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: dColor, padding: "2px 7px", borderRadius: 6, background: `${dColor}18` }}>{deltaText(cur, tgt, unit)}</span>
    </div>
  );
}

function BodyMap({ selected, onSelect }) {
  const fillFor = (key) => {
    if (selected === key) return "url(#selectedFill)";
    const f = segments[key].fat;
    const over = f.cur / f.high;
    return over > 1.4 ? "url(#highFatFill)" : over > 1 ? "url(#medFatFill)" : "url(#lowFatFill)";
  };
  const glowFor = (key) => {
    if (selected === key) return `drop-shadow(0 0 10px rgba(139,233,255,0.9)) drop-shadow(0 0 25px rgba(139,233,255,0.5)) drop-shadow(0 0 45px rgba(0,120,255,0.3))`;
    return `drop-shadow(0 0 4px rgba(0,160,255,0.4)) drop-shadow(0 0 10px rgba(0,120,255,0.15))`;
  };
  const strokeFor = (key) => selected === key ? "rgba(139,233,255,0.95)" : "rgba(0,180,255,0.35)";
  const swFor = (key) => selected === key ? 1.8 : 0.6;
  const region = (key, node) => (
    <g key={key} style={{ cursor: "pointer", filter: glowFor(key), transition: "filter 0.4s" }}
       onClick={() => onSelect(key === selected ? null : key)}
       onMouseEnter={(e) => { if (key !== selected) e.currentTarget.style.filter = `drop-shadow(0 0 8px rgba(139,233,255,0.7)) drop-shadow(0 0 18px rgba(0,120,255,0.35))`; }}
       onMouseLeave={(e) => { e.currentTarget.style.filter = glowFor(key); }}>
      {node(fillFor(key), strokeFor(key), swFor(key))}
    </g>
  );

  return (
    <div className="holo-body-wrap" style={{ position: "relative", width: "100%", maxWidth: 300, margin: "0 auto", overflow: "hidden", borderRadius: 18 }}>
      <style>{`
        .holo-body-wrap {
          background: radial-gradient(ellipse 90% 70% at 50% 42%, rgba(0,50,110,0.55), rgba(0,18,40,0.9) 55%, #010810 100%);
          box-shadow: inset 0 0 60px rgba(0,80,160,0.15), 0 0 30px rgba(0,60,120,0.1);
        }
        .holo-grid {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background-image:
            linear-gradient(rgba(0,120,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,120,255,0.07) 1px, transparent 1px);
          background-size: 20px 20px;
          mask-image: radial-gradient(ellipse 75% 60% at 50% 42%, rgba(0,0,0,0.6) 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 75% 60% at 50% 42%, rgba(0,0,0,0.6) 20%, transparent 70%);
        }
        .holo-ambient {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background: radial-gradient(ellipse 50% 40% at 50% 45%, rgba(0,140,255,0.08), transparent 70%);
        }
        .holo-vignette {
          position: absolute; inset: 0; pointer-events: none; z-index: 8;
          background: radial-gradient(ellipse 50% 48% at 50% 42%, transparent 45%, rgba(1,8,16,0.92) 100%);
        }
        @keyframes holoScan {
          0%   { top: -6%; opacity: 0; }
          4%   { opacity: 1; }
          48%  { top: 98%; opacity: 0.9; }
          52%  { opacity: 0; }
          56%  { top: 98%; opacity: 0; }
          60%  { opacity: 1; }
          96%  { top: -6%; opacity: 0.9; }
          100% { top: -6%; opacity: 0; }
        }
        .holo-scan-line {
          position: absolute; left: 0; right: 0; height: 2px; pointer-events: none; z-index: 10;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(139,233,255,0.03) 8%,
            rgba(139,233,255,0.6) 25%,
            rgba(200,240,255,0.95) 45%,
            rgba(255,255,255,1) 50%,
            rgba(200,240,255,0.95) 55%,
            rgba(139,233,255,0.6) 75%,
            rgba(139,233,255,0.03) 92%,
            transparent 100%);
          box-shadow:
            0 0 8px 2px rgba(139,233,255,0.6),
            0 0 25px 6px rgba(139,233,255,0.3),
            0 0 60px 12px rgba(0,100,200,0.15);
          animation: holoScan 5s ease-in-out infinite;
        }
        .holo-scan-bloom {
          position: absolute; left: 0; right: 0; height: 80px; pointer-events: none; z-index: 9;
          transform: translateY(-50%);
          background: linear-gradient(90deg,
            transparent 5%,
            rgba(139,233,255,0.04) 20%,
            rgba(139,233,255,0.09) 40%,
            rgba(139,233,255,0.12) 50%,
            rgba(139,233,255,0.09) 60%,
            rgba(139,233,255,0.04) 80%,
            transparent 95%);
          animation: holoScan 5s ease-in-out infinite;
        }
        .holo-body-svg path, .holo-body-svg ellipse {
          transition: fill 0.4s, stroke 0.4s, filter 0.4s;
        }
      `}</style>

      <div className="holo-grid" />
      <div className="holo-ambient" />

      <svg className="holo-body-svg" viewBox="0 0 300 520" style={{ display: "block", width: "100%", position: "relative", zIndex: 3 }}>
        <defs>
          <radialGradient id="ambientGlow" cx="50%" cy="42%" rx="40%" ry="48%">
            <stop offset="0%" stopColor="rgba(0,140,255,0.12)" />
            <stop offset="60%" stopColor="rgba(0,80,180,0.04)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="selectedFill" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(139,233,255,0.65)" />
            <stop offset="40%" stopColor="rgba(80,200,255,0.5)" />
            <stop offset="100%" stopColor="rgba(0,140,255,0.35)" />
          </linearGradient>
          <linearGradient id="highFatFill" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(255,107,107,0.22)" />
            <stop offset="100%" stopColor="rgba(200,60,60,0.12)" />
          </linearGradient>
          <linearGradient id="medFatFill" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(245,185,74,0.2)" />
            <stop offset="100%" stopColor="rgba(200,140,40,0.1)" />
          </linearGradient>
          <linearGradient id="lowFatFill" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(0,160,255,0.18)" />
            <stop offset="100%" stopColor="rgba(0,100,200,0.08)" />
          </linearGradient>
          <linearGradient id="headFill" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="rgba(60,180,255,0.18)" />
            <stop offset="100%" stopColor="rgba(0,100,200,0.08)" />
          </linearGradient>
          <filter id="bodyBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          </filter>
        </defs>

        <ellipse cx="150" cy="240" rx="100" ry="200" fill="url(#ambientGlow)" />

        {/* Shadow / outer glow layer behind the body */}
        <g style={{ filter: "blur(12px)", opacity: 0.4 }}>
          <ellipse cx="150" cy="52" rx="28" ry="32" fill="rgba(0,140,255,0.3)" />
          <path d="M112,96 C108,96 100,102 98,110 L92,165 L90,205 C90,215 96,222 108,224 L140,228 L160,228 L192,224 C204,222 210,215 210,205 L208,165 L202,110 C200,102 192,96 188,96 Z" fill="rgba(0,140,255,0.25)" />
          <path d="M94,104 C84,108 72,118 62,148 L48,200 L36,240 C34,248 38,252 44,248 L60,210 L80,160 L94,120 Z" fill="rgba(0,140,255,0.2)" />
          <path d="M206,104 C216,108 228,118 238,148 L252,200 L264,240 C266,248 262,252 256,248 L240,210 L220,160 L206,120 Z" fill="rgba(0,140,255,0.2)" />
          <path d="M112,226 C106,230 100,250 96,290 L88,370 L82,440 L80,480 C80,490 88,494 92,484 L100,420 L108,350 L116,280 L120,240 Z" fill="rgba(0,140,255,0.2)" />
          <path d="M188,226 C194,230 200,250 204,290 L212,370 L218,440 L220,480 C220,490 212,494 208,484 L200,420 L192,350 L184,280 L180,240 Z" fill="rgba(0,140,255,0.2)" />
        </g>

        {/* Head */}
        <ellipse cx="150" cy="52" rx="26" ry="30" fill="url(#headFill)" stroke="rgba(0,180,255,0.3)" strokeWidth="0.7"
          style={{ filter: "drop-shadow(0 0 6px rgba(0,140,255,0.35))" }} />
        {/* Neck */}
        <path d="M138,80 Q140,78 150,78 Q160,78 162,80 L162,96 Q158,94 150,94 Q142,94 138,96 Z"
          fill="rgba(0,140,255,0.1)" stroke="rgba(0,160,255,0.15)" strokeWidth="0.4" />

        {/* Torso */}
        {region("torso", (f, s, w) => (
          <path d="M112,96 C108,96 100,102 98,110 L92,165 L90,205 C90,215 96,222 108,224 L140,228 L160,228 L192,224 C204,222 210,215 210,205 L208,165 L202,110 C200,102 192,96 188,96 Z"
            fill={f} stroke={s} strokeWidth={w} />
        ))}

        {/* Right Arm */}
        {region("rightArm", (f, s, w) => (
          <path d="M94,104 C84,108 72,118 62,148 L48,200 L36,240 C34,248 34,254 38,256 C42,258 46,254 48,248 L52,232 L60,210 L72,178 L80,160 L90,132 L94,114 Z"
            fill={f} stroke={s} strokeWidth={w} />
        ))}

        {/* Left Arm */}
        {region("leftArm", (f, s, w) => (
          <path d="M206,104 C216,108 228,118 238,148 L252,200 L264,240 C266,248 266,254 262,256 C258,258 254,254 252,248 L248,232 L240,210 L228,178 L220,160 L210,132 L206,114 Z"
            fill={f} stroke={s} strokeWidth={w} />
        ))}

        {/* Right Leg */}
        {region("rightLeg", (f, s, w) => (
          <path d="M112,226 C106,230 100,250 96,280 L90,330 L86,380 L82,430 L80,460 L78,480 C78,490 82,496 88,496 C94,496 96,490 96,484 L98,460 L102,420 L106,380 L110,330 L114,280 L118,250 L120,234 Z"
            fill={f} stroke={s} strokeWidth={w} />
        ))}

        {/* Left Leg */}
        {region("leftLeg", (f, s, w) => (
          <path d="M188,226 C194,230 200,250 204,280 L210,330 L214,380 L218,430 L220,460 L222,480 C222,490 218,496 212,496 C206,496 204,490 204,484 L202,460 L198,420 L194,380 L190,330 L186,280 L182,250 L180,234 Z"
            fill={f} stroke={s} strokeWidth={w} />
        ))}

        {/* R / L labels */}
        <text x="28" y="106" textAnchor="middle" fill="rgba(139,233,255,0.35)" fontSize="11" fontFamily="'IBM Plex Mono', monospace" fontWeight="600">R</text>
        <text x="272" y="106" textAnchor="middle" fill="rgba(139,233,255,0.35)" fontSize="11" fontFamily="'IBM Plex Mono', monospace" fontWeight="600">L</text>
      </svg>

      <div className="holo-scan-bloom" />
      <div className="holo-scan-line" />
      <div className="holo-vignette" />
    </div>
  );
}

function Gauge({ cur, tgt, max, label, sub, mode }) {
  const val = mode === "goal" ? tgt : cur;
  const pctv = Math.min(1, val / max);
  const r = 52, c = 2 * Math.PI * r, dash = c * pctv;
  const col = mode === "goal" ? GOAL : "#34e0a1";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 132, height: 132, margin: "0 auto" }}>
        <svg width="132" height="132" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="66" cy="66" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle cx="66" cy="66" r={r} fill="none" stroke={col} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} style={{ transition: "stroke-dasharray .9s ease, stroke .4s", filter: `drop-shadow(0 0 6px ${col})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 32, fontWeight: 600, color: "#fff", lineHeight: 1, transition: "color .3s" }}>{fmt(val)}</span>
          {sub && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{sub}</span>}
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 11.5, letterSpacing: ".14em", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function Panel({ children, style }) {
  return <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(28px) saturate(150%)", WebkitBackdropFilter: "blur(28px) saturate(150%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 22, padding: 22, boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(255,255,255,0.02)", ...style }}>{children}</div>;
}
function SectionTitle({ n, children }) {
  return <h2 style={{ display: "flex", alignItems: "baseline", gap: 12, margin: "0 0 18px", fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{n && <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#34e0a1", fontWeight: 500 }}>{n}</span>}{children}</h2>;
}

// ----------------------------------------------------------------------------
export default function App() {
  const [tab, setTab] = useState("overview");
  const [mode, setMode] = useState("goal");
  const [seg, setSeg] = useState("torso");
  const [block, setBlock] = useState(1);
  const [wkday, setWkday] = useState("Push");
  const [trkWeek, setTrkWeek] = useState(1);
  const [logDay, setLogDay] = useState("Push");
  const [weighins, setWeighins] = useState({});
  const [exlog, setExlog] = useState({});
  const [cardioLog, setCardioLog] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [importText, setImportText] = useState("");
  const [toast, setToast] = useState("");

  const tabs = [{ id: "overview", label: "Overview" }, { id: "composition", label: "Composition" }, { id: "segmental", label: "Segmental" }, { id: "nutrition", label: "Nutrition" }, { id: "training", label: "Training" }, { id: "tracker", label: "Tracker" }];
  const macroData = [
    { name: "Protein", value: nutrition.protein.pct, color: nutrition.protein.color },
    { name: "Carbs", value: nutrition.carbs.pct, color: nutrition.carbs.color },
    { name: "Fat", value: nutrition.fat.pct, color: nutrition.fat.color },
  ];
  const s = segments[seg] || segments.torso;
  const kcal = mode === "goal" ? nutrition.calories.tgt : nutrition.calories.cur;

  // Persistence via localStorage for standalone deployment
  useEffect(() => {
    try {
      const w = localStorage.getItem("harman:weighins");
      const e = localStorage.getItem("harman:exlog");
      const c = localStorage.getItem("harman:cardio");
      if (w) setWeighins(JSON.parse(w));
      if (e) setExlog(JSON.parse(e));
      if (c) setCardioLog(JSON.parse(c));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (!loaded) return; const t = setTimeout(() => { try { localStorage.setItem("harman:weighins", JSON.stringify(weighins)); } catch {} }, 500); return () => clearTimeout(t); }, [weighins, loaded]);
  useEffect(() => { if (!loaded) return; const t = setTimeout(() => { try { localStorage.setItem("harman:exlog", JSON.stringify(exlog)); } catch {} }, 500); return () => clearTimeout(t); }, [exlog, loaded]);
  useEffect(() => { if (!loaded) return; const t = setTimeout(() => { try { localStorage.setItem("harman:cardio", JSON.stringify(cardioLog)); } catch {} }, 500); return () => clearTimeout(t); }, [cardioLog, loaded]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2200); return () => clearTimeout(t); }, [toast]);

  const weightVals = [82.5, 81.6, 80.7, 79.8, 78.9, 78.1, 77.3, 76.5, 75.7, 75.0, 74.2, 73.5, 72.7, 72.0, 71.3, 70.7, 70.0];
  const weightSchedule = weightVals.slice(1).map((sat, i) => ({ week: i + 1, mon: weightVals[i], sat, loss: +(weightVals[i] - sat).toFixed(1) }));
  const wkKey = "w" + trkWeek;
  const wkSched = weightSchedule[trkWeek - 1];
  const sessionDays = ["Push", "Pull", "Legs", "Push", "Pull", "Legs"];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const num = (x) => typeof x === "number" && !isNaN(x);

  const setWeigh = (f, v) => setWeighins((p) => ({ ...p, [wkKey]: { ...(p[wkKey] || {}), [f]: v === "" ? "" : parseFloat(v) } }));
  const setEx = (day, idx, f, v) => setExlog((p) => { const o = { ...(p[wkKey] || {}) }; const arr = [...(o[day] || [])]; arr[idx] = { ...(arr[idx] || {}), [f]: v === "" ? "" : parseFloat(v) }; o[day] = arr; return { ...p, [wkKey]: o }; });
  const setCard = (i, f, v) => setCardioLog((p) => { const o = { ...(p[wkKey] || {}) }; const arr = [...(o.sessions || [])]; arr[i] = { ...(arr[i] || {}), [f]: v === "" ? "" : parseFloat(v) }; o.sessions = arr; return { ...p, [wkKey]: o }; });

  const paceData = weightSchedule.map((r) => { const a = weighins["w" + r.week]; return { week: r.week, target: r.sat, actual: a && num(a.sat) ? a.sat : null }; });
  const loggedPace = paceData.filter((d) => d.actual != null);
  let pace = null;
  if (loggedPace.length) { const last = loggedPace[loggedPace.length - 1]; const tgt = paceData.find((d) => d.week === last.week).target; const diff = +(last.actual - tgt).toFixed(1); const wi = weighins["w" + last.week] || {}; const monW = num(wi.mon) ? wi.mon : weightSchedule[last.week - 1].mon; const wkLoss = +(monW - last.actual).toFixed(1); const pctLoss = monW ? +((wkLoss / monW) * 100).toFixed(2) : 0; pace = { week: last.week, diff, wkLoss, pctLoss }; }

  const btn = (c) => ({ padding: "11px 22px", borderRadius: 99, border: "none", cursor: "pointer", background: c, color: "#06120d", fontWeight: 600, fontFamily: "'Spline Sans', sans-serif", fontSize: 13.5, boxShadow: `0 4px 16px ${c}44, inset 0 1px 0 rgba(255,255,255,0.3)`, transition: "all .2s" });
  const btnGhost = { padding: "11px 22px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontFamily: "'Spline Sans', sans-serif", fontSize: 13.5, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)", transition: "all .2s" };
  const inputStyle = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", padding: "10px 12px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, outline: "none", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.15)", transition: "border-color .2s" };

  const exportData = () => { try { const data = { profile: "Harman", goal: "70 kg @ 10%", weighins, exlog, cardio: cardioLog, exportedAt: new Date().toISOString() }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "harman-tracker.json"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); setToast("Exported — commit to GitHub & send me the raw link"); } catch { setToast("Export failed"); } };
  const copyData = async () => { try { await navigator.clipboard.writeText(JSON.stringify({ weighins, exlog, cardio: cardioLog }, null, 2)); setToast("Copied JSON — paste it to me anytime"); } catch { setToast("Copy failed — use Export"); } };
  const importData = () => { try { const d = JSON.parse(importText); if (d.weighins) setWeighins(d.weighins); if (d.exlog) setExlog(d.exlog); if (d.cardio) setCardioLog(d.cardio); setImportText(""); setToast("Imported"); } catch { setToast("Invalid JSON"); } };

  return (
    <div style={{ minHeight: "100vh", width: "100%", overflowX: "hidden", background: "#060b10", color: "#e8efec", fontFamily: "'Spline Sans', sans-serif", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=Spline+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        html, body { margin: 0; overflow-x: hidden; max-width: 100%; }
        .split2 { display: grid; grid-template-columns: minmax(200px,290px) minmax(0,1fr); gap: 18px; }
        .split2.center { align-items: center; }
        .split2.start { align-items: start; }
        @media (max-width: 700px) { .split2 { grid-template-columns: minmax(0,1fr); } }
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(139,233,255,0.25); border-radius: 99px; }
        @keyframes rise { from { opacity:0; transform: translateY(14px);} to {opacity:1; transform:none;} }
        .rise { animation: rise .55s cubic-bezier(.2,.9,.2,1) both; }
        @keyframes orbFloat1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-20px) scale(1.05); } }
        @keyframes orbFloat2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-25px,15px) scale(0.95); } }
        @keyframes orbFloat3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(15px,25px) scale(1.08); } }
        .glass-inner { background: rgba(255,255,255,0.03); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; }
      `}</style>

      {/* Gradient orbs for glass refraction */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-15%", right: "-8%", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(52,224,161,0.22) 0%, rgba(52,224,161,0.08) 35%, transparent 65%)", animation: "orbFloat1 12s ease-in-out infinite", filter: "blur(30px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-12%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,233,255,0.18) 0%, rgba(0,120,255,0.07) 35%, transparent 65%)", animation: "orbFloat2 15s ease-in-out infinite", filter: "blur(35px)" }} />
        <div style={{ position: "absolute", top: "35%", left: "55%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(160,100,255,0.12) 0%, rgba(100,50,200,0.04) 35%, transparent 65%)", animation: "orbFloat3 18s ease-in-out infinite", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", top: "15%", right: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,185,74,0.09) 0%, transparent 55%)", animation: "orbFloat2 20s ease-in-out infinite", filter: "blur(35px)" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "30%", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,200,255,0.1) 0%, transparent 55%)", animation: "orbFloat1 16s ease-in-out infinite", filter: "blur(45px)" }} />
      </div>

      <div style={{ position: "relative", width: "100%", maxWidth: 1080, margin: "0 auto", padding: "clamp(20px,4vw,44px)" }}>
        {/* HEADER */}
        <header className="rise" style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".3em", color: "#34e0a1", marginBottom: 8 }}>EVOLT 360 · TARGET PLAN</div>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(34px,7vw,56px)", fontWeight: 800, margin: 0, lineHeight: 0.95, letterSpacing: "-0.03em" }}>{profile.name}<span style={{ color: GOAL }}> → 10%</span></h1>
            <div style={{ marginTop: 10, fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'IBM Plex Mono', monospace" }}>Baseline scan · {profile.date}</div>
          </div>
          <div style={{ display: "flex", gap: 4, padding: 4, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
            {[["now", "NOW", "#34e0a1"], ["goal", "GOAL", GOAL]].map(([id, lbl, col]) => (
              <button key={id} onClick={() => setMode(id)} style={{ padding: "9px 22px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 13, letterSpacing: ".1em", color: mode === id ? "#06120d" : "rgba(255,255,255,0.5)", background: mode === id ? col : "transparent", boxShadow: mode === id ? `0 4px 14px ${col}44, inset 0 1px 0 rgba(255,255,255,0.3)` : "none", transition: "all .25s" }}>{lbl}</button>
            ))}
          </div>
        </header>

        {/* TRANSFORMATION STRIP */}
        <div className="rise" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 22 }}>
          {[
            ["WEIGHT", profile.curWeight, profile.tgtWeight, "kg", "down"],
            ["BODY FAT", 27.2, 10.0, "%", "down"],
            ["FAT MASS", 22.4, 7.0, "kg", "down"],
            ["MUSCLE", 33.2, 35.0, "kg", "up"],
          ].map(([k, c, t, u, dir]) => {
            const improve = dir === "up" ? t > c : t < c;
            const dCol = improve ? "#34e0a1" : "#ff6b6b";
            return (
              <Panel key={k} style={{ padding: 16 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)" }}>{k}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: "rgba(255,255,255,0.45)" }}>{fmt(c)}</span>
                  <span style={{ color: GOAL }}>→</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 26, fontWeight: 600, color: GOAL }}>{fmt(t)}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{u}</span></span>
                </div>
                <div style={{ marginTop: 6, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: dCol }}>{deltaText(c, t, u)}</div>
              </Panel>
            );
          })}
        </div>

        {/* TABS */}
        <nav style={{ display: "flex", gap: 6, padding: 5, background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, marginBottom: 24, flexWrap: "wrap", boxShadow: "0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: "1 1 auto", minWidth: 78, padding: "11px 12px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "'Spline Sans', sans-serif", fontSize: 14, fontWeight: 600, color: tab === t.id ? "#06120d" : "rgba(255,255,255,0.55)", background: tab === t.id ? "linear-gradient(180deg,#48f0b0,#2fc88f)" : "transparent", boxShadow: tab === t.id ? "0 4px 16px rgba(52,224,161,0.3), inset 0 1px 0 rgba(255,255,255,0.3)" : "none", transition: "all .25s" }}>{t.label}</button>
          ))}
        </nav>

        {/* ============ OVERVIEW ============ */}
        {tab === "overview" && (
          <div className="rise" style={{ display: "grid", gap: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
              <Gauge cur={metabolism.bwi.cur} tgt={metabolism.bwi.tgt} max={10} label="BWI SCORE" sub="/ 10" mode={mode} />
              <Gauge cur={metabolism.bioAge.cur} tgt={metabolism.bioAge.tgt} max={50} label="BIO AGE" sub={`actual ${profile.age}`} mode={mode} />
              <Panel style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)" }}>BMR · AT REST</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 30, fontWeight: 600, color: mode === "goal" ? GOAL : "#fff", lineHeight: 1, marginTop: 4 }}>{mode === "goal" ? metabolism.bmr.tgt : metabolism.bmr.cur}<span style={{ fontSize: 14 }}> kcal</span></div>
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", marginTop: 8, lineHeight: 1.4 }}>Rises with muscle — more burn even at a lower weight.</div>
              </Panel>
              <Panel style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)" }}>VISCERAL LEVEL</div>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 30, fontWeight: 600, color: mode === "goal" ? GOAL : "#ff6b6b", lineHeight: 1, marginTop: 4 }}>{mode === "goal" ? metabolism.visceralLevel.tgt : metabolism.visceralLevel.cur}</div>
                <div style={{ marginTop: 8 }}><Pill rating={mode === "goal" ? "optimal" : "over"} /></div>
              </Panel>
            </div>

            <Panel style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)" }}>YOUR JOURNEY</div>
                <div style={{ display: "flex", gap: 14, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.5)", flexWrap: "wrap" }}>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, border: "2px solid rgba(255,255,255,0.4)", marginRight: 5, verticalAlign: "middle" }} />Dec &apos;24</span>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "#fff", marginRight: 5, verticalAlign: "middle" }} />Now</span>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, border: `2px solid ${GOAL}`, marginRight: 5, verticalAlign: "middle" }} />Goal</span>
                </div>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.6)" }}>From your {PAST_DATE} scan to now you ran a <b style={{ color: "#34e0a1" }}>lean bulk</b> — about +4 kg muscle alongside +3.8 kg fat. The cut ahead keeps that new muscle and strips the fat back off.</p>
              <div style={{ display: "grid", gap: 10 }}>
                {journey.map((j) => {
                  const vals = [j.past, j.now, j.goal];
                  const mn = Math.min(...vals), mx = Math.max(...vals), sp = (mx - mn) || 1;
                  const pos = (v) => 6 + ((v - mn) / sp) * 88;
                  return (
                    <div key={j.key} style={{ display: "grid", gridTemplateColumns: "minmax(0,86px) minmax(0,1fr)", gap: 12, alignItems: "center" }}>
                      <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{j.key}</div>
                      <div style={{ position: "relative", height: 30 }}>
                        <div style={{ position: "absolute", left: "6%", right: "6%", top: "50%", height: 2, transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)" }} />
                        <div style={{ position: "absolute", left: `${Math.min(pos(j.now), pos(j.goal))}%`, width: `${Math.abs(pos(j.goal) - pos(j.now))}%`, top: "50%", height: 2, transform: "translateY(-50%)", background: `${GOAL}66` }} />
                        <div style={{ position: "absolute", left: `${pos(j.past)}%`, top: "50%", transform: "translate(-50%,-50%)", width: 11, height: 11, borderRadius: 99, background: "#0d1411", border: "2px solid rgba(255,255,255,0.4)" }} />
                        <div style={{ position: "absolute", left: `${pos(j.past)}%`, top: "-2px", transform: "translateX(-50%)", fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>{fmt(j.past)}</div>
                        <div style={{ position: "absolute", left: `${pos(j.now)}%`, top: "50%", transform: "translate(-50%,-50%)", width: 13, height: 13, borderRadius: 99, background: "#fff" }} />
                        <div style={{ position: "absolute", left: `${pos(j.now)}%`, bottom: "-3px", transform: "translateX(-50%)", fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: "#fff", whiteSpace: "nowrap" }}>{fmt(j.now)}</div>
                        <div style={{ position: "absolute", left: `${pos(j.goal)}%`, top: "50%", transform: "translate(-50%,-50%)", width: 13, height: 13, borderRadius: 99, background: "#0d1411", border: `3px solid ${GOAL}`, boxShadow: `0 0 8px ${GOAL}` }} />
                        <div style={{ position: "absolute", left: `${pos(j.goal)}%`, top: "-2px", transform: "translateX(-50%)", fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: GOAL, whiteSpace: "nowrap" }}>{fmt(j.goal)}{j.unit === "%" ? "%" : ""}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel style={{ borderColor: "rgba(139,233,255,0.25)" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: GOAL, marginBottom: 12 }}>THE PLAN, IN ONE PARAGRAPH</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: "rgba(255,255,255,0.82)" }}>
                You start from a strong base — muscle, protein and water already sit above range. So this is mostly a <b style={{ color: GOAL }}>fat-loss job with muscle protected</b>: drop ~15 kg of fat and add ~2 kg of muscle to land near <b style={{ color: GOAL }}>70 kg at 10%</b>. Honest expectation — gaining muscle while in a deficit is slow, so if the scale shows muscle simply <i>holding</i> while fat falls, that&apos;s a win, not a miss. The biggest health payoff lands early: getting under ~20% body fat already pulls your visceral fat out of the danger zone. Treat 15% as the health milestone and 10% as the aesthetic stretch. Realistic horizon at a sustainable ~0.5 kg/week: <b>roughly 9–12 months</b> of consistent training and eating, not a sprint.
              </p>
            </Panel>

            <Panel>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>NOTE ON THE &quot;OPTIMAL&quot; BANDS</div>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "rgba(255,255,255,0.6)" }}>At a true 10%, several fat targets land <i>below</i> the device&apos;s green band — that band is calibrated for the general population, so a lean athlete reading &quot;low&quot; on fat is expected and fine. Toggle to <b style={{ color: GOAL }}>GOAL</b> and watch the ring markers move past the band on the fat metrics.</p>
            </Panel>
          </div>
        )}

        {/* ============ COMPOSITION ============ */}
        {tab === "composition" && (
          <div className="rise">
            <SectionTitle>Composition · Now → Goal</SectionTitle>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: -8, marginBottom: 16, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "rgba(255,255,255,0.5)" }}>
              <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, border: "2px solid rgba(255,255,255,0.4)", marginRight: 5, verticalAlign: "middle" }} />Dec &apos;24</span>
              <span><span style={{ display: "inline-block", width: 11, height: 11, borderRadius: 99, background: "#f5b94a", marginRight: 5, verticalAlign: "middle" }} />Now</span>
              <span><span style={{ display: "inline-block", width: 11, height: 11, borderRadius: 99, border: `3px solid ${GOAL}`, marginRight: 5, verticalAlign: "middle" }} />Goal</span>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {composition.map((m) => (
                <Panel key={m.id} style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{m.label}</div>
                      <ValueArrow cur={m.cur} tgt={m.tgt} unit={m.unit} good={m.good} mode={mode} />
                    </div>
                    <Pill rating={m.rating} />
                  </div>
                  <RangeBar cur={m.cur} tgt={m.tgt} past={m.past} low={m.low} high={m.high} unit={m.unit === "%" ? "%" : ""} rating={m.rating} mode={mode} />
                </Panel>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, marginTop: 16 }}>
              <Panel>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>WHERE THE FAT GOES</div>
                {fatDetail.map((f) => {
                  const v = mode === "goal" ? f.tgt : f.cur;
                  const w = (v / 22.4) * 100;
                  return (
                    <div key={f.label} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}>
                        <span style={{ color: "rgba(255,255,255,0.7)" }}>{f.label}</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#fff" }}>{fmt(f.cur)} <span style={{ color: GOAL }}>→ {fmt(f.tgt)}</span> kg</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <div style={{ width: `${w}%`, height: "100%", background: mode === "goal" ? GOAL : "linear-gradient(90deg,#f5b94a,#f59e4a)", borderRadius: 99, transition: "width .9s cubic-bezier(.2,.9,.2,1), background .3s" }} />
                      </div>
                    </div>
                  );
                })}
              </Panel>
              <Panel>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>BODY WATER · ICF / ECF</div>
                <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ width: `${mode === "goal" ? fluids.icfPct.tgt : fluids.icfPct.cur}%`, background: "linear-gradient(90deg,#34e0a1,#2fc88f)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#06120d", fontWeight: 600, transition: "width .9s" }}>{mode === "goal" ? fluids.icfPct.tgt : fluids.icfPct.cur}%</div>
                  <div style={{ flex: 1, background: "rgba(124,196,255,0.45)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#06120d", fontWeight: 600 }}>{mode === "goal" ? fluids.ecfPct.tgt : fluids.ecfPct.cur}%</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>
                  <span>ICF · {fmt(mode === "goal" ? fluids.icf.tgt : fluids.icf.cur)} kg</span>
                  <span>ECF · {fmt(mode === "goal" ? fluids.ecf.tgt : fluids.ecf.cur)} kg</span>
                </div>
                <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", marginTop: 12, marginBottom: 0, lineHeight: 1.5 }}>Nudging the split toward intracellular (66→67%) reflects more muscle and good cell quality.</p>
              </Panel>
            </div>
          </div>
        )}

        {/* ============ SEGMENTAL ============ */}
        {tab === "segmental" && (
          <div className="rise">
            <SectionTitle n="18">Segmental · Now → Goal</SectionTitle>
            <div className="split2 start">
              <Panel>
                <BodyMap selected={seg} onSelect={(k) => setSeg(k)} />
                <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 14, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "rgba(255,255,255,0.5)", flexWrap: "wrap" }}>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: "rgba(245,185,74,0.7)", marginRight: 5 }} />High fat now</span>
                  <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 99, background: GOAL, marginRight: 5 }} />Selected</span>
                </div>
                <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 10, marginBottom: 0 }}>Tap a region · color shows current fat load</p>
              </Panel>

              <div style={{ display: "grid", gap: 14 }}>
                <Panel>
                  <h3 style={{ margin: "0 0 16px", fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 24, fontWeight: 700 }}>{s.name}</h3>
                  {[["Lean Mass", s.lean, "up"], ["Fat Mass", s.fat, "down"]].map(([k, d, good]) => {
                    const r = d.cur > d.high ? "high" : d.cur < d.low ? "low" : "optimal";
                    return (
                      <div key={k} style={{ marginBottom: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>{k}</div>
                            <ValueArrow cur={d.cur} tgt={d.tgt} unit="kg" good={good} mode={mode} />
                          </div>
                          <Pill rating={r} />
                        </div>
                        <RangeBar cur={d.cur} tgt={d.tgt} past={d.past} low={d.low} high={d.high} rating={r} mode={mode} />
                      </div>
                    );
                  })}
                </Panel>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 14 }}>
                  <Panel>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)" }}>ABDOMINAL CIRC.</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: "rgba(255,255,255,0.45)" }}>{balance.abdominal.cur}</span>
                      <span style={{ color: GOAL }}>→</span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 600, color: GOAL }}>{balance.abdominal.tgt}<span style={{ fontSize: 11 }}> cm</span></span>
                    </div>
                  </Panel>
                  <Panel>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)" }}>WAIST-TO-HIP</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: "rgba(255,255,255,0.45)" }}>{balance.whr.cur}</span>
                      <span style={{ color: GOAL }}>→</span>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 600, color: GOAL }}>{balance.whr.tgt}</span>
                    </div>
                  </Panel>
                </div>
                <Panel style={{ padding: 16 }}>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.6)" }}>Lean mass per limb stays roughly flat or nudges up — you keep the muscle. The whole move is in the <b style={{ color: GOAL }}>fat rows</b>, and the torso carries the most (13.4 → 4.2 kg), which is also where the visceral fat lives.</p>
                </Panel>
              </div>
            </div>
          </div>
        )}

        {/* ============ NUTRITION ============ */}
        {tab === "nutrition" && (
          <div className="rise">
            <SectionTitle n="21–24">Nutrition · Fat-Loss Phase</SectionTitle>
            <Panel style={{ marginBottom: 16, borderColor: "rgba(245,185,74,0.25)", padding: 16 }}>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "rgba(255,255,255,0.7)" }}>The Evolt machine recommended a <b>surplus</b> (~3,000 kcal) because it assumed a muscle-gain goal. Your goal is the opposite — strip fat while holding muscle — so these targets flip to a <b style={{ color: GOAL }}>moderate deficit with high protein</b>. Toggle NOW/GOAL to compare. Numbers are a starting frame; adjust by your weekly rate of loss, and a dietitian can personalise them.</p>
            </Panel>
            <div className="split2 center">
              <Panel style={{ position: "relative" }}>
                <div style={{ height: 230 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={macroData} dataKey="value" innerRadius={62} outerRadius={92} paddingAngle={3} startAngle={90} endAngle={-270} stroke="none">
                        {macroData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 26, fontWeight: 600, color: mode === "goal" ? GOAL : "#fff" }}>{kcal[0]}</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>–{kcal[1]} kcal</div>
                </div>
              </Panel>
              <div style={{ display: "grid", gap: 12 }}>
                {[["Protein", nutrition.protein, "Hold high to protect muscle in a deficit"], ["Carbohydrates", nutrition.carbs, "Fuel training; the main lever you cut"], ["Fat", nutrition.fat, "Keep adequate for hormones"]].map(([name, m, note]) => (
                  <Panel key={name} style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600 }}><span style={{ width: 11, height: 11, borderRadius: 99, background: m.color }} />{name}</span>
                      <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{m.cur[0]}–{m.cur[1]}</span>
                        <span style={{ color: GOAL }}>→</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 600, color: GOAL }}>{m.tgt[0]}–{m.tgt[1]}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}> g</span></span>
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)" }}>{note} · {m.pct}% of intake</div>
                  </Panel>
                ))}
              </div>
            </div>
            <Panel style={{ marginTop: 16 }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>SUGGESTED SUPPLEMENTS</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {supplements.map((x) => <span key={x} style={{ padding: "10px 16px", borderRadius: 99, border: "1px solid rgba(52,224,161,0.3)", background: "rgba(52,224,161,0.08)", fontSize: 13.5, color: "#bff3df" }}>{x}</span>)}
              </div>
            </Panel>
          </div>
        )}

        {/* ============ TRAINING ============ */}
        {tab === "training" && (
          <div className="rise" style={{ display: "grid", gap: 18 }}>
            <SectionTitle>4-Month Training Plan</SectionTitle>

            <Panel style={{ borderColor: "rgba(52,224,161,0.25)" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "#34e0a1", marginBottom: 8 }}>MY PICK</div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "clamp(20px,4vw,26px)", fontWeight: 700, color: "#fff", marginBottom: 14, letterSpacing: "-0.01em" }}>{splitVerdict.pick}</div>
              <div style={{ display: "grid", gap: 9, marginBottom: 16 }}>
                {splitVerdict.why.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.5, color: "rgba(255,255,255,0.78)" }}>
                    <span style={{ color: "#34e0a1", flexShrink: 0 }}>✓</span><span>{w}</span>
                  </div>
                ))}
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", borderLeft: "2px solid rgba(255,255,255,0.12)", paddingLeft: 12 }}>
                <b style={{ color: "rgba(255,255,255,0.72)" }}>On your idea — </b>{splitVerdict.alt}
              </p>
            </Panel>

            <Panel>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>WEEKLY SHAPE · tap a day</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 6 }}>
                {weekPlan.map((p) => {
                  const rest = p.w === "Rest";
                  const active = !rest && p.w === wkday;
                  return (
                    <button key={p.d} onClick={() => !rest && setWkday(p.w)} style={{ cursor: rest ? "default" : "pointer", border: active ? "1px solid rgba(52,224,161,0.3)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "12px 4px", textAlign: "center", background: active ? "linear-gradient(180deg,#48f0b0,#2fc88f)" : rest ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: active ? "0 4px 14px rgba(52,224,161,0.25), inset 0 1px 0 rgba(255,255,255,0.3)" : "inset 0 1px 0 rgba(255,255,255,0.03)", transition: "all .2s" }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: active ? "#06120d" : "rgba(255,255,255,0.45)", marginBottom: 4 }}>{p.d}</div>
                      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 12.5, fontWeight: 700, color: active ? "#06120d" : rest ? "rgba(255,255,255,0.3)" : "#fff" }}>{p.w}</div>
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel>
              <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                {["Push", "Pull", "Legs"].map((w) => (
                  <button key={w} onClick={() => setWkday(w)} style={{ flex: "1 1 auto", padding: "10px 16px", borderRadius: 14, border: wkday === w ? "1px solid rgba(52,224,161,0.35)" : "1px solid rgba(255,255,255,0.07)", cursor: "pointer", background: wkday === w ? "rgba(52,224,161,0.1)" : "rgba(255,255,255,0.02)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", color: wkday === w ? "#34e0a1" : "rgba(255,255,255,0.55)", fontFamily: "'Spline Sans', sans-serif", fontSize: 14, fontWeight: 600, boxShadow: wkday === w ? "0 4px 12px rgba(52,224,161,0.15), inset 0 1px 0 rgba(52,224,161,0.1)" : "inset 0 1px 0 rgba(255,255,255,0.03)", transition: "all .25s" }}>{w}</button>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 700 }}>{wkday === "Rest" ? "Rest" : wkday + " Day"}</h3>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{(workouts[wkday] || workouts.Push).sub}</div>
              </div>
              {wkday === "Rest" ? (
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.6 }}>Full rest, or an easy 30–45 min walk if you want extra steps. Recovery is when the muscle actually rebuilds — don&apos;t skip it.</p>
              ) : (
                <>
                  <div style={{ display: "grid", gap: 10 }}>
                    {(workouts[wkday] || workouts.Push).items.map((ex, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 16, boxShadow: "0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: "#06120d", background: "#34e0a1", width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
                              <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{ex.n}</span>
                              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 600, color: "#34e0a1", whiteSpace: "nowrap" }}>{ex.s}</span>
                            </div>
                            <span style={{ display: "inline-block", marginTop: 7, marginBottom: 9, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".05em", color: "rgba(139,233,255,0.9)", background: "rgba(139,233,255,0.1)", border: "1px solid rgba(139,233,255,0.25)", padding: "2px 9px", borderRadius: 99 }}>{ex.t}</span>
                            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.6)" }}>{ex.h}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 14, marginBottom: 0, lineHeight: 1.5 }}>{coreNote}</p>
                </>
              )}
            </Panel>

            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>16-WEEK PROGRESSION · tap a block</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: 14 }}>
                {blocks.map((b) => (
                  <button key={b.id} onClick={() => setBlock(b.id)} style={{ cursor: "pointer", textAlign: "left", border: block === b.id ? `1px solid ${b.color}55` : "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 14, background: block === b.id ? `${b.color}0d` : "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", boxShadow: block === b.id ? `0 4px 16px ${b.color}22, inset 0 1px 0 ${b.color}18` : "inset 0 1px 0 rgba(255,255,255,0.03)", transition: "all .25s" }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{b.weeks}</div>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 700, color: block === b.id ? b.color : "#fff", marginTop: 2 }}>{b.name}</div>
                  </button>
                ))}
              </div>
              {blocks.filter((b) => b.id === block).map((b) => (
                <Panel key={b.id} style={{ borderColor: `${b.color}33` }}>
                  <p style={{ margin: "0 0 16px", fontSize: 14.5, lineHeight: 1.6, color: "rgba(255,255,255,0.8)" }}>{b.focus}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12 }}>
                    {[["INTENSITY", b.intensity], ["LISS CARDIO", b.liss], ["HIIT", b.hiit]].map(([k, v]) => (
                      <div key={k} style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "12px 14px", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".1em", color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>{k}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </Panel>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14 }}>
              {[cardioPlan.pre, cardioPlan.post].map((c, idx) => (
                <Panel key={idx} style={{ borderColor: `${c.accent}33` }}>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".1em", color: c.accent, marginBottom: 12 }}>{c.title}</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {c.lines.map((l, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.55, color: "rgba(255,255,255,0.72)" }}>
                        <span style={{ color: c.accent, flexShrink: 0 }}>—</span><span>{l}</span>
                      </div>
                    ))}
                  </div>
                </Panel>
              ))}
            </div>

            <Panel>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>This is a general, well-established training framework, not personalised medical or coaching advice. If you have injuries or health conditions, clear it with a doctor or qualified coach first, and back off anything that causes joint pain.</p>
            </Panel>
          </div>
        )}

        {/* ============ TRACKER ============ */}
        {tab === "tracker" && (
          <div className="rise" style={{ display: "grid", gap: 18 }}>
            <SectionTitle>Tracker · Log &amp; Pace</SectionTitle>

            <Panel>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)" }}>SELECT WEEK · 16-week cut</div>
                {!loaded && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>loading saved data…</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8,minmax(0,1fr))", gap: 6 }}>
                {weightSchedule.map((r) => (
                  <button key={r.week} onClick={() => setTrkWeek(r.week)} style={{ padding: "10px 0", borderRadius: 12, border: trkWeek === r.week ? "1px solid rgba(139,233,255,0.3)" : "1px solid rgba(255,255,255,0.06)", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 13, color: trkWeek === r.week ? "#06120d" : "rgba(255,255,255,0.55)", background: trkWeek === r.week ? GOAL : "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: trkWeek === r.week ? `0 4px 14px ${GOAL}33, inset 0 1px 0 rgba(255,255,255,0.3)` : "inset 0 1px 0 rgba(255,255,255,0.03)", transition: "all .2s" }}>{r.week}</button>
                ))}
              </div>
            </Panel>

            <Panel>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>WEEK {trkWeek} · WEIGH-IN</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>Monday — target <b style={{ color: GOAL }}>{wkSched.mon} kg</b></div>
                  <input type="number" inputMode="decimal" placeholder={String(wkSched.mon)} value={weighins[wkKey] && num(weighins[wkKey].mon) ? weighins[wkKey].mon : ""} onChange={(e) => setWeigh("mon", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>Saturday (post-workout) — target <b style={{ color: GOAL }}>{wkSched.sat} kg</b></div>
                  <input type="number" inputMode="decimal" placeholder={String(wkSched.sat)} value={weighins[wkKey] && num(weighins[wkKey].sat) ? weighins[wkKey].sat : ""} onChange={(e) => setWeigh("sat", e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>Target drop this week</div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 600, color: "#34e0a1" }}>−{wkSched.loss} kg</div>
                </div>
              </div>
              {(() => {
                const wi = weighins[wkKey] || {};
                if (!num(wi.mon) || !num(wi.sat)) return null;
                const drop = +(wi.mon - wi.sat).toFixed(1);
                const vs = +(drop - wkSched.loss).toFixed(1);
                const good = drop >= wkSched.loss - 0.2;
                return (
                  <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, background: good ? "rgba(52,224,161,0.1)" : "rgba(245,185,74,0.1)", border: `1px solid ${good ? "rgba(52,224,161,0.3)" : "rgba(245,185,74,0.3)"}`, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
                    Actual drop <b>{drop} kg</b> — {vs >= 0 ? <span style={{ color: "#34e0a1" }}>{vs === 0 ? "right on target" : `${Math.abs(vs)} kg ahead of target`}</span> : <span style={{ color: "#f5b94a" }}>{Math.abs(vs)} kg behind target</span>}
                  </div>
                );
              })()}
            </Panel>

            <Panel>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>WEIGHT · TARGET vs ACTUAL</div>
              <div style={{ display: "flex", gap: 16, marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                <span><span style={{ display: "inline-block", width: 14, height: 0, borderTop: "2px dashed #8be9ff", verticalAlign: "middle", marginRight: 5 }} />Target</span>
                <span><span style={{ display: "inline-block", width: 14, height: 0, borderTop: "2px solid #34e0a1", verticalAlign: "middle", marginRight: 5 }} />Your actual</span>
              </div>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paceData} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[68, 84]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "#0d1411", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 12 }} labelStyle={{ color: "#fff" }} labelFormatter={(w) => `Week ${w}`} />
                    <Line type="monotone" dataKey="target" stroke="#8be9ff" strokeWidth={2} dot={false} strokeDasharray="5 4" />
                    <Line type="monotone" dataKey="actual" stroke="#34e0a1" strokeWidth={2.5} dot={{ r: 3, fill: "#34e0a1" }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {pace && (() => {
                let msg, col;
                if (pace.pctLoss > 1.1) { col = "#f5b94a"; msg = `You're dropping about ${pace.pctLoss}% of bodyweight a week — faster than ideal. To protect the muscle you're working to keep, add roughly 150 kcal (mostly carbs) and hold cardio where it is.`; }
                else if (pace.diff <= -0.3) { col = "#34e0a1"; msg = `Ahead of target by ${Math.abs(pace.diff)} kg through week ${pace.week}. Looking good — keep the current plan, no need to cut harder.`; }
                else if (pace.diff >= 0.3) { col = "#f5b94a"; msg = `Behind target by ${pace.diff} kg at week ${pace.week}. Easiest first move: add 10–15 min to your post-lift LISS. If it's still stuck next week, trim ~150 kcal from carbs before cutting anything else.`; }
                else { col = "#34e0a1"; msg = `Right on pace through week ${pace.week}. Keep everything exactly where it is.`; }
                return (
                  <div style={{ marginTop: 12, padding: 14, borderRadius: 12, background: `${col}12`, border: `1px solid ${col}33` }}>
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".12em", color: col, marginBottom: 6 }}>PACE CHECK</div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.82)" }}>{msg}</div>
                  </div>
                );
              })()}
              {!pace && <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", marginTop: 10, marginBottom: 0 }}>Log a Saturday weight to see your pace line and get a recommendation.</p>}
            </Panel>

            <Panel>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)" }}>WEEK {trkWeek} · EXERCISE LOG</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["Push", "Pull", "Legs"].map((d) => (
                    <button key={d} onClick={() => setLogDay(d)} style={{ padding: "7px 14px", borderRadius: 12, border: logDay === d ? "1px solid rgba(52,224,161,0.3)" : "1px solid rgba(255,255,255,0.06)", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "'Spline Sans', sans-serif", color: logDay === d ? "#06120d" : "rgba(255,255,255,0.55)", background: logDay === d ? "#34e0a1" : "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", boxShadow: logDay === d ? "0 3px 12px rgba(52,224,161,0.2), inset 0 1px 0 rgba(255,255,255,0.3)" : "inset 0 1px 0 rgba(255,255,255,0.03)", transition: "all .2s" }}>{d}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {workouts[logDay].items.map((ex, i) => {
                  const cell = (exlog[wkKey] && exlog[wkKey][logDay] && exlog[wkKey][logDay][i]) || {};
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 84px 70px", gap: 9, alignItems: "center", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "10px 12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.n}</div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>{ex.s}</div>
                      </div>
                      <input type="number" inputMode="decimal" placeholder="kg" value={num(cell.wt) ? cell.wt : ""} onChange={(e) => setEx(logDay, i, "wt", e.target.value)} style={inputStyle} />
                      <input type="number" inputMode="numeric" placeholder="reps" value={num(cell.reps) ? cell.reps : ""} onChange={(e) => setEx(logDay, i, "reps", e.target.value)} style={inputStyle} />
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", marginTop: 10, marginBottom: 0 }}>Log the weight and reps of your top working set each session. Aim to beat last week&apos;s number on at least one set — that&apos;s progressive overload.</p>
            </Panel>

            <Panel>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>WEEK {trkWeek} · CARDIO LOG · minutes</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>Pre = warm-up (5–10) · Post = fat-loss LISS (20–35)</div>
              <div style={{ display: "grid", gap: 8 }}>
                {dayLabels.map((dl, i) => {
                  const cell = (cardioLog[wkKey] && cardioLog[wkKey].sessions && cardioLog[wkKey].sessions[i]) || {};
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 78px 78px", gap: 9, alignItems: "center", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "10px 12px", boxShadow: "0 2px 10px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.04)" }}>
                      <div style={{ minWidth: 0 }}><span style={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}>{dl}</span> <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{sessionDays[i]}</span></div>
                      <input type="number" inputMode="numeric" placeholder="pre" value={num(cell.pre) ? cell.pre : ""} onChange={(e) => setCard(i, "pre", e.target.value)} style={inputStyle} />
                      <input type="number" inputMode="numeric" placeholder="post" value={num(cell.post) ? cell.post : ""} onChange={(e) => setCard(i, "post", e.target.value)} style={inputStyle} />
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel style={{ borderColor: "rgba(139,233,255,0.25)" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".14em", color: GOAL, marginBottom: 10 }}>SAVE &amp; SYNC</div>
              <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.6, color: "rgba(255,255,255,0.72)" }}>Everything you type saves automatically and will still be here next time you open this. To loop me in: <b>Export</b> the JSON, commit it to a public GitHub repo, and send me the raw link — or just <b>Copy</b> it and paste it back to me. I&apos;ll read it and re-tune your weight curve, calories and cardio to your real pace.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                <button onClick={exportData} style={btn(GOAL)}>↓ Export JSON</button>
                <button onClick={copyData} style={btnGhost}>Copy JSON</button>
              </div>
              <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste a previous export here to restore your data…" rows={3} style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, resize: "vertical" }} />
              <button onClick={importData} style={{ ...btnGhost, marginTop: 10 }}>↑ Import</button>
              <p style={{ margin: "14px 0 0", fontSize: 12, lineHeight: 1.55, color: "rgba(255,255,255,0.45)" }}>I can&apos;t push to your GitHub or deploy on my own — I don&apos;t have access to your account, and a browser page can&apos;t safely write to GitHub by itself. The export / raw-link loop above is what actually works. Want this as a live site on your Vercel? Say so and I&apos;ll prep a standalone build for you to deploy.</p>
            </Panel>
          </div>
        )}

        {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "rgba(10,20,16,0.7)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(52,224,161,0.3)", color: "#bff3df", padding: "12px 22px", borderRadius: 99, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", zIndex: 50, boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(52,224,161,0.1)" }}>{toast}</div>}

        <footer style={{ marginTop: 34, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "rgba(255,255,255,0.3)" }}>
          <span>Targets computed from baseline scan · not medical advice</span>
          <span>{profile.site}</span>
        </footer>
      </div>
    </div>
  );
}
