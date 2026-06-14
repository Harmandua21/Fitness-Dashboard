import React, { useState, useEffect, useRef, useCallback } from "react";

// ============================================================================
// DATA -- Evolt 360 scan (Harman, 29-05-2026) + computed 10% / more-muscle goal
// ============================================================================
const profile = {
  name: "Harman", date: "29 May 2026 · 13:47", gender: "Male", age: 30, height: 170,
  curWeight: 82.5, tgtWeight: 70.0, site: "Anytime Fitness · Shastri Nagar, Meerut",
};

const composition = [
  { id: 2, label: "Skeletal Muscle Mass", unit: "kg", past: 29.2, cur: 33.2, tgt: 35.0, low: 26.4, high: 32.3, rating: "high", good: "up" },
  { id: 1, label: "Lean Body Mass", unit: "kg", past: 52.8, cur: 60.1, tgt: 63.0, low: 47.3, high: 57.8, rating: "high", good: "up" },
  { id: 3, label: "Protein", unit: "kg", past: 10.7, cur: 12.1, tgt: 12.7, low: 9.5, high: 11.7, rating: "high", good: "up" },
  { id: 5, label: "Total Body Water", unit: "kg", past: 38.0, cur: 43.3, tgt: 45.4, low: 34.5, high: 42.2, rating: "high", good: "up" },
  { id: 4, label: "Mineral", unit: "kg", past: 4.1, cur: 4.7, tgt: 4.8, low: 3.2, high: 4.0, rating: "high", good: "flat" },
  { id: 10, label: "Total Body Fat", unit: "%", past: 26.0, cur: 27.2, tgt: 10.0, low: 15, high: 20, rating: "high", good: "down" },
  { id: 6, label: "Body Fat Mass", unit: "kg", past: 18.6, cur: 22.4, tgt: 7.0, low: 8.9, high: 13.3, rating: "high", good: "down" },
  { id: 9, label: "Visceral Fat Area", unit: "cm2", past: 86, cur: 96, tgt: 40, low: 50, high: 100, rating: "optimal", good: "down" },
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

const balance = { abdominal: { cur: 96.3, tgt: 80 }, whr: { cur: 0.86, tgt: 0.80 } };

const nutrition = {
  calories: { cur: [2968, 3068], tgt: [2000, 2100] },
  protein: { cur: [223, 230], tgt: [180, 190], pct: 37, key: "good" },
  carbs: { cur: [334, 345], tgt: [170, 185], pct: 34, key: "accent" },
  fat: { cur: [82, 85], tgt: [60, 70], pct: 29, key: "warn" },
};

const supplements = ["Isopure Zero Carb Isolate", "Creatine Monohydrate (5g/day)", "BCAAs (intra-workout)"];

const WEEK1_MONDAY = new Date(2026, 5, 15);
const weekLabel = (wk) => {
  const d = new Date(WEEK1_MONDAY);
  d.setDate(d.getDate() + (wk - 1) * 7);
  const mon = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const sat = new Date(d); sat.setDate(sat.getDate() + 5);
  const satStr = sat.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${mon} – ${satStr}`;
};

// ------------------------------------------------------------------ MEAL PLAN
const mealPlan = {
  protein: {
    title: "PROTEIN — 180–190 g/day",
    note: "High protein protects muscle during the deficit. Spread across 4–5 meals for best absorption.",
    items: [
      { food: "Isopure Zero Carb Isolate", qty: "2 scoops (60g powder)", grams: "50g protein", cal: "~220 kcal", when: "Both scoops post-workout at 11:30 AM — blended with 1 banana + 1 apple + Creatine HCL + water/ice", tip: "Zero carbs, zero fat from the powder — the fruit adds the carbs your muscles need post-workout. Taking both scoops together is fine; the shake + fruit combo gives you 50g protein and ~48g fast carbs right when your body absorbs them best." },
      { food: "Chicken breast (boneless)", qty: "250g cooked", grams: "78g protein", cal: "~410 kcal", when: "Split across lunch & dinner (125g each)", tip: "Grilled, air-fried or tandoori. Avoid deep frying — that turns lean protein into a fat bomb." },
      { food: "Whole eggs", qty: "2", grams: "12g protein — 10g fat", cal: "~140 kcal", when: "Breakfast — boiled or scrambled in minimal oil", tip: "Yolks are fine — they carry the vitamin D, B12 and healthy fats. 2 per day keeps fat in budget." },
      { food: "Egg whites", qty: "4 extra whites", grams: "14g protein — 0 fat", cal: "~60 kcal", when: "With the 2 whole eggs at breakfast", tip: "Pure protein. Buy liquid carton whites or separate at home." },
      { food: "Paneer (low-fat)", qty: "50g", grams: "9g protein — 6g fat", cal: "~100 kcal", when: "Snack or in a sabzi", tip: "Optional swap for chicken at one meal. Count the fat." },
      { food: "Curd / Greek yogurt", qty: "200g (low-fat)", grams: "12g protein", cal: "~120 kcal", when: "Post-lunch or as raita", tip: "Probiotics help digestion on high-protein diets." },
    ],
    total: "~175g from these sources + ~10–15g incidental from dal, roti, rice = 185–190g",
  },
  carbs: {
    title: "CARBOHYDRATES — 170–185 g/day",
    note: "Time most carbs around training (pre- and post-workout meals). Cut carbs at dinner if fat loss stalls.",
    items: [
      { food: "Oats (rolled)", qty: "50g dry", grams: "30g carbs — 5g fiber", cal: "~190 kcal", when: "Breakfast — with water/milk, egg whites mixed in", tip: "Slow-digesting, keeps you full. Add cinnamon, not sugar." },
      { food: "Brown / white rice", qty: "60g dry (~150g cooked)", grams: "45g carbs", cal: "~210 kcal", when: "Post-workout lunch", tip: "White rice is fine post-workout — it digests fast and refuels glycogen. Brown rice for other meals." },
      { food: "Whole wheat roti", qty: "2 medium (30g atta each)", grams: "40g carbs — 4g fiber", cal: "~200 kcal", when: "Dinner", tip: "Stick to 2 max. Multigrain atta is a good upgrade." },
      { food: "Moong dal / Toor dal", qty: "50g dry (~150g cooked)", grams: "28g carbs — 12g protein — 5g fiber", cal: "~170 kcal", when: "Lunch or dinner — dal with rice or roti", tip: "Moong is lightest on digestion. Toor has slightly more protein. Rotate both." },
      { food: "Sweet potato", qty: "150g", grams: "30g carbs — 3g fiber", cal: "~130 kcal", when: "Pre-workout meal (swap for rice that day)", tip: "Better micronutrient profile than rice. Boil or roast — don’t fry." },
      { food: "Banana", qty: "1 medium", grams: "27g carbs", cal: "~105 kcal", when: "Pre-workout or post-workout with shake", tip: "Quick energy. Great in the Isopure shake." },
    ],
    total: "Pick combinations that total 170–185g. A typical day: oats + rice + 2 roti + dal + banana = ~170g",
  },
  fats: {
    title: "FATS — 60–70 g/day",
    note: "Fat is essential for hormones (especially testosterone). Don’t go below 55g. Prioritise mono/polyunsaturated sources.",
    items: [
      { food: "Whole eggs (2)", qty: "counted above", grams: "10g fat", cal: "—", when: "Breakfast", tip: "Already counted in protein. Don’t double-count calories." },
      { food: "Almonds", qty: "10–12 nuts", grams: "7g fat — 3g protein", cal: "~80 kcal", when: "Mid-morning snack", tip: "Mono-unsaturated — heart-healthy. Pre-count and bag them so you don’t overeat." },
      { food: "Peanut butter (natural)", qty: "1 tbsp (15g)", grams: "8g fat — 4g protein", cal: "~95 kcal", when: "With oats at breakfast or on a roti", tip: "No added sugar or hydrogenated oil — read the label. Just peanuts + salt." },
      { food: "Ghee", qty: "1 tsp (5g)", grams: "5g fat", cal: "~45 kcal", when: "On dal or roti", tip: "Small amount for flavour and fat-soluble vitamin absorption. Don’t pour — measure." },
      { food: "Olive / coconut oil", qty: "2 tsp for cooking", grams: "10g fat", cal: "~90 kcal", when: "Cooking lunch & dinner", tip: "Use a spray bottle or measure with a spoon. Eyeballing oil is the #1 hidden calorie source." },
      { food: "Flaxseed (ground)", qty: "1 tbsp (10g)", grams: "4g fat — 3g fiber", cal: "~55 kcal", when: "Mix into oats or curd", tip: "Omega-3 source. Grind fresh or buy ground — whole seeds pass through undigested." },
    ],
    total: "~44g from listed sources + ~16–20g incidental from chicken, dal, roti = 60–65g",
  },
  fiber: {
    title: "FIBER — 28–35 g/day",
    note: "Critical for gut health and satiety during a deficit. Ramp up slowly to avoid bloating — add 5g/week if you’re currently low.",
    items: [
      { food: "Isabgol (psyllium husk)", qty: "1 tbsp (5g)", grams: "5g soluble fiber", cal: "~10 kcal", when: "Before bed in water", tip: "Soluble fiber — forms a gel, slows digestion, great for satiety. Drink immediately — it thickens fast." },
      { food: "Oats", qty: "from breakfast", grams: "5g fiber", cal: "—", when: "Already counted", tip: "Beta-glucan fiber specifically lowers cholesterol." },
      { food: "Dal / lentils", qty: "from meals", grams: "5–6g fiber", cal: "—", when: "Already counted", tip: "Split dals have less fiber than whole — use whole moong or masoor occasionally." },
      { food: "Mixed vegetables", qty: "300g/day", grams: "8g fiber", cal: "~80 kcal", when: "Lunch + dinner sabzi", tip: "Broccoli, spinach, capsicum, beans, lauki, tinda, karela — rotate. Volume is high, calories are low." },
      { food: "Fruit (apple/guava)", qty: "1 medium", grams: "4g fiber", cal: "~80 kcal", when: "Afternoon snack", tip: "Eat whole, don’t juice — juicing strips the fiber." },
    ],
    total: "~28–30g/day from these sources. Add chickpeas or rajma on non-chicken days to push toward 35g.",
  },
  legumes: {
    title: "DAL & LEGUME OPTIONS — rotate through the week",
    note: "All cooked from 50g dry weight. Swap one dal variety per day for variety. Chickpeas and rajma count as both carb + protein.",
    items: [
      { food: "Moong dal (yellow split)", qty: "50g dry", grams: "12g protein — 28g carbs — 4g fiber", cal: "~170 kcal", when: "Daily staple — lightest on digestion", tip: "Best for daily use. Quick to cook, pairs with everything." },
      { food: "Toor / Arhar dal", qty: "50g dry", grams: "11g protein — 30g carbs — 5g fiber", cal: "~175 kcal", when: "2–3×/week", tip: "Classic sambar/dal fry dal. Slightly richer than moong." },
      { food: "Masoor dal (red lentils)", qty: "50g dry", grams: "12g protein — 28g carbs — 4g fiber", cal: "~170 kcal", when: "2–3×/week", tip: "Cooks fastest. Mild taste, great in soups." },
      { food: "Chana dal (split chickpea)", qty: "50g dry", grams: "10g protein — 30g carbs — 6g fiber", cal: "~180 kcal", when: "1–2×/week", tip: "Low glycemic index — keeps blood sugar stable. Good for dinner." },
      { food: "Chole (whole chickpeas)", qty: "80g cooked (~30g dry)", grams: "7g protein — 22g carbs — 6g fiber", cal: "~130 kcal", when: "1–2×/week — swap for rice that meal", tip: "High fiber, very filling. Count as carbs not just protein. Great in salads." },
      { food: "Rajma (kidney beans)", qty: "80g cooked (~30g dry)", grams: "8g protein — 20g carbs — 6g fiber", cal: "~120 kcal", when: "1×/week with rice", tip: "Classic rajma-chawal — just watch portion size. Very filling." },
      { food: "Soybean chunks (Nutrela)", qty: "30g dry", grams: "15g protein — 8g carbs — 4g fiber — 3g fat", cal: "~110 kcal", when: "1–2×/week as chicken substitute", tip: "Highest protein legume, but also has fat. Soak 15min, squeeze dry, cook in gravy. Use as a chicken-off-day option." },
    ],
    total: "Rotate 1 dal/legume per meal. On non-chicken days, combine 2 legume sources to hit protein.",
  },
  sample: {
    title: "YOUR SAMPLE DAY — ~2,050 kcal",
    meals: [
      { time: "7:30 AM", meal: "Breakfast", items: "40g oats (cooked in water) + 2 whole eggs + 3 egg whites scrambled in ½ tsp coconut oil + 1 tbsp peanut butter + black coffee", macros: "P: 33g — C: 28g — F: 18g — ~400 kcal" },
      { time: "9:30 AM", meal: "Training", items: "BCAAs sipped intra-workout — water", macros: "" },
      { time: "11:30 AM", meal: "Post-workout shake", items: "2 scoops Isopure Zero Carb Isolate + 1 banana + 1 apple + Creatine HCL — blended with water & ice", macros: "P: 50g — C: 48g — F: 0g — ~405 kcal" },
      { time: "1:30 PM", meal: "Lunch", items: "120g cooked rice (45g dry) + 125g chicken breast (grilled / tandoori) + 150g cooked moong dal + sabzi (150g mixed veg in 1 tsp ghee)", macros: "P: 50g — C: 55g — F: 12g — ~530 kcal" },
      { time: "5:00 PM", meal: "Snack", items: "200g low-fat curd + 10 almonds + 1 tbsp ground flaxseed", macros: "P: 16g — C: 10g — F: 14g — ~220 kcal" },
      { time: "8:30 PM", meal: "Dinner", items: "2 whole wheat roti + 125g chicken breast + sabzi (150g veg) + raita (100g curd) + 1 tsp olive oil for cooking", macros: "P: 45g — C: 46g — F: 14g — ~490 kcal" },
      { time: "10:00 PM", meal: "Before bed", items: "1 tbsp isabgol (psyllium husk) in warm water", macros: "Fiber: 5g — ~10 kcal" },
    ],
    totals: "TOTAL — P: 194g — C: 187g — F: 58g — ~2,055 kcal",
  },
};

// ------------------------------------------------------------------ TRAINING
const splitVerdict = {
  pick: "Push / Pull / Legs — run twice (6 days)",
  why: [
    "Every muscle gets trained 2× a week — the sweet spot for building and keeping muscle while you diet.",
    "Built-in recovery: you never smash the same muscle two days running, so each session is fresh.",
    "Balanced volume and easy to dial back on low-energy days, which matters a lot in a deficit.",
  ],
  alt: "Your back+bi / chest+tri / shoulder+legs plan (reversed the next three days) also hits everything 2×/week — it’s a solid Arnold-style hybrid. Two snags: shoulders+legs in one session is brutally fatiguing, and triceps get hit close together across chest and arm days. If you love that style it works, but PPL recovers cleaner for a fat-loss block.",
};

const weekPlan = [
  { d: "Mon", w: "Push" }, { d: "Tue", w: "Pull" }, { d: "Wed", w: "Legs" },
  { d: "Thu", w: "Push" }, { d: "Fri", w: "Pull" }, { d: "Sat", w: "Legs" }, { d: "Sun", w: "Rest" },
];

const blocks = [
  { id: 1, weeks: "Weeks 1–4", name: "Foundation", key: "good", intensity: "RPE 7 — 3 reps in reserve", liss: "20 min post-lift", hiit: "None yet", focus: "Nail your form, build the 6-day habit, ease into the deficit. Add a little weight or one rep each week — momentum over intensity." },
  { id: 2, weeks: "Weeks 5–8", name: "Progression", key: "accent", intensity: "RPE 8 — 2 reps left", liss: "25 min post-lift", hiit: "1×/week (not after legs)", focus: "Push the working weights up. Volume creeps from ~14 to ~16 hard sets per muscle per week. Take a lighter week if you feel beaten up by week 8." },
  { id: 3, weeks: "Weeks 9–12", name: "Intensification", key: "warn", intensity: "RPE 8–9 — 1 rep left", liss: "30 min post-lift", hiit: "2×/week max", focus: "The hardest block — highest volume and intensity. Sleep 7–8h, keep protein high, and accept that strength may dip slightly as fat drops. That’s normal in a deficit." },
  { id: 4, weeks: "Weeks 13–16", name: "Refine & Peak", key: "accent", intensity: "RPE 8 — deload week 13", liss: "30–35 min", hiit: "1–2×/week", focus: "Deload in week 13 to recover, then finish hard. If fat loss stalls, add cardio minutes before cutting food further. This is where 10% comes into view." },
];

const workouts = {
  Push: { sub: "Chest — Shoulders — Triceps + Core", items: [
    { n: "Barbell Bench / Machine Chest Press", t: "Chest", s: "4 × 6–8", h: "Your strongest press — do it first while fresh. Shoulder blades pinned back and down, lower to mid-chest, drive up and slightly back." },
    { n: "Incline Dumbbell Press", t: "Upper Chest", s: "3 × 8–12", h: "Hits the upper chest the flat press under-works. Bench at ~30°, let the dumbbells stretch at the bottom." },
    { n: "Seated Overhead Press", t: "Front / Side Delts", s: "3 × 8–10", h: "Main shoulder mass builder. Brace the core and press overhead without flaring the ribs." },
    { n: "Lateral Raise", t: "Side Delts", s: "3 × 12–15", h: "Side delts give shoulders width and that capped look. Lead with the elbows, no swinging, lower under control." },
    { n: "Rope Triceps Pushdown", t: "Triceps", s: "3 × 10–15", h: "Keep elbows pinned to your sides; spread the rope apart at the bottom and squeeze." },
    { n: "Overhead Triceps Extension", t: "Triceps — long head", s: "3 × 10–12", h: "The overhead stretch targets the long head — the part pushdowns miss. Real arm size lives here." },
    { n: "Hanging Leg Raise", t: "Lower abs — core", s: "3 × 12–15", h: "Hang from a bar, curl your knees to your chest (or legs straight for harder). The single best lower-ab exercise — directly targets the pouch area below the navel where your scan shows the most subcutaneous fat." },
    { n: "Cable Crunch", t: "Upper abs — core", s: "3 × 15–20", h: "Kneel at the cable, rope behind your head, crunch down by flexing the spine — not pulling with the arms. Weighted progression is easy here, which matters." },
  ]},
  Pull: { sub: "Back — Rear Delts — Biceps + Core", items: [
    { n: "Pull-up or Lat Pulldown", t: "Lats — width", s: "4 × 6–10", h: "Builds the V-taper. Drive your elbows down toward your sides and pull with the back, not the arms." },
    { n: "Chest-supported / Barbell Row", t: "Mid-back — thickness", s: "4 × 8–10", h: "Pull to the lower ribs and squeeze the shoulder blades. Chest-supported saves your lower back while dieting." },
    { n: "Seated Cable Row", t: "Mid-back", s: "3 × 10–12", h: "Constant tension for back detail. Keep the torso still — don’t rock back to move the weight." },
    { n: "Face Pull", t: "Rear Delts", s: "3 × 15–20", h: "Balances all the pressing and fixes desk posture. Pull to your forehead, thumbs pointing back." },
    { n: "EZ-bar / Dumbbell Curl", t: "Biceps", s: "3 × 8–12", h: "Main biceps mass. Lock the elbows in place — no swinging or shoulder help." },
    { n: "Hammer Curl", t: "Brachialis / Forearm", s: "3 × 10–12", h: "Neutral grip builds the brachialis under the biceps, adding thickness and arm width." },
    { n: "Russian Twist (weighted)", t: "Obliques — sides", s: "3 × 20 (10/side)", h: "Sit with torso at 45°, feet off the ground, twist a plate or dumbbell side to side. This directly attacks the love-handle area — your scan shows torso fat at 13.4 kg, most of it on the sides." },
    { n: "Side Plank", t: "Obliques — deep core", s: "3 × 30s each side", h: "Elbow under shoulder, hips stacked, body straight. An isometric hold that builds the deep oblique wall and tightens the waistline. Squeeze the top oblique hard." },
  ]},
  Legs: { sub: "Quads — Hams — Glutes — Calves + Core", items: [
    { n: "Back Squat or Hack Squat", t: "Quads / Glutes", s: "4 × 6–8", h: "The big one. At least to parallel, knees tracking over toes, brace hard. Hack squat is a joint-friendly swap on a cut." },
    { n: "Romanian Deadlift", t: "Hamstrings / Glutes", s: "3 × 8–10", h: "Hip hinge: soft knees, push the hips back, feel the hamstrings stretch, neutral spine. Never round the back." },
    { n: "Leg Press or Walking Lunge", t: "Quads / Glutes", s: "3 × 10–12", h: "More leg volume with less spinal load — useful when recovery is lower in a deficit." },
    { n: "Lying / Seated Leg Curl", t: "Hamstrings", s: "3 × 10–15", h: "Direct hamstring work the squat can’t fully reach. Squeeze hard at the peak." },
    { n: "Leg Extension", t: "Quads", s: "3 × 12–15", h: "Quad isolation and a safe finisher you can push close to failure." },
    { n: "Standing Calf Raise", t: "Calves", s: "4 × 12–20", h: "Calves like high reps with a full stretch at the bottom and a pause at the top." },
    { n: "Ab Wheel Rollout (or Barbell Rollout)", t: "Full core — abs", s: "3 × 10–12", h: "From knees, roll out until your body is nearly flat, then pull back with your abs — not your hips. One of the highest muscle-activation core exercises ever measured. Start from knees, progress to toes." },
    { n: "Bicycle Crunch", t: "Abs — obliques", s: "3 × 20 (10/side)", h: "Lie on your back, opposite elbow to knee, extend the other leg. Slow and controlled — no speed. Hits both the rectus abdominis and obliques in one move to carve out the midsection." },
  ]},
  Rest: { sub: "Recovery — walk, stretch, sleep", items: [] },
};

const coreNote = "Core is built into every session (last 2 exercises). Your scan shows 13.4 kg torso fat and 96 cm abdominal circumference — these exercises build the muscle wall underneath so when the fat comes off through the deficit, you have definition to show. You cannot spot-reduce fat, but you can spot-build muscle.";

const cardioPlan = {
  pre: { title: "BEFORE WEIGHTS — warm-up only", key: "accent", lines: [
    "5–10 minutes, easy. Incline walk, easy bike, or rower at ~50–60% max heart rate — you should finish barely breathing hard.",
    "The job is to raise core temperature, loosen joints, and wake up the nervous system. It is not a workout.",
    "Then do 2–3 light ramp-up sets of your first lift. That’s the real warm-up that protects your strength.",
    "Why not more: 30+ minutes of cardio first burns through glycogen and tanks your lifting — exactly the tiredness you want to avoid.",
  ]},
  post: { title: "AFTER WEIGHTS — the fat-loss cardio", key: "warn", lines: [
    "20–35 minutes steady-state (LISS): incline treadmill walk, bike, or row at ~60–70% max HR — a pace you could talk at.",
    "Glycogen is already low after lifting, so steady cardio now pulls more from fat and can’t sabotage lifts that already happened.",
    "Optional HIIT 1–2×/week (e.g. 10 rounds of 30s hard / 90s easy). Skip it right after leg day — too much overlapping fatigue on a cut.",
    "Let diet create most of the deficit. Add cardio minutes only when fat loss actually stalls — keep something in reserve.",
  ]},
};

const weightVals = [82.5, 81.6, 80.7, 79.8, 78.9, 78.1, 77.3, 76.5, 75.7, 75.0, 74.2, 73.5, 72.7, 72.0, 71.3, 70.7, 70.0];
const weightSchedule = weightVals.slice(1).map((sat, i) => ({ week: i + 1, mon: weightVals[i], sat, loss: +(weightVals[i] - sat).toFixed(1) }));

// ============================================================================
// COLOR TOKEN SYSTEM
// ============================================================================
const TOK = {
  good:   { v: "var(--good)",   soft: "var(--good-soft)"   },
  accent: { v: "var(--accent)", soft: "var(--accent-soft)" },
  warn:   { v: "var(--warn)",   soft: "var(--warn-soft)"   },
  bad:    { v: "var(--bad)",    soft: "var(--bad-soft)"     },
};
const RATING = {
  low:     { key: "accent", label: "LOW" },
  optimal: { key: "good",  label: "OPTIMAL" },
  high:    { key: "warn",  label: "HIGH" },
  over:    { key: "bad",   label: "OVER RANGE" },
  lean:    { key: "accent", label: "LEAN" },
};
const tok = (k) => TOK[k] || TOK.accent;

const fmt = (n) => (Number.isInteger(n) ? n : n.toFixed(1));
function deltaText(cur, tgt, unit) {
  const d = tgt - cur;
  const sign = d > 0 ? "+" : "";
  return `${sign}${fmt(d)}${unit === "%" ? " pts" : ` ${unit}`}`;
}
const num = (x) => typeof x === "number" && !isNaN(x);

// ============================================================================
// HOOKS
// ============================================================================
function useCountUp(target, dur = 700) {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    const diff = target - from;
    if (diff === 0) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      const v = from + diff * ease;
      setVal(v);
      if (t < 1) raf = requestAnimationFrame(tick);
      else prev.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return val;
}

function useInView(opts = {}) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fb = setTimeout(() => setSeen(true), 900);
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); obs.unobserve(el); clearTimeout(fb); } },
      { threshold: opts.threshold || 0.15, ...opts }
    );
    obs.observe(el);
    return () => { obs.disconnect(); clearTimeout(fb); };
  }, []);
  return [ref, seen];
}

// ============================================================================
// SMALL COMPONENTS
// ============================================================================
function Num({ value, dp = 1, suffix = "" }) {
  const v = useCountUp(value);
  return <>{dp === 0 ? Math.round(v) : v.toFixed(dp)}{suffix}</>;
}

function Panel({ children, className = "", pad = "pad", glow, style, ...rest }) {
  return (
    <div className={`glass ${pad} ${className}`} style={{ ...(glow ? { boxShadow: `var(--glass-sh), var(--glass-hi)`, borderColor: tok(glow).soft } : null), ...style }} {...rest}>
      {children}
    </div>
  );
}

function SectionTitle({ n, children, sub }) {
  return (
    <div style={{ margin: "2px 0 18px" }}>
      <h2 className="head" style={{ display: "flex", alignItems: "baseline", gap: 11, margin: 0, fontSize: 23, color: "var(--ink)" }}>
        {n && <span className="mono" style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>{n}</span>}
        {children}
      </h2>
      {sub && <div style={{ marginTop: 6, fontSize: 13, color: "var(--ink-3)" }}>{sub}</div>}
    </div>
  );
}

function Pill({ rating, label, keyTok }) {
  const k = keyTok || (rating ? RATING[rating].key : "accent");
  const lbl = label || (rating ? RATING[rating].label : "");
  const t = tok(k);
  return <span className="pill" style={{ color: t.v, background: t.soft, border: `1px solid color-mix(in srgb, ${t.v} 45%, transparent)` }}>{lbl}</span>;
}

function ValueArrow({ cur, tgt, unit, good, mode }) {
  const isImprove = good === "flat" ? null : (good === "up" ? tgt > cur : tgt < cur);
  const dKey = isImprove === null ? "accent" : isImprove ? "good" : "bad";
  const t = tok(dKey);
  return (
    <div className="row" style={{ alignItems: "baseline", gap: 9, flexWrap: "wrap" }}>
      <span className="mono" style={{ fontSize: 20, fontWeight: 600, color: mode === "now" ? "var(--ink)" : "var(--ink-3)", transition: "color .4s" }}>
        <Num value={cur} /><span style={{ fontSize: 11, opacity: 0.5 }}> {unit}</span>
      </span>
      <span style={{ color: "var(--accent)", fontSize: 13 }}>→</span>
      <span className="mono" style={{ fontSize: 20, fontWeight: 600, color: mode === "goal" ? "var(--accent)" : "var(--ink-3)", transition: "color .4s" }}>
        <Num value={tgt} /><span style={{ fontSize: 11, opacity: 0.5 }}> {unit}</span>
      </span>
      <span className="mono" style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99, color: t.v, background: t.soft }}>{deltaText(cur, tgt, unit)}</span>
    </div>
  );
}

function RangeBar({ cur, tgt, low, high, unit = "", rating, mode, past }) {
  const [ref, vis] = useInView();
  const hasPast = typeof past === "number" && !isNaN(past);
  const vals = hasPast ? [cur, tgt, low, high, past] : [cur, tgt, low, high];
  const dataMin = Math.min(...vals), dataMax = Math.max(...vals);
  const pad = (dataMax - dataMin) * 0.16 + (high - low) * 0.12 + 0.001;
  const dMin = dataMin - pad, dMax = dataMax + pad, span = dMax - dMin;
  const pct = (x) => Math.max(0, Math.min(100, ((x - dMin) / span) * 100));
  const curPos = vis ? pct(cur) : 50;
  const tgtPos = vis ? pct(tgt) : 50;
  const pastPos = vis ? pct(past) : 50;
  const bandL = pct(low), bandR = pct(high);
  const rt = RATING[rating];
  const rTok = tok(rt.key);
  const lo = Math.min(curPos, tgtPos), hi = Math.max(curPos, tgtPos);
  const nowMode = mode === "now";

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <div style={{ position: "relative", height: 16 }}>
        <div style={{ position: "absolute", inset: "3px 0", borderRadius: 99, background: "var(--track)" }} />
        <div style={{ position: "absolute", left: `${bandL}%`, width: `${bandR - bandL}%`, top: 3, bottom: 3, background: "var(--good-soft)", borderLeft: "1px dashed color-mix(in srgb, var(--good) 50%, transparent)", borderRight: "1px dashed color-mix(in srgb, var(--good) 50%, transparent)", opacity: 0.5 }} />
        <div style={{ position: "absolute", left: `${lo}%`, width: `${hi - lo}%`, top: "50%", height: 2, transform: "translateY(-50%)", background: `repeating-linear-gradient(90deg, var(--accent) 0 4px, transparent 4px 8px)`, transition: "all .9s cubic-bezier(.2,.9,.2,1)" }} />
        {hasPast && <div title={`Dec ’24 — ${fmt(past)}${unit}`} style={{ position: "absolute", left: `${pastPos}%`, top: "50%", transform: "translate(-50%,-50%)", width: 11, height: 11, borderRadius: 99, background: "var(--bg-2)", border: "2px solid var(--ink-3)", zIndex: 1, transition: "left .9s cubic-bezier(.2,.9,.2,1)" }} />}
        <div title={`Now ${fmt(cur)}${unit}`} style={{ position: "absolute", left: `${curPos}%`, top: "50%", transform: `translate(-50%,-50%) scale(${nowMode ? 1 : 0.62})`, width: 16, height: 16, borderRadius: 99, background: rTok.v, opacity: nowMode ? 1 : 0.55, boxShadow: nowMode ? `0 0 0 3px var(--bg), 0 0 14px ${rTok.v}` : "0 0 0 2px var(--bg)", transition: "all .9s cubic-bezier(.2,.9,.2,1)", zIndex: nowMode ? 3 : 2 }} />
        <div title={`Goal ${fmt(tgt)}${unit}`} style={{ position: "absolute", left: `${tgtPos}%`, top: "50%", transform: `translate(-50%,-50%) scale(${nowMode ? 0.72 : 1.05})`, width: 16, height: 16, borderRadius: 99, background: "var(--bg)", border: "3px solid var(--accent)", opacity: nowMode ? 0.6 : 1, boxShadow: nowMode ? "none" : `0 0 9px var(--accent)`, transition: "all .9s cubic-bezier(.2,.9,.2,1)", zIndex: nowMode ? 2 : 3 }} />
      </div>
      <div className="between mono" style={{ marginTop: 7, fontSize: 10.5, opacity: 0.5 }}>
        <span>{low}</span>
        <span style={{ color: "var(--good)", letterSpacing: ".04em" }}>OPTIMAL {low}–{high}{unit}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function Gauge({ cur, tgt, max, label, sub, mode }) {
  const [ref, vis] = useInView();
  const val = mode === "goal" ? tgt : cur;
  const animVal = useCountUp(vis ? val : 0);
  const pctv = Math.min(1, animVal / max);
  const r = 52, c = 2 * Math.PI * r, dash = c * pctv;
  const col = mode === "goal" ? "var(--accent)" : "var(--good)";
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 132, height: 132, margin: "0 auto" }}>
        <svg width="132" height="132" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="66" cy="66" r={r} fill="none" stroke="var(--track)" strokeWidth="8" />
          <circle cx="66" cy="66" r={r} fill="none" stroke={col} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} style={{ transition: "stroke-dasharray .9s ease, stroke .4s", filter: `drop-shadow(0 0 7px ${col})` }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span className="mono" style={{ fontSize: 32, fontWeight: 600, lineHeight: 1 }}><Num value={vis ? val : 0} /></span>
          {sub && <span className="mono" style={{ fontSize: 10.5, opacity: 0.45, marginTop: 2 }}>{sub}</span>}
        </div>
      </div>
      <div className="eyebrow" style={{ marginTop: 10 }}>{label}</div>
    </div>
  );
}

function JourneyRow({ j }) {
  const [ref, vis] = useInView();
  const vals = [j.past, j.now, j.goal];
  const mn = Math.min(...vals), mx = Math.max(...vals), sp = (mx - mn) || 1;
  const pos = (v) => 6 + ((v - mn) / sp) * 88;
  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: "minmax(0,86px) minmax(0,1fr)", gap: 12, alignItems: "center" }}>
      <div style={{ fontSize: 12.5, fontWeight: 600 }}>{j.key}</div>
      <div style={{ position: "relative", height: 30 }}>
        <div style={{ position: "absolute", left: "6%", right: "6%", top: "50%", height: 2, transform: "translateY(-50%)", background: "var(--line)" }} />
        <div style={{ position: "absolute", left: `${Math.min(pos(j.now), pos(j.goal))}%`, width: `${Math.abs(pos(j.goal) - pos(j.now))}%`, top: "50%", height: 2, transform: "translateY(-50%)", opacity: vis ? 0.6 : 0, background: "var(--accent)", transition: "opacity .6s .2s" }} />
        {/* Past */}
        <div style={{ position: "absolute", left: `${vis ? pos(j.past) : 50}%`, top: "50%", transform: "translate(-50%,-50%)", width: 11, height: 11, borderRadius: 99, background: "var(--bg-2)", border: "2px solid var(--ink-3)", transition: "left .8s cubic-bezier(.2,.9,.2,1)" }} />
        <div className="mono" style={{ position: "absolute", left: `${vis ? pos(j.past) : 50}%`, top: "-2px", transform: "translateX(-50%)", fontSize: 9.5, opacity: 0.4, whiteSpace: "nowrap", transition: "left .8s cubic-bezier(.2,.9,.2,1)" }}>{fmt(j.past)}</div>
        {/* Now */}
        <div style={{ position: "absolute", left: `${vis ? pos(j.now) : 50}%`, top: "50%", transform: "translate(-50%,-50%)", width: 13, height: 13, borderRadius: 99, background: "var(--ink)", transition: "left .8s cubic-bezier(.2,.9,.2,1) .1s" }} />
        <div className="mono" style={{ position: "absolute", left: `${vis ? pos(j.now) : 50}%`, bottom: "-3px", transform: "translateX(-50%)", fontSize: 9.5, whiteSpace: "nowrap", transition: "left .8s cubic-bezier(.2,.9,.2,1) .1s" }}>{fmt(j.now)}</div>
        {/* Goal */}
        <div style={{ position: "absolute", left: `${vis ? pos(j.goal) : 50}%`, top: "50%", transform: "translate(-50%,-50%)", width: 13, height: 13, borderRadius: 99, background: "var(--bg)", border: "3px solid var(--accent)", boxShadow: `0 0 9px var(--accent)`, transition: "left .8s cubic-bezier(.2,.9,.2,1) .2s" }} />
        <div className="mono" style={{ position: "absolute", left: `${vis ? pos(j.goal) : 50}%`, top: "-2px", transform: "translateX(-50%)", fontSize: 9.5, color: "var(--accent)", whiteSpace: "nowrap", transition: "left .8s cubic-bezier(.2,.9,.2,1) .2s" }}>{fmt(j.goal)}{j.unit === "%" ? "%" : ""}</div>
      </div>
    </div>
  );
}

function LegendDot({ kind, label }) {
  const styles = {
    past: { background: "var(--bg-2)", border: "2px solid var(--ink-3)" },
    now:  { background: "var(--ink)" },
    goal: { background: "var(--bg)", border: "3px solid var(--accent)" },
  };
  return (
    <span className="mono" style={{ fontSize: 10, color: "var(--ink-3)", display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 10, height: 10, borderRadius: 99, display: "inline-block", ...styles[kind] }} />{label}
    </span>
  );
}

// ============================================================================
// DONUT
// ============================================================================
function Donut({ data, centerTop, centerSub, mode }) {
  const [ref, seen] = useInView({ threshold: 0.3 });
  const [sel, setSel] = useState(null);
  const r = 56, sw = 18, C = 2 * Math.PI * r, gap = 5;
  let acc = 0;
  const segs = data.map((d) => {
    const frac = d.value / 100;
    const start = acc; acc += frac * 360;
    const lenDeg = frac * 360 - gap;
    const len = Math.max(0, (lenDeg / 360) * C);
    return { ...d, start: start + gap / 2, len };
  });
  const active = sel != null ? data[sel] : null;
  return (
    <div ref={ref} style={{ position: "relative", width: "100%", maxWidth: 230, aspectRatio: "1", margin: "0 auto" }}>
      <svg viewBox="0 0 160 160" style={{ width: "100%", display: "block" }}>
        <g transform="translate(80,80)">
          {segs.map((s, i) => {
            const isSel = sel === i, dim = sel != null && !isSel;
            return (
              <circle key={i} r={r} fill="none"
                style={{ stroke: tok(s.key).v, strokeDasharray: `${seen ? s.len : 0} ${C}`, transition: `stroke-dasharray 1s cubic-bezier(.2,.9,.2,1) ${i * 0.12}s, stroke-width .3s, opacity .3s`, cursor: "pointer", opacity: dim ? 0.32 : 1 }}
                strokeWidth={isSel ? sw + 6 : sw} strokeLinecap="round"
                transform={`rotate(${s.start - 90})`}
                onClick={() => setSel(isSel ? null : i)} />
            );
          })}
        </g>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", textAlign: "center" }}>
        {active ? (
          <>
            <span className="num" style={{ fontSize: 26, fontWeight: 600, color: tok(active.key).v }}>{active.value}%</span>
            <span style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2 }}>{active.name}</span>
          </>
        ) : (
          <>
            <span className="num" style={{ fontSize: 26, fontWeight: 600, color: mode === "goal" ? "var(--accent)" : "var(--ink)" }}>{centerTop}</span>
            <span className="mono" style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>{centerSub}</span>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PACE CHART
// ============================================================================
function PaceChart({ data }) {
  const [ref, vis] = useInView();
  const [hover, setHover] = useState(null);
  const W = 340, H = 220, P = { t: 14, r: 12, b: 24, l: 30 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const yMin = 68, yMax = 84;
  const x = (wk) => P.l + ((wk - 1) / (data.length - 1)) * iw;
  const y = (v) => P.t + ((yMax - v) / (yMax - yMin)) * ih;

  const targetPts = data.map((d) => `${x(d.week)},${y(d.target)}`).join(" ");
  const actualData = data.filter((d) => d.actual != null);
  const actualPts = actualData.map((d) => `${x(d.week)},${y(d.actual)}`).join(" ");

  const ticks = [70, 74, 78, 82];
  const xTicks = [1, 4, 8, 12, 16];

  return (
    <div ref={ref} style={{ width: "100%", overflow: "hidden" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}
        onMouseLeave={() => setHover(null)}>
        {/* grid */}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" />
            <text x={P.l - 6} y={y(v) + 4} textAnchor="end" fill="var(--ink-3)" fontSize="10" fontFamily="var(--font-mono)">{v}</text>
          </g>
        ))}
        {xTicks.map((wk) => (
          <text key={wk} x={x(wk)} y={H - 4} textAnchor="middle" fill="var(--ink-3)" fontSize="10" fontFamily="var(--font-mono)">{wk}</text>
        ))}
        {/* target line */}
        <polyline
          points={targetPts}
          fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="5 4"
          style={{ opacity: vis ? 1 : 0, transition: "opacity .6s .3s" }}
        />
        {/* actual line */}
        {actualData.length > 0 && (
          <polyline
            points={actualPts}
            fill="none" stroke="var(--good)" strokeWidth="2.5"
            strokeDasharray={vis ? "none" : `0 ${iw * 2}`}
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.2,.9,.2,1) .4s" }}
          />
        )}
        {actualData.map((d) => (
          <circle key={d.week} cx={x(d.week)} cy={y(d.actual)} r="4" fill="var(--good)"
            style={{ opacity: vis ? 1 : 0, transition: `opacity .3s ${0.4 + d.week * 0.05}s` }} />
        ))}
        {/* hover zones */}
        {data.map((d) => (
          <rect key={d.week} x={x(d.week) - iw / data.length / 2} y={P.t} width={iw / data.length} height={ih}
            fill="transparent" onMouseEnter={() => setHover(d)} style={{ cursor: "crosshair" }} />
        ))}
        {/* tooltip */}
        {hover && (
          <g>
            <line x1={x(hover.week)} x2={x(hover.week)} y1={P.t} y2={H - P.b} stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="3 3" />
            <rect x={x(hover.week) - 52} y={P.t} width={104} height={50} rx="8" fill="var(--ink)" opacity={0.92} />
            <text x={x(hover.week)} y={P.t + 18} textAnchor="middle" fill="var(--bg)" fontSize="11" fontFamily="var(--font-mono)">Wk {hover.week}</text>
            <text x={x(hover.week)} y={P.t + 32} textAnchor="middle" fill="var(--accent)" fontSize="10" fontFamily="var(--font-mono)">tgt {hover.target}</text>
            {hover.actual != null && <text x={x(hover.week)} y={P.t + 44} textAnchor="middle" fill="var(--good)" fontSize="10" fontFamily="var(--font-mono)">act {hover.actual}</text>}
          </g>
        )}
      </svg>
    </div>
  );
}

// ============================================================================
// BODY MAP
// ============================================================================
function BodyMap({ selected, onSelect }) {
  const fillFor = (key) => {
    if (selected === key) return "color-mix(in srgb, var(--accent) 70%, transparent)";
    const f = segments[key].fat;
    const over = f.cur / f.high;
    return over > 1.4 ? "var(--bad-soft)" : over > 1 ? "var(--warn-soft)" : "var(--good-soft)";
  };
  const stroke = (key) => (selected === key ? "var(--accent)" : "var(--ink-3)");
  const region = (key, node) => (
    <g style={{ cursor: "pointer" }} onClick={() => onSelect(key === selected ? null : key)}>
      {node(fillFor(key), stroke(key), selected === key ? 2 : 1.2)}
    </g>
  );
  return (
    <svg viewBox="0 0 200 380" style={{ width: "100%", maxWidth: 240, display: "block", margin: "0 auto", overflow: "visible" }}>
      <circle cx="100" cy="34" r="22" fill="var(--glass-2)" stroke="var(--ink-3)" strokeWidth="1.2" />
      {region("torso", (f, s, w) => <rect x="64" y="62" width="72" height="118" rx="20" fill={f} stroke={s} strokeWidth={w} />)}
      {region("rightArm", (f, s, w) => <rect x="34" y="70" width="24" height="104" rx="12" fill={f} stroke={s} strokeWidth={w} />)}
      {region("leftArm", (f, s, w) => <rect x="142" y="70" width="24" height="104" rx="12" fill={f} stroke={s} strokeWidth={w} />)}
      {region("rightLeg", (f, s, w) => <rect x="68" y="186" width="28" height="150" rx="14" fill={f} stroke={s} strokeWidth={w} />)}
      {region("leftLeg", (f, s, w) => <rect x="104" y="186" width="28" height="150" rx="14" fill={f} stroke={s} strokeWidth={w} />)}
      <text x="46" y="60" textAnchor="middle" fill="var(--ink-3)" fontSize="9" fontFamily="var(--font-mono)">R</text>
      <text x="154" y="60" textAnchor="middle" fill="var(--ink-3)" fontSize="9" fontFamily="var(--font-mono)">L</text>
    </svg>
  );
}

// ============================================================================
// KNOB NAV (CSS-only rotary dial)
// ============================================================================
function KnobNav({ tabs, active, onChange }) {
  const ids = ["switch_off", "switch_1", "switch_2", "switch_3", "switch_4", "switch_5"];
  const codes = ["OVR", "CMP", "SEG", "NUT", "TRN", "TRK"];
  const idx = Math.max(0, tabs.findIndex((t) => t.id === active));
  const activeLabel = (tabs[idx] || tabs[0]).label;
  // Rotate via the shortest arc: unwrap the target angle relative to the
  // previous one instead of snapping to the fixed per-position CSS angle.
  const angleRef = useRef(-90);
  const target = -90 + idx * 60;
  const delta = (((target - angleRef.current) % 360) + 540) % 360 - 180;
  const angle = angleRef.current + delta;
  angleRef.current = angle;
  const spin = { transform: `rotate(${angle}deg)` };
  return (
    <div className="knobnav fadein">
      <div className="container">
        <div className="de">
          <div className="den">
            <hr className="line" />
            <hr className="line" />
            <hr className="line" />
            <div className="switch">
              {tabs.map((t, i) => (
                <label key={t.id} htmlFor={ids[i]}><span>{codes[i]}</span></label>
              ))}
              {tabs.map((t, i) => (
                <input key={ids[i]} type="radio" name="knobnav" id={ids[i]} checked={active === t.id} onChange={() => onChange(t.id)} />
              ))}
              <div className="light" style={spin}><span /></div>
              <div className="dot" style={spin}><span /></div>
              <div className="dene"><div className="denem"><div className="deneme" /></div></div>
              <div className="readout">
                <span className="nm">{activeLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODE SWITCH (skeuomorphic checkbox rocker)
// ============================================================================
function ModeSwitch({ mode, setMode }) {
  const checked = mode === "now";
  return (
    <div className="modeswitch" title="Toggle current readings vs target">
      <div className="toggle">
        <div>
          <input type="checkbox" checked={checked} onChange={(e) => setMode(e.target.checked ? "now" : "goal")} aria-label="Toggle NOW and GOAL" />
          <div data-unchecked="NOW" data-checked="GOAL"></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// THEME TOGGLE
// ============================================================================
function ThemeToggle({ theme, setTheme }) {
  const dark = theme === "dark";
  return (
    <button onClick={() => setTheme(dark ? "light" : "dark")} aria-label="Toggle theme"
      className="glass" style={{ cursor: "pointer", width: 42, height: 42, borderRadius: 13, border: "1px solid var(--glass-brd)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, background: "var(--glass-3)" }}>
      <span style={{ fontSize: 18, lineHeight: 1, transition: "transform .4s", display: "inline-block", transform: dark ? "rotate(0deg)" : "rotate(180deg)" }}>{dark ? "☾" : "☀"}</span>
    </button>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================
const TABS = [
  { id: "overview",    label: "Overview" },
  { id: "composition", label: "Composition" },
  { id: "segmental",   label: "Segmental" },
  { id: "nutrition",   label: "Nutrition" },
  { id: "training",    label: "Training" },
  { id: "tracker",     label: "Tracker" },
];

export default function App() {
  const [tab, setTab] = useState("overview");
  const [mode, setMode] = useState("goal");
  const [seg, setSeg] = useState("torso");
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("harman:theme") || "light"; } catch { return "light"; }
  });
  const [trkWeek, setTrkWeek] = useState(1);
  const [logDay, setLogDay] = useState("Push");
  const [weighins, setWeighins] = useState({});
  const [exlog, setExlog] = useState({});
  const [cardioLog, setCardioLog] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [importText, setImportText] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [block, setBlock] = useState(1);
  const [wkday, setWkday] = useState("Push");

  const goTab = useCallback((id) => {
    setTab(id);
  }, []);

  // Theme application
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("harman:theme", theme); } catch {}
  }, [theme]);

  // Persistence
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
  useEffect(() => { if (!toastMsg) return; const t = setTimeout(() => setToastMsg(""), 2200); return () => clearTimeout(t); }, [toastMsg]);

  const s = segments[seg] || segments.torso;
  const kcal = mode === "goal" ? nutrition.calories.tgt : nutrition.calories.cur;
  const wkKey = "w" + trkWeek;
  const wkSched = weightSchedule[trkWeek - 1];
  const sessionDays = ["Push", "Pull", "Legs", "Push", "Pull", "Legs"];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const macroData = [
    { name: "Protein", value: nutrition.protein.pct, key: nutrition.protein.key },
    { name: "Carbs", value: nutrition.carbs.pct, key: nutrition.carbs.key },
    { name: "Fat", value: nutrition.fat.pct, key: nutrition.fat.key },
  ];

  const setWeigh = (f, v) => setWeighins((p) => ({ ...p, [wkKey]: { ...(p[wkKey] || {}), [f]: v === "" ? "" : parseFloat(v) } }));
  const setEx = (day, idx, f, v) => setExlog((p) => { const o = { ...(p[wkKey] || {}) }; const arr = [...(o[day] || [])]; arr[idx] = { ...(arr[idx] || {}), [f]: v === "" ? "" : parseFloat(v) }; o[day] = arr; return { ...p, [wkKey]: o }; });
  const setCard = (i, f, v) => setCardioLog((p) => { const o = { ...(p[wkKey] || {}) }; const arr = [...(o.sessions || [])]; arr[i] = { ...(arr[i] || {}), [f]: v === "" ? "" : parseFloat(v) }; o.sessions = arr; return { ...p, [wkKey]: o }; });

  const paceData = weightSchedule.map((r) => { const a = weighins["w" + r.week]; return { week: r.week, target: r.sat, actual: a && num(a.sat) ? a.sat : null }; });
  const loggedPace = paceData.filter((d) => d.actual != null);
  let pace = null;
  if (loggedPace.length) { const last = loggedPace[loggedPace.length - 1]; const tgt = paceData.find((d) => d.week === last.week).target; const diff = +(last.actual - tgt).toFixed(1); const wi = weighins["w" + last.week] || {}; const monW = num(wi.mon) ? wi.mon : weightSchedule[last.week - 1].mon; const wkLoss = +(monW - last.actual).toFixed(1); const pctLoss = monW ? +((wkLoss / monW) * 100).toFixed(2) : 0; pace = { week: last.week, diff, wkLoss, pctLoss }; }

  const exportData = () => { try { const data = { profile: "Harman", goal: "70 kg @ 10%", weighins, exlog, cardio: cardioLog, exportedAt: new Date().toISOString() }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "harman-tracker.json"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); setToastMsg("Exported — commit to GitHub & send me the raw link"); } catch { setToastMsg("Export failed"); } };
  const copyData = async () => { try { await navigator.clipboard.writeText(JSON.stringify({ weighins, exlog, cardio: cardioLog }, null, 2)); setToastMsg("Copied JSON — paste it to me anytime"); } catch { setToastMsg("Copy failed — use Export"); } };
  const importData = () => { try { const d = JSON.parse(importText); if (d.weighins) setWeighins(d.weighins); if (d.exlog) setExlog(d.exlog); if (d.cardio) setCardioLog(d.cardio); setImportText(""); setToastMsg("Imported"); } catch { setToastMsg("Invalid JSON"); } };

  return (
    <>
      <div className="app-bg" />
      <div className="bloomfield">
        <div className="bloom b1" />
        <div className="bloom b2" />
        <div className="bloom b3" />
        <div className="bloom b4" />
      </div>
      <div className="wrap">
        {/* HEADER */}
        <header className="rise" style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
          <div>
            <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 8 }}>Body Scan {"·"} Target Plan</div>
            <h1 className="display">{profile.name}<span style={{ color: "var(--accent)" }}> {"→"} 10%</span></h1>
            <div className="mono" style={{ marginTop: 10, fontSize: 13, opacity: 0.5 }}>Baseline scan {"·"} {profile.date}</div>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <ModeSwitch mode={mode} setMode={setMode} />
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </header>

        {/* TRANSFORMATION STRIP */}
        <div className="rise auto-fit g-gap-s" style={{ marginBottom: 22 }}>
          {[
            ["WEIGHT", profile.curWeight, profile.tgtWeight, "kg", "down"],
            ["BODY FAT", 27.2, 10.0, "%", "down"],
            ["FAT MASS", 22.4, 7.0, "kg", "down"],
            ["MUSCLE", 33.2, 35.0, "kg", "up"],
          ].map(([k, c, t, u, dir]) => {
            const improve = dir === "up" ? t > c : t < c;
            const dKey = improve ? "good" : "bad";
            return (
              <div key={k} className="glass pad-s metric-card">
                <div className="eyebrow">{k}</div>
                <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 6 }}>
                  <span className="mono" style={{ fontSize: 16, opacity: 0.45 }}>{fmt(c)}</span>
                  <span style={{ color: "var(--accent)" }}>{"→"}</span>
                  <span className="mono num" style={{ fontSize: 26, fontWeight: 600, color: "var(--accent)" }}><Num value={t} /><span style={{ fontSize: 12, opacity: 0.5 }}>{u}</span></span>
                </div>
                <div className="mono" style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: tok(dKey).v }}>{deltaText(c, t, u)}</div>
              </div>
            );
          })}
        </div>

        {/* KNOB NAV */}
        <KnobNav tabs={TABS} active={tab} onChange={goTab} />

        {/* ============ OVERVIEW ============ */}
        {tab === "overview" && (
          <div className="rise grid g-gap">
            <div className="auto-fit g-gap-s">
              <Gauge cur={metabolism.bwi.cur} tgt={metabolism.bwi.tgt} max={10} label="BWI SCORE" sub="/ 10" mode={mode} />
              <Gauge cur={metabolism.bioAge.cur} tgt={metabolism.bioAge.tgt} max={50} label="BIO AGE" sub={`actual ${profile.age}`} mode={mode} />
              <Panel style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div className="eyebrow">BMR {"·"} AT REST</div>
                <div className="mono num" style={{ fontSize: 30, fontWeight: 600, color: mode === "goal" ? "var(--accent)" : undefined, lineHeight: 1, marginTop: 4 }}>
                  <Num value={mode === "goal" ? metabolism.bmr.tgt : metabolism.bmr.cur} dp={0} /><span style={{ fontSize: 14 }}> kcal</span>
                </div>
                <div style={{ fontSize: 11.5, opacity: 0.5, marginTop: 8, lineHeight: 1.4 }}>Rises with muscle — more burn even at a lower weight.</div>
              </Panel>
              <Panel style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div className="eyebrow">VISCERAL LEVEL</div>
                <div className="mono num" style={{ fontSize: 30, fontWeight: 600, color: mode === "goal" ? "var(--accent)" : "var(--bad)", lineHeight: 1, marginTop: 4 }}>
                  <Num value={mode === "goal" ? metabolism.visceralLevel.tgt : metabolism.visceralLevel.cur} dp={0} />
                </div>
                <div style={{ marginTop: 8 }}><Pill rating={mode === "goal" ? "optimal" : "over"} /></div>
              </Panel>
            </div>

            <Panel>
              <div className="between" style={{ marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
                <div className="eyebrow">YOUR JOURNEY</div>
                <div className="row" style={{ gap: 14, flexWrap: "wrap" }}>
                  <LegendDot kind="past" label="Dec ’24" />
                  <LegendDot kind="now" label="Now" />
                  <LegendDot kind="goal" label="Goal" />
                </div>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.55, opacity: 0.65 }}>
                From your {PAST_DATE} scan to now you ran a <b style={{ color: "var(--good)" }}>lean bulk</b> — about +4 kg muscle alongside +3.8 kg fat. The cut ahead keeps that new muscle and strips the fat back off.
              </p>
              <div className="grid" style={{ gap: 10 }}>
                {journey.map((j) => <JourneyRow key={j.key} j={j} />)}
              </div>
            </Panel>

            <Panel glow="accent">
              <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 12 }}>THE PLAN, IN ONE PARAGRAPH</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, opacity: 0.82 }}>
                You start from a strong base — muscle, protein and water already sit above range. So this is mostly a <b style={{ color: "var(--accent)" }}>fat-loss job with muscle protected</b>: drop ~15 kg of fat and add ~2 kg of muscle to land near <b style={{ color: "var(--accent)" }}>70 kg at 10%</b>. Honest expectation — gaining muscle while in a deficit is slow, so if the scale shows muscle simply <i>holding</i> while fat falls, that’s a win, not a miss. The biggest health payoff lands early: getting under ~20% body fat already pulls your visceral fat out of the danger zone. Treat 15% as the health milestone and 10% as the aesthetic stretch. Realistic horizon at a sustainable ~0.5 kg/week: <b>roughly 9–12 months</b> of consistent training and eating, not a sprint.
              </p>
            </Panel>

            <Panel pad="pad-s">
              <div className="eyebrow" style={{ marginBottom: 6 }}>NOTE ON THE “OPTIMAL” BANDS</div>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, opacity: 0.65 }}>
                At a true 10%, several fat targets land <i>below</i> the device’s green band — that band is calibrated for the general population, so a lean athlete reading “low” on fat is expected and fine. Toggle to <b style={{ color: "var(--accent)" }}>GOAL</b> and watch the ring markers move past the band on the fat metrics.
              </p>
            </Panel>
          </div>
        )}

        {/* ============ COMPOSITION ============ */}
        {tab === "composition" && (
          <div className="rise">
            <SectionTitle>Composition {"·"} Now {"→"} Goal</SectionTitle>
            <div className="row wrap-flex" style={{ gap: 16, marginTop: -8, marginBottom: 16 }}>
              <LegendDot kind="past" label="Dec ’24" />
              <LegendDot kind="now" label="Now" />
              <LegendDot kind="goal" label="Goal" />
            </div>
            <div className="grid" style={{ gap: 12 }}>
              {composition.map((m) => (
                <Panel key={m.id} pad="pad-s" style={{ padding: 18 }}>
                  <div className="between" style={{ marginBottom: 14, flexWrap: "wrap", gap: 10, alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{m.label}</div>
                      <ValueArrow cur={m.cur} tgt={m.tgt} unit={m.unit} good={m.good} mode={mode} />
                    </div>
                    <Pill rating={m.rating} />
                  </div>
                  <RangeBar cur={m.cur} tgt={m.tgt} past={m.past} low={m.low} high={m.high} unit={m.unit === "%" ? "%" : ""} rating={m.rating} mode={mode} />
                </Panel>
              ))}
            </div>

            <div className="auto-fit g-gap-s" style={{ marginTop: 16 }}>
              <Panel>
                <div className="eyebrow" style={{ marginBottom: 14 }}>WHERE THE FAT GOES</div>
                {fatDetail.map((f) => {
                  const v = mode === "goal" ? f.tgt : f.cur;
                  const w = (v / 22.4) * 100;
                  return (
                    <div key={f.label} style={{ marginBottom: 14 }}>
                      <div className="between" style={{ fontSize: 13.5, marginBottom: 6 }}>
                        <span style={{ opacity: 0.7 }}>{f.label}</span>
                        <span className="mono">{fmt(f.cur)} <span style={{ color: "var(--accent)" }}>{"→"} {fmt(f.tgt)}</span> kg</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 99, background: "var(--track)", overflow: "hidden" }}>
                        <div style={{ width: `${w}%`, height: "100%", background: mode === "goal" ? "var(--accent)" : "var(--warn)", borderRadius: 99, transition: "width .9s cubic-bezier(.2,.9,.2,1), background .3s" }} />
                      </div>
                    </div>
                  );
                })}
              </Panel>
              <Panel>
                <div className="eyebrow" style={{ marginBottom: 14 }}>BODY WATER {"·"} ICF / ECF</div>
                <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ width: `${mode === "goal" ? fluids.icfPct.tgt : fluids.icfPct.cur}%`, background: "var(--good)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--on-accent)", transition: "width .9s" }} className="mono">{mode === "goal" ? fluids.icfPct.tgt : fluids.icfPct.cur}%</div>
                  <div style={{ flex: 1, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "var(--on-accent)" }} className="mono">{mode === "goal" ? fluids.ecfPct.tgt : fluids.ecfPct.cur}%</div>
                </div>
                <div className="between" style={{ fontSize: 12.5, opacity: 0.65 }}>
                  <span>ICF {"·"} {fmt(mode === "goal" ? fluids.icf.tgt : fluids.icf.cur)} kg</span>
                  <span>ECF {"·"} {fmt(mode === "goal" ? fluids.ecf.tgt : fluids.ecf.cur)} kg</span>
                </div>
                <p style={{ fontSize: 11.5, opacity: 0.45, marginTop: 12, marginBottom: 0, lineHeight: 1.5 }}>Nudging the split toward intracellular (66{"→"}67%) reflects more muscle and good cell quality.</p>
              </Panel>
            </div>
          </div>
        )}

        {/* ============ SEGMENTAL ============ */}
        {tab === "segmental" && (
          <div className="rise">
            <SectionTitle n="18">Segmental {"·"} Now {"→"} Goal</SectionTitle>
            <div className="split start">
              <Panel>
                <BodyMap selected={seg} onSelect={(k) => setSeg(k || "torso")} />
                <div className="row wrap-flex" style={{ gap: 14, justifyContent: "center", marginTop: 14 }}>
                  <LegendDot kind="now" label="High fat now" />
                  <LegendDot kind="goal" label="Selected" />
                </div>
                <p style={{ fontSize: 11.5, opacity: 0.45, textAlign: "center", marginTop: 10, marginBottom: 0 }}>Tap a region {"·"} color shows current fat load</p>
              </Panel>

              <div className="grid" style={{ gap: 14 }}>
                <Panel>
                  <h3 className="head" style={{ margin: "0 0 16px" }}>{s.name}</h3>
                  {[["Lean Mass", s.lean, "up"], ["Fat Mass", s.fat, "down"]].map(([k, d, good]) => {
                    const r = d.cur > d.high ? "high" : d.cur < d.low ? "low" : "optimal";
                    return (
                      <div key={k} style={{ marginBottom: 18 }}>
                        <div className="between" style={{ marginBottom: 10, gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontSize: 13.5, opacity: 0.65, marginBottom: 6 }}>{k}</div>
                            <ValueArrow cur={d.cur} tgt={d.tgt} unit="kg" good={good} mode={mode} />
                          </div>
                          <Pill rating={r} />
                        </div>
                        <RangeBar cur={d.cur} tgt={d.tgt} past={d.past} low={d.low} high={d.high} rating={r} mode={mode} />
                      </div>
                    );
                  })}
                </Panel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Panel>
                    <div className="eyebrow" style={{ fontSize: 10 }}>ABDOMINAL CIRC.</div>
                    <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 4 }}>
                      <span className="mono" style={{ fontSize: 15, opacity: 0.45 }}>{balance.abdominal.cur}</span>
                      <span style={{ color: "var(--accent)" }}>{"→"}</span>
                      <span className="mono num" style={{ fontSize: 22, fontWeight: 600, color: "var(--accent)" }}>{balance.abdominal.tgt}<span style={{ fontSize: 11 }}> cm</span></span>
                    </div>
                  </Panel>
                  <Panel>
                    <div className="eyebrow" style={{ fontSize: 10 }}>WAIST-TO-HIP</div>
                    <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 4 }}>
                      <span className="mono" style={{ fontSize: 15, opacity: 0.45 }}>{balance.whr.cur}</span>
                      <span style={{ color: "var(--accent)" }}>{"→"}</span>
                      <span className="mono num" style={{ fontSize: 22, fontWeight: 600, color: "var(--accent)" }}>{balance.whr.tgt}</span>
                    </div>
                  </Panel>
                </div>
                <Panel style={{ padding: 16 }}>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, opacity: 0.65 }}>
                    Lean mass per limb stays roughly flat or nudges up — you keep the muscle. The whole move is in the <b style={{ color: "var(--accent)" }}>fat rows</b>, and the torso carries the most (13.4 {"→"} 4.2 kg), which is also where the visceral fat lives.
                  </p>
                </Panel>
              </div>
            </div>
          </div>
        )}

        {/* ============ NUTRITION ============ */}
        {tab === "nutrition" && (
          <div className="rise">
            <SectionTitle n="21–24">Nutrition {"·"} Fat-Loss Phase</SectionTitle>
            <Panel glow="warn" style={{ marginBottom: 16, padding: 16 }}>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, opacity: 0.75 }}>
                The Evolt machine recommended a <b>surplus</b> (~3,000 kcal) because it assumed a muscle-gain goal. Your goal is the opposite — strip fat while holding muscle — so these targets flip to a <b style={{ color: "var(--accent)" }}>moderate deficit with high protein</b>. Toggle NOW/GOAL to compare. Numbers are a starting frame; adjust by your weekly rate of loss, and a dietitian can personalise them.
              </p>
            </Panel>
            <div className="split" style={{ alignItems: "center" }}>
              <Panel style={{ position: "relative" }}>
                <Donut
                  data={macroData}
                  centerTop={kcal[0]}
                  centerSub={`–${kcal[1]} kcal`}
                  mode={mode}
                />
              </Panel>
              <div className="grid" style={{ gap: 12 }}>
                {[["Protein", nutrition.protein, "Hold high to protect muscle in a deficit"], ["Carbohydrates", nutrition.carbs, "Fuel training; the main lever you cut"], ["Fat", nutrition.fat, "Keep adequate for hormones"]].map(([name, m, note]) => (
                  <Panel key={name} pad="pad-s" style={{ padding: 18 }}>
                    <div className="between" style={{ marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                      <span className="row" style={{ gap: 10, fontSize: 15, fontWeight: 600 }}>
                        <span style={{ width: 11, height: 11, borderRadius: 99, background: tok(m.key).v }} />{name}
                      </span>
                      <span className="row" style={{ alignItems: "baseline", gap: 6 }}>
                        <span className="mono" style={{ fontSize: 13, opacity: 0.4 }}>{m.cur[0]}–{m.cur[1]}</span>
                        <span style={{ color: "var(--accent)" }}>{"→"}</span>
                        <span className="mono num" style={{ fontSize: 18, fontWeight: 600, color: "var(--accent)" }}>{m.tgt[0]}–{m.tgt[1]}<span style={{ fontSize: 11, opacity: 0.5 }}> g</span></span>
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, opacity: 0.5 }}>{note} {"·"} {m.pct}% of intake</div>
                  </Panel>
                ))}
              </div>
            </div>
            <Panel style={{ marginTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>SUGGESTED SUPPLEMENTS</div>
              <div className="row wrap-flex" style={{ gap: 12 }}>
                {supplements.map((x) => <span key={x} className="chip">{x}</span>)}
              </div>
            </Panel>

            {/* DETAILED MEAL PLAN */}
            {[mealPlan.protein, mealPlan.carbs, mealPlan.fats, mealPlan.fiber, mealPlan.legumes].map((section) => (
              <Panel key={section.title} style={{ marginTop: 16 }}>
                <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 6 }}>{section.title}</div>
                <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.55, opacity: 0.55 }}>{section.note}</p>
                <div className="grid" style={{ gap: 8 }}>
                  {section.items.map((item) => (
                    <div key={item.food} className="glass inner pad-s">
                      <div className="between" style={{ gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                        <span style={{ fontSize: 14.5, fontWeight: 600 }}>{item.food}</span>
                        <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--good)", whiteSpace: "nowrap" }}>{item.qty}</span>
                      </div>
                      <div className="row wrap-flex mono" style={{ gap: 10, marginBottom: 6, fontSize: 11 }}>
                        <span style={{ color: "var(--accent)" }}>{item.grams}</span>
                        {item.cal && item.cal !== "—" && <span style={{ opacity: 0.45 }}>{item.cal}</span>}
                      </div>
                      {item.when && <div style={{ fontSize: 12, color: "var(--warn)", marginBottom: 4 }}>{"◷"} {item.when}</div>}
                      {item.tip && <div style={{ fontSize: 12, opacity: 0.5, lineHeight: 1.5 }}>{item.tip}</div>}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, fontSize: 11, lineHeight: 1.5, background: "var(--good-soft)", color: "var(--good)" }} className="mono">{section.total}</div>
              </Panel>
            ))}

            {/* SAMPLE DAY */}
            <Panel glow="accent" style={{ marginTop: 16 }}>
              <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 14 }}>{mealPlan.sample.title}</div>
              <div className="grid" style={{ gap: 8 }}>
                {mealPlan.sample.meals.map((m, i) => (
                  <div key={i} className="glass inner pad-s" style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", gap: 12, alignItems: "start" }}>
                    <div style={{ textAlign: "center", minWidth: 60 }}>
                      <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{m.time}</div>
                      <div className="mono" style={{ fontSize: 10, opacity: 0.45, marginTop: 2 }}>{m.meal}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>{m.items}</div>
                      {m.macros && <div className="mono" style={{ fontSize: 10.5, color: "var(--good)", marginTop: 4 }}>{m.macros}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600, textAlign: "center", background: "var(--accent-soft)", color: "var(--accent)" }} className="mono">{mealPlan.sample.totals}</div>
            </Panel>

            <Panel style={{ marginTop: 16 }}>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.55 }}>This meal plan is a starting framework based on your Evolt scan data and Isopure isolate. Adjust portions week-by-week based on your Tracker weigh-ins. If weight loss stalls for 2 weeks, cut 1 roti or 30g rice before dropping calories further. A registered dietitian can personalise this for your preferences and any health conditions.</p>
            </Panel>
          </div>
        )}

        {/* ============ TRAINING ============ */}
        {tab === "training" && (
          <div className="rise grid g-gap">
            <SectionTitle>4-Month Training Plan</SectionTitle>

            <Panel glow="good">
              <div className="eyebrow" style={{ color: "var(--good)", marginBottom: 8 }}>MY PICK</div>
              <div className="head" style={{ fontSize: "clamp(20px,4vw,26px)", marginBottom: 14 }}>{splitVerdict.pick}</div>
              <div className="grid" style={{ gap: 9, marginBottom: 16 }}>
                {splitVerdict.why.map((w, i) => (
                  <div key={i} className="row" style={{ gap: 10, fontSize: 14, lineHeight: 1.5, opacity: 0.8 }}>
                    <span style={{ color: "var(--good)", flexShrink: 0 }}>{"✓"}</span><span>{w}</span>
                  </div>
                ))}
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.55, borderLeft: "2px solid var(--line)", paddingLeft: 12 }}>
                <b style={{ opacity: 0.75 }}>On your idea — </b>{splitVerdict.alt}
              </p>
            </Panel>

            <Panel>
              <div className="eyebrow" style={{ marginBottom: 14 }}>WEEKLY SHAPE {"·"} tap a day</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 6 }}>
                {weekPlan.map((p) => {
                  const rest = p.w === "Rest";
                  const active = !rest && p.w === wkday;
                  return (
                    <button key={p.d} onClick={() => !rest && setWkday(p.w)}
                      className="glass"
                      style={{ padding: "12px 4px", cursor: rest ? "default" : "pointer", opacity: rest ? 0.4 : 1, border: "1px solid var(--glass-brd)", borderRadius: 10, background: active ? "linear-gradient(180deg,var(--accent-2),var(--accent))" : "var(--glass-2)", color: active ? "var(--on-accent)" : "var(--ink)", textAlign: "center" }}>
                      <div className="mono" style={{ fontSize: 10.5, marginBottom: 4 }}>{p.d}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.w}</div>
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel>
              <div className="row wrap-flex" style={{ gap: 8, marginBottom: 18 }}>
                {["Push", "Pull", "Legs"].map((w) => (
                  <button key={w} onClick={() => setWkday(w)}
                    className="glass"
                    style={{ flex: "1 1 auto", padding: "10px 18px", border: "1px solid var(--glass-brd)", borderRadius: 10, cursor: "pointer", background: wkday === w ? "linear-gradient(180deg,var(--accent-2),var(--accent))" : "var(--glass-2)", color: wkday === w ? "var(--on-accent)" : "var(--ink)", fontWeight: 600 }}>
                    {w}
                  </button>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <h3 className="head" style={{ margin: 0 }}>{wkday === "Rest" ? "Rest" : wkday + " Day"}</h3>
                <div className="mono" style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>{(workouts[wkday] || workouts.Push).sub}</div>
              </div>
              {wkday === "Rest" ? (
                <p style={{ fontSize: 14, opacity: 0.65, margin: 0, lineHeight: 1.6 }}>Full rest, or an easy 30–45 min walk if you want extra steps. Recovery is when the muscle actually rebuilds — don’t skip it.</p>
              ) : (
                <>
                  <div className="grid" style={{ gap: 10 }}>
                    {(workouts[wkday] || workouts.Push).items.map((ex, i) => (
                      <div key={i} className="glass inner pad-s metric-card">
                        <div className="row" style={{ gap: 12 }}>
                          <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--on-accent)", background: "var(--accent)", width: 24, height: 24, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="between" style={{ gap: 10, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 15, fontWeight: 600 }}>{ex.n}</span>
                              <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--good)", whiteSpace: "nowrap" }}>{ex.s}</span>
                            </div>
                            <span className="pill" style={{ display: "inline-block", marginTop: 7, marginBottom: 9, fontSize: 10, color: tok("accent").v, background: tok("accent").soft, border: `1px solid color-mix(in srgb, var(--accent) 45%, transparent)` }}>{ex.t}</span>
                            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, opacity: 0.65 }}>{ex.h}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, opacity: 0.45, marginTop: 14, marginBottom: 0, lineHeight: 1.5 }}>{coreNote}</p>
                </>
              )}
            </Panel>

            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>16-WEEK PROGRESSION {"·"} tap a block</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: 14 }}>
                {blocks.map((b) => (
                  <button key={b.id} onClick={() => setBlock(b.id)}
                    className="glass"
                    style={{ textAlign: "left", padding: 14, border: "1px solid var(--glass-brd)", borderRadius: 10, cursor: "pointer", background: block === b.id ? "linear-gradient(180deg,var(--accent-2),var(--accent))" : "var(--glass-2)", color: block === b.id ? "var(--on-accent)" : "var(--ink)" }}>
                    <div className="mono" style={{ fontSize: 10, opacity: block === b.id ? 0.8 : 0.5 }}>{b.weeks}</div>
                    <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{b.name}</div>
                  </button>
                ))}
              </div>
              {blocks.filter((b) => b.id === block).map((b) => (
                <Panel key={b.id} glow={b.key}>
                  <p style={{ margin: "0 0 16px", fontSize: 14.5, lineHeight: 1.6, opacity: 0.8 }}>{b.focus}</p>
                  <div className="auto-fit g-gap-s">
                    {[["INTENSITY", b.intensity], ["LISS CARDIO", b.liss], ["HIIT", b.hiit]].map(([k, v]) => (
                      <div key={k} className="glass inner pad-s">
                        <div className="eyebrow" style={{ marginBottom: 5 }}>{k}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </Panel>
              ))}
            </div>

            <div className="auto-fit g-gap-s">
              {[cardioPlan.pre, cardioPlan.post].map((c, idx) => (
                <Panel key={idx} glow={c.key}>
                  <div className="eyebrow" style={{ color: tok(c.key).v, marginBottom: 12 }}>{c.title}</div>
                  <div className="grid" style={{ gap: 10 }}>
                    {c.lines.map((l, i) => (
                      <div key={i} className="row" style={{ gap: 10, fontSize: 13.5, lineHeight: 1.55, opacity: 0.75 }}>
                        <span style={{ color: tok(c.key).v, flexShrink: 0 }}>{"—"}</span><span>{l}</span>
                      </div>
                    ))}
                  </div>
                </Panel>
              ))}
            </div>

            <Panel>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.55 }}>This is a general, well-established training framework, not personalised medical or coaching advice. If you have injuries or health conditions, clear it with a doctor or qualified coach first, and back off anything that causes joint pain.</p>
            </Panel>
          </div>
        )}

        {/* ============ TRACKER ============ */}
        {tab === "tracker" && (
          <div className="rise grid g-gap">
            <SectionTitle>Tracker {"·"} Log & Pace</SectionTitle>

            <Panel>
              <div className="between" style={{ marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <div className="eyebrow">SELECT WEEK {"·"} starts 8 Jun 2026</div>
                {!loaded && <span style={{ fontSize: 11, opacity: 0.45 }}>loading saved data...</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8,minmax(0,1fr))", gap: 6 }}>
                {weightSchedule.map((r) => (
                  <button key={r.week} onClick={() => setTrkWeek(r.week)}
                    style={{ padding: "10px 0", border: "1px solid var(--glass-brd)", borderRadius: 10, cursor: "pointer", background: trkWeek === r.week ? "var(--accent)" : "var(--glass-2)", color: trkWeek === r.week ? "var(--on-accent)" : "var(--ink)", textAlign: "center" }}>
                    <span className="mono" style={{ fontWeight: 600, fontSize: 13 }}>{r.week}</span>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel>
              <div className="eyebrow" style={{ marginBottom: 4 }}>WEEK {trkWeek} {"·"} WEIGH-IN</div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--accent)", opacity: 0.6, marginBottom: 14 }}>{weekLabel(trkWeek)}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12.5, opacity: 0.55, marginBottom: 6 }}>Monday — target <b style={{ color: "var(--accent)" }}>{wkSched.mon} kg</b></div>
                  <input type="number" inputMode="decimal" className="in" placeholder={String(wkSched.mon)} value={weighins[wkKey] && num(weighins[wkKey].mon) ? weighins[wkKey].mon : ""} onChange={(e) => setWeigh("mon", e.target.value)} />
                </div>
                <div>
                  <div style={{ fontSize: 12.5, opacity: 0.55, marginBottom: 6 }}>Saturday (post-workout) — target <b style={{ color: "var(--accent)" }}>{wkSched.sat} kg</b></div>
                  <input type="number" inputMode="decimal" className="in" placeholder={String(wkSched.sat)} value={weighins[wkKey] && num(weighins[wkKey].sat) ? weighins[wkKey].sat : ""} onChange={(e) => setWeigh("sat", e.target.value)} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontSize: 12.5, opacity: 0.55, marginBottom: 6 }}>Target drop this week</div>
                  <div className="mono num" style={{ fontSize: 22, fontWeight: 600, color: "var(--good)" }}>{"−"}{wkSched.loss} kg</div>
                </div>
              </div>
              {(() => {
                const wi = weighins[wkKey] || {};
                if (!num(wi.mon) || !num(wi.sat)) return null;
                const drop = +(wi.mon - wi.sat).toFixed(1);
                const vs = +(drop - wkSched.loss).toFixed(1);
                const good = drop >= wkSched.loss - 0.2;
                const k = good ? "good" : "warn";
                return (
                  <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, fontSize: 13, opacity: 0.85, background: good ? "var(--good-soft)" : "var(--warn-soft)" }}>
                    Actual drop <b>{drop} kg</b> — {vs >= 0 ? <span style={{ color: "var(--good)" }}>{vs === 0 ? "right on target" : `${Math.abs(vs)} kg ahead of target`}</span> : <span style={{ color: "var(--warn)" }}>{Math.abs(vs)} kg behind target</span>}
                  </div>
                );
              })()}
            </Panel>

            <Panel>
              <div className="eyebrow" style={{ marginBottom: 6 }}>WEIGHT {"·"} TARGET vs ACTUAL</div>
              <div className="row" style={{ gap: 16, marginBottom: 8 }}>
                <span className="mono" style={{ fontSize: 11, opacity: 0.55 }}>
                  <span style={{ display: "inline-block", width: 14, height: 0, borderTop: "2px dashed var(--accent)", verticalAlign: "middle", marginRight: 5 }} />Target
                </span>
                <span className="mono" style={{ fontSize: 11, opacity: 0.55 }}>
                  <span style={{ display: "inline-block", width: 14, height: 0, borderTop: "2px solid var(--good)", verticalAlign: "middle", marginRight: 5 }} />Your actual
                </span>
              </div>
              <PaceChart data={paceData} />
              {pace && (() => {
                let msg, k;
                const paceCol = pace.pctLoss > 1.1 ? "var(--warn)" : pace.diff <= -0.3 ? "var(--good)" : pace.diff >= 0.3 ? "var(--warn)" : "var(--good)";
                if (pace.pctLoss > 1.1) { k = "warn"; msg = `You’re dropping about ${pace.pctLoss}% of bodyweight a week — faster than ideal. To protect the muscle you’re working to keep, add roughly 150 kcal (mostly carbs) and hold cardio where it is.`; }
                else if (pace.diff <= -0.3) { k = "good"; msg = `Ahead of target by ${Math.abs(pace.diff)} kg through week ${pace.week}. Looking good — keep the current plan, no need to cut harder.`; }
                else if (pace.diff >= 0.3) { k = "warn"; msg = `Behind target by ${pace.diff} kg at week ${pace.week}. Easiest first move: add 10–15 min to your post-lift LISS. If it’s still stuck next week, trim ~150 kcal from carbs before cutting anything else.`; }
                else { k = "good"; msg = `Right on pace through week ${pace.week}. Keep everything exactly where it is.`; }
                return (
                  <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 12, background: `color-mix(in srgb, ${paceCol} 10%, transparent)` }}>
                    <div className="eyebrow" style={{ color: tok(k).v, marginBottom: 6 }}>PACE CHECK</div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.85 }}>{msg}</div>
                  </div>
                );
              })()}
              {!pace && <p style={{ fontSize: 12.5, opacity: 0.45, marginTop: 10, marginBottom: 0 }}>Log a Saturday weight to see your pace line and get a recommendation.</p>}
            </Panel>

            <Panel>
              <div className="between" style={{ marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <div className="eyebrow">WEEK {trkWeek} {"·"} EXERCISE LOG</div>
                <div className="row" style={{ gap: 6 }}>
                  {["Push", "Pull", "Legs"].map((d) => (
                    <button key={d} onClick={() => setLogDay(d)}
                      className="btn"
                      style={{ padding: "7px 14px", fontSize: 13, background: logDay === d ? "var(--accent)" : "var(--glass-2)", color: logDay === d ? "var(--on-accent)" : "var(--ink)", border: "1px solid var(--glass-brd)", borderRadius: 10, cursor: "pointer" }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid" style={{ gap: 8 }}>
                {workouts[logDay].items.map((ex, i) => {
                  const cell = (exlog[wkKey] && exlog[wkKey][logDay] && exlog[wkKey][logDay][i]) || {};
                  return (
                    <div key={i} className="glass inner pad-s" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 84px 70px", gap: 9, alignItems: "center" }}>
                      <div style={{ minWidth: 0 }}>
                        <div className="clamp1" style={{ fontSize: 13.5, fontWeight: 600 }}>{ex.n}</div>
                        <div className="mono" style={{ fontSize: 10.5, opacity: 0.45 }}>{ex.s}</div>
                      </div>
                      <input type="number" inputMode="decimal" className="in" placeholder="kg" value={num(cell.wt) ? cell.wt : ""} onChange={(e) => setEx(logDay, i, "wt", e.target.value)} />
                      <input type="number" inputMode="numeric" className="in" placeholder="reps" value={num(cell.reps) ? cell.reps : ""} onChange={(e) => setEx(logDay, i, "reps", e.target.value)} />
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: 11.5, opacity: 0.45, marginTop: 10, marginBottom: 0 }}>Log the weight and reps of your top working set each session. Aim to beat last week’s number on at least one set — that’s progressive overload.</p>
            </Panel>

            <Panel>
              <div className="eyebrow" style={{ marginBottom: 4 }}>WEEK {trkWeek} {"·"} CARDIO LOG {"·"} minutes</div>
              <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 14 }}>Pre = warm-up (5–10) {"·"} Post = fat-loss LISS (20–35)</div>
              <div className="grid" style={{ gap: 8 }}>
                {dayLabels.map((dl, i) => {
                  const cell = (cardioLog[wkKey] && cardioLog[wkKey].sessions && cardioLog[wkKey].sessions[i]) || {};
                  return (
                    <div key={i} className="glass inner pad-s" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 78px 78px", gap: 9, alignItems: "center" }}>
                      <div style={{ minWidth: 0 }}><span style={{ fontSize: 13.5, fontWeight: 600 }}>{dl}</span> <span className="mono" style={{ fontSize: 11, opacity: 0.45 }}>{sessionDays[i]}</span></div>
                      <input type="number" inputMode="numeric" className="in" placeholder="pre" value={num(cell.pre) ? cell.pre : ""} onChange={(e) => setCard(i, "pre", e.target.value)} />
                      <input type="number" inputMode="numeric" className="in" placeholder="post" value={num(cell.post) ? cell.post : ""} onChange={(e) => setCard(i, "post", e.target.value)} />
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel glow="accent">
              <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 10 }}>SAVE & SYNC</div>
              <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.6, opacity: 0.75 }}>
                Everything you type saves automatically and will still be here next time you open this. To loop me in: <b>Export</b> the JSON, commit it to a public GitHub repo, and send me the raw link — or just <b>Copy</b> it and paste it back to me. I’ll read it and re-tune your weight curve, calories and cardio to your real pace.
              </p>
              <div className="row wrap-flex" style={{ gap: 10, marginBottom: 14 }}>
                <button onClick={exportData} style={{ padding: "10px 18px", border: "1px solid var(--glass-brd)", borderRadius: 10, cursor: "pointer", background: "var(--accent)", color: "var(--on-accent)", fontWeight: 600 }}>{"↓"} Export JSON</button>
                <button onClick={copyData} style={{ padding: "10px 18px", border: "1px solid var(--glass-brd)", borderRadius: 10, cursor: "pointer", background: "var(--glass-2)", color: "var(--ink)", fontWeight: 600 }}>Copy JSON</button>
              </div>
              <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste a previous export here to restore your data..." rows={3} className="in mono" style={{ fontSize: 12, resize: "vertical", width: "100%" }} />
              <button onClick={importData} style={{ marginTop: 10, padding: "10px 18px", border: "1px solid var(--glass-brd)", borderRadius: 10, cursor: "pointer", background: "var(--glass-2)", color: "var(--ink)", fontWeight: 600 }}>{"↑"} Import</button>
              <p style={{ margin: "14px 0 0", fontSize: 12, lineHeight: 1.55, opacity: 0.5 }}>
                I can’t push to your GitHub or deploy on my own — I don’t have access to your account, and a browser page can’t safely write to GitHub by itself. The export / raw-link loop above is what actually works. Want this as a live site on your Vercel? Say so and I’ll prep a standalone build for you to deploy.
              </p>
            </Panel>
          </div>
        )}

        {/* TOAST */}
        {toastMsg && (
          <div className="fadein" style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            background: "var(--glass-3)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--good)", color: "var(--good)",
            padding: "12px 22px", borderRadius: 99, fontSize: 13, zIndex: 50,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }} className="mono">{toastMsg}</div>
        )}

        {/* FOOTER */}
        <footer className="mono" style={{ marginTop: 34, paddingTop: 18, borderTop: "1px solid var(--line)", fontSize: 10.5, opacity: 0.35, textAlign: "center" }}>
          Targets computed from baseline scan {"·"} not medical advice
        </footer>
      </div>
    </>
  );
}
