import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useScrollY(threshold = 20) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const h = () => setPast(window.scrollY > threshold);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, [threshold]);
  return past;
}

// ─────────────────────────────────────────────────────────────────
// HEROICONS (outline, 24px) — inline SVG set
// ─────────────────────────────────────────────────────────────────
const HeroIcon = ({ paths, className = "w-6 h-6", strokeWidth = 1.5, fill = "none" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={fill} viewBox="0 0 24 24"
    strokeWidth={strokeWidth} stroke="currentColor" className={className}>
    {[].concat(paths).map((d, i) => (
      <path key={i} strokeLinecap="round" strokeLinejoin="round" d={d} />
    ))}
  </svg>
);

// Icon library — Heroicons paths
const ICONS = {
  // nav / ui
  bars3:        "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
  xMark:        "M6 18 18 6M6 6l12 12",
  arrowRight:   "M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3",
  chevronRight: "m8.25 4.5 7.5 7.5-7.5 7.5",
  check:        "m4.5 12.75 6 6 9-13.5",
  xCircle:      ["M9.75 9.75l4.5 4.5m0-4.5-4.5 4.5","M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"],
  checkCircle:  ["M9 12.75 11.25 15 15 9.75","M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"],

  // feature icons
  chartBar:     ["M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75z",
                 "M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625z",
                 "M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z"],
  sparkles:     ["M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z",
                 "M18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"],
  target:       ["M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
                 "M19.5 12c0 4.142-3.358 7.5-7.5 7.5S4.5 16.142 4.5 12 7.858 4.5 12 4.5s7.5 3.358 7.5 7.5Z",
                 "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636"],
  arrowPath:    "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99",
  cubeTransp:   ["M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25",
                 "m15 11.25-2.25-1.313v-4.5m2.25 5.813V16.5m0-5.25 2.25-1.313",
                 "m9 11.25 2.25-1.313v-4.5M9 11.25V16.5m0-5.25L6.75 9.937",
                 "m12 19.5 2.25-1.313M12 19.5l-2.25-1.313m0 0v-5.625m2.25 6.938 2.25-1.313v-5.625M9.75 12.562 12 11.25l2.25 1.312"],
  presentChart: ["M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5",
                 "M5.625 12.189 7.5 15.75m4.875-3.938L10.5 15.75m4.875-9.75V12",],
  userGroup:    ["M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"],
  bolt:         "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  eye:          ["M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z",
                 "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"],
  currency:     ["M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"],
  trendUp:      "M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941",
  puzzle:       "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.39 48.39 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.959.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z",
};

// ─────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────
const C = {
  orange:   "#E85D04",
  orangeHi: "#f97316",
  orangeLo: "#ea7c34",
  purple:   "#7C3AED",
  blue:     "#0369A1",
  green:    "#059669",
  amber:    "#B45309",
  teal:     "#0D9488",
};

// ─────────────────────────────────────────────────────────────────
// REUSABLE PRIMITIVES
// ─────────────────────────────────────────────────────────────────

/** Scroll-triggered fade-up reveal */
function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const [ref, inView] = useInView();
  return (
    <Tag ref={ref} className={className} style={{
      opacity:    inView ? 1 : 0,
      transform:  inView ? "none" : "translateY(28px)",
      transition: `opacity .65s cubic-bezier(.22,1,.36,1) ${delay}ms, transform .65s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      {children}
    </Tag>
  );
}

/** Eyebrow label */
const EyeBrow = ({ children }) => (
  <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#E85D04] mb-3">
    <span className="w-3 h-px bg-[#E85D04] rounded-full" />
    {children}
    <span className="w-3 h-px bg-[#E85D04] rounded-full" />
  </p>
);

/** Section heading */
const SectionHeading = ({ children, sub, center = false }) => (
  <div className={center ? "text-center" : ""}>
    <h2 className="text-4xl md:text-[42px] font-extrabold tracking-[-0.025em] leading-[1.12] text-gray-900">
      {children}
    </h2>
    {sub && <p className="mt-4 text-[17px] text-gray-500 leading-relaxed max-w-2xl">{center ? undefined : ""}{sub}</p>}
  </div>
);

/** Primary CTA button */
function CTABtn({ size = "md", variant = "primary", className = "" }) {
  const base = "inline-flex items-center gap-2.5 font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D04] focus-visible:ring-offset-2";
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-[14px]",
    lg: "px-7 py-3.5 text-[15px]",
    xl: "px-8 py-4 text-base",
  };
  const variants = {
    primary: "bg-[#E85D04] text-white shadow-[0_1px_2px_rgba(232,93,4,.3),0_4px_20px_rgba(232,93,4,.22)] hover:bg-[#d45300] hover:shadow-[0_2px_6px_rgba(232,93,4,.4),0_8px_28px_rgba(232,93,4,.28)]",
    ghost:   "bg-white text-gray-800 border border-gray-200 shadow-sm hover:border-gray-300 hover:bg-gray-50",
    white:   "bg-white/15 text-white border border-white/25 backdrop-blur-sm hover:bg-white/25",
    dark:    "bg-gray-900 text-white shadow-sm hover:bg-black",
  };
  return (
    <a href="#audit" className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      Book Your AI Profit Audit
      <HeroIcon paths={ICONS.arrowRight} className="w-4 h-4" />
    </a>
  );
}

/** Feature card */
function FeatureCard({ icon, iconColor = C.orange, title, body, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <article
        className="group relative flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-6 h-full
          transition-all duration-300 ease-out
          hover:-translate-y-1.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:border-gray-300"
      >
        {/* Icon badge */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${iconColor}12`, color: iconColor, border: `1.5px solid ${iconColor}25` }}
        >
          <HeroIcon paths={icon} className="w-5 h-5" strokeWidth={1.75} />
        </div>
        {/* Text */}
        <h3 className="font-bold text-gray-900 text-[15px] leading-snug">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
        {/* Hover accent line */}
        <div
          className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, ${iconColor}00, ${iconColor}, ${iconColor}00)` }}
        />
      </article>
    </Reveal>
  );
}

/** Stat card */
const StatCard = ({ value, label, sub }) => (
  <div className="flex flex-col items-center rounded-2xl bg-white border border-gray-100 shadow-sm px-6 py-5 text-center">
    <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</span>
    <span className="text-xs font-semibold text-[#E85D04] mt-1 uppercase tracking-wide">{label}</span>
    {sub && <span className="text-[11px] text-gray-400 mt-0.5">{sub}</span>}
  </div>
);

// ─────────────────────────────────────────────────────────────────
// DASHBOARD WIDGET
// ─────────────────────────────────────────────────────────────────
function DashboardWidget() {
  const metrics = [
    { label: "Blended ROAS",  value: "4.2×",  delta: "+0.9×",  bar: 84, up: true  },
    { label: "CAC",           value: "$38",    delta: "↓ 28%",  bar: 62, up: true  },
    { label: "Repeat Rate",   value: "34%",    delta: "+12 pt", bar: 68, up: true  },
    { label: "Gross Margin",  value: "61%",    delta: "+9 pt",  bar: 76, up: true  },
    { label: "LTV : CAC",     value: "5.1×",   delta: "+2.1×",  bar: 91, up: true  },
  ];

  const miniSparkline = [28, 42, 37, 55, 48, 62, 58, 71, 67, 84];

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-[0_4px_40px_rgba(0,0,0,0.10)] overflow-hidden select-none">

      {/* ── Window chrome */}
      <div className="flex items-center gap-1.5 px-4 pt-3.5 pb-2.5 border-b border-gray-100 bg-gray-50/70">
        <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
        <span className="w-3 h-3 rounded-full bg-[#28C840]" />
        <span className="flex-1 mx-3 h-5 rounded-md bg-gray-200/70 flex items-center justify-center">
          <span className="text-[10px] text-gray-400 font-medium">app.leverai.io/dashboard</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E85D04] animate-pulse" />
          <span className="text-[10px] text-gray-400 font-semibold">Live</span>
        </span>
      </div>

      {/* ── Header row */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">AI Profit Dashboard</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Shopify · Last 30 days</p>
        </div>
        {/* Mini sparkline */}
        <svg width="72" height="28" viewBox="0 0 72 28" fill="none">
          <polyline
            points={miniSparkline.map((v, i) => `${i * 8},${28 - (v / 100) * 24}`).join(" ")}
            stroke={C.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
          />
          <polyline
            points={[...miniSparkline.map((v, i) => `${i * 8},${28 - (v / 100) * 24}`), "72,28", "0,28"].join(" ")}
            fill={`${C.orange}18`} stroke="none"
          />
        </svg>
      </div>

      {/* ── Metric rows */}
      <div className="px-5 py-4 space-y-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center gap-3">
            <span className="text-[11.5px] text-gray-400 w-[90px] flex-shrink-0 tabular-nums">{m.label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${m.bar}%`, background: `linear-gradient(90deg, ${C.orangeHi}55, ${C.orange})` }}
              />
            </div>
            <span className="text-[13px] font-bold text-gray-900 w-9 text-right tabular-nums">{m.value}</span>
            <span className="text-[11px] font-semibold text-emerald-600 w-14 text-right tabular-nums">{m.delta}</span>
          </div>
        ))}
      </div>

      {/* ── Footer strip */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-gradient-to-r from-orange-50/80 to-white border-t border-orange-100/60">
        <div className="flex items-center gap-1.5">
          <HeroIcon paths={ICONS.trendUp} className="w-3.5 h-3.5 text-[#E85D04]" strokeWidth={2.2} />
          <span className="text-[11px] font-bold text-[#E85D04]">Profit Optimized</span>
        </div>
        <span className="text-[11px] text-gray-400">Updated just now</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PROCESS STEP CARD
// ─────────────────────────────────────────────────────────────────
function StepCard({ number, title, body, isLast = false, delay = 0 }) {
  return (
    <Reveal delay={delay} className="relative">
      {/* Connector arrow — only between cards */}
      {!isLast && (
        <div className="hidden md:flex absolute top-8 -right-3 z-10 w-6 h-6 items-center justify-center">
          <HeroIcon paths={ICONS.chevronRight} className="w-4 h-4 text-gray-300" strokeWidth={2.5} />
        </div>
      )}
      <article className="group rounded-2xl border border-gray-200 bg-white p-7 h-full
        transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)] hover:border-gray-300">
        {/* Step number bubble */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E85D04] to-[#f97316] flex items-center justify-center text-white font-mono font-bold text-sm mb-5 shadow-[0_4px_12px_rgba(232,93,4,.3)]">
          {number}
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-2.5">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
      </article>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────
// PRICING CARD
// ─────────────────────────────────────────────────────────────────
function PricingCard({ plan, price, period, description, featured = false, delay = 0 }) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className={`relative rounded-2xl p-8 h-full flex flex-col transition-all duration-300 hover:-translate-y-1
        ${featured
          ? "bg-gradient-to-br from-[#fff8f5] to-white border-[1.5px] border-[#f97316] shadow-[0_0_0_1px_rgba(249,115,22,.15),0_8px_40px_rgba(232,93,4,.16)]"
          : "bg-white border border-gray-200 shadow-sm hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)]"
        }`}
      >
        {featured && (
          <div className="absolute -top-3.5 left-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E85D04] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
              <HeroIcon paths={ICONS.sparkles[0]} className="w-3 h-3" strokeWidth={2} />
              Recommended
            </span>
          </div>
        )}
        <div className="mb-1">
          <p className={`text-xs font-bold uppercase tracking-widest ${featured ? "text-[#E85D04]" : "text-gray-400"}`}>{plan}</p>
        </div>
        <div className="mt-3 mb-1">
          <span className="text-[44px] font-extrabold tracking-tight text-gray-900 leading-none">{price}</span>
        </div>
        <p className="text-sm text-gray-400 mb-6">{period}</p>
        <p className="text-sm text-gray-600 leading-relaxed flex-1">{description}</p>
        {featured && (
          <div className="mt-6 pt-5 border-t border-orange-100">
            <p className="text-sm font-bold text-[#E85D04] flex items-center gap-1.5">
              <HeroIcon paths={ICONS.trendUp} className="w-4 h-4" strokeWidth={2} />
              We win when you win.
            </p>
          </div>
        )}
      </div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navScrolled = useScrollY(24);

  /* ── Data ──────────────────────────────────────────── */
  const problems = [
    { icon: ICONS.trendUp,    color: "#E85D04", title: "Rising Acquisition Costs",
      body: "Paid CAC climbs every quarter while margins erode faster than revenue can compensate — killing profitability at scale." },
    { icon: ICONS.target,     color: C.blue,    title: "Conversion Stuck at 1–2%",
      body: "Traffic arrives but most visitors leave. Nobody has a data-backed roadmap to push that number meaningfully higher." },
    { icon: ICONS.eye,        color: C.purple,  title: "No Real Margin Visibility",
      body: "You can't see which SKUs, channels, or cohorts are profitable without waiting for a month-end spreadsheet." },
    { icon: ICONS.bolt,       color: C.amber,   title: "Ad-Spend Dependency",
      body: "Kill the ad budget and revenue flatlines. There's no owned growth engine running in the background to catch the fall." },
    { icon: ICONS.arrowPath,  color: C.teal,    title: "Weak Retention System",
      body: "Customers buy once and disappear — pushing LTV down and making the unit economics fragile at any revenue level." },
  ];

  const pillars = [
    { icon: ICONS.presentChart, color: C.orange,  title: "AI Profit Dashboard",
      body: "Real-time margins, CAC, LTV, and blended ROAS — one live view, zero spreadsheet lag, built directly on your Shopify data." },
    { icon: ICONS.sparkles,     color: C.purple,  title: "AI Ad Creative Engine",
      body: "Continuous generation of high-performing ad creatives, trained on your brand data and past results for maximum relevance." },
    { icon: ICONS.target,       color: C.blue,    title: "AI Conversion Optimization",
      body: "Systematic store audits and A/B testing frameworks that lift CVR and revenue per visitor across every page." },
    { icon: ICONS.arrowPath,    color: C.green,   title: "AI Retention Engine",
      body: "Email, SMS, and loyalty flows that build repeat-purchase habits, increase LTV, and dramatically reduce churn." },
    { icon: ICONS.cubeTransp,   color: C.amber,   title: "AI Demand Forecasting",
      body: "Predict demand before stockouts cost you revenue — powered by your own historical sell-through and trend data." },
  ];

  const auditDeliverables = [
    "Profit & margin analysis across all channels and SKUs",
    "CAC / LTV breakdown by acquisition source",
    "Marketing ROI and blended ROAS audit",
    "Conversion rate analysis and opportunity map",
    "Retention gap analysis and lifecycle scoring",
  ];

  const clients = [
    "Ecommerce brands doing $250k+ in annual revenue",
    "Founders actively running paid ads on Meta, Google, or TikTok",
    "Brands that want data-driven decisions — not gut-feel growth",
    "Operators focused on profitable scaling, not vanity metrics",
  ];

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-gray-900 antialiased overflow-x-hidden"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ════ GLOBAL STYLES ════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }

        /* ── gradient text ─────────────── */
        .text-grad {
          background: linear-gradient(135deg, #E85D04 0%, #f97316 50%, #fb923c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .text-grad-cool {
          background: linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── hero mesh gradient ────────── */
        .hero-mesh {
          background-color: #FAFAF8;
          background-image:
            radial-gradient(ellipse 130% 80% at 60% -20%, rgba(232,93,4,.14) 0%, transparent 55%),
            radial-gradient(ellipse 60% 70% at 95% 60%,  rgba(124,58,237,.09) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 5%  80%,  rgba(3,105,161,.07)  0%, transparent 50%);
        }

        /* ── section tints ─────────────── */
        .bg-tint-orange {
          background-image: radial-gradient(ellipse 80% 120% at 0% 50%, rgba(232,93,4,.055) 0%, transparent 60%);
          background-color: #fff;
        }
        .bg-tint-purple {
          background-image: radial-gradient(ellipse 70% 100% at 100% 40%, rgba(124,58,237,.055) 0%, transparent 55%);
          background-color: #FAFAF8;
        }
        .bg-tint-blue {
          background-image: radial-gradient(ellipse 80% 80% at 50% 100%, rgba(3,105,161,.06) 0%, transparent 55%);
          background-color: #fff;
        }

        /* ── final cta ─────────────────── */
        .bg-cta {
          background-color: #FFF4EE;
          background-image:
            radial-gradient(ellipse 90% 70% at 50% 50%, rgba(232,93,4,.14) 0%, transparent 60%),
            radial-gradient(ellipse 50% 80% at 10% 85%, rgba(124,58,237,.08) 0%, transparent 50%);
          border-top: 1px solid #fde0cc;
        }

        /* ── pill / badge ──────────────── */
        .pill-live {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 14px; border-radius: 9999px;
          font-size: 12px; font-weight: 700; letter-spacing: .04em;
          border: 1px solid rgba(232,93,4,.22);
          background: rgba(232,93,4,.07);
          color: #c24e00;
        }
        .pill-live .liveDot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #E85D04; flex-shrink: 0;
          animation: dotPulse 2.2s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.45; transform:scale(1.6); }
        }

        /* ── compare panels ────────────── */
        .panel-bad  { background:#fef2f2; border-color:#fecaca !important; }
        .panel-good { background:#f0fdf4; border-color:#bbf7d0 !important; }

        /* ── step connector line ───────── */
        .steps-grid { position: relative; }
        .steps-grid::before {
          content: '';
          display: none;
          position: absolute;
          top: 28px; left: calc(16.66% + 12px); right: calc(16.66% + 12px);
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #e5e7eb 20%, #e5e7eb 80%, transparent 100%);
        }
        @media (min-width: 768px) { .steps-grid::before { display: block; } }

        /* ── trust-bar logos ───────────── */
        .trust-logo {
          font-size: 13px; font-weight: 800; letter-spacing: .04em;
          color: #d1d5db; user-select: none;
          transition: color .2s;
        }
        .trust-logo:hover { color: #9ca3af; }

        /* ── audit deliverable row ─────── */
        .deliverable-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 16px; border-radius: 12px;
          background: #fff; border: 1px solid #f3f4f6;
          box-shadow: 0 1px 4px rgba(0,0,0,.04);
          transition: border-color .2s, box-shadow .2s;
        }
        .deliverable-row:hover {
          border-color: rgba(232,93,4,.2);
          box-shadow: 0 2px 10px rgba(232,93,4,.06);
        }

        nav a { text-decoration: none; }
        a { text-decoration: none; }
      `}</style>

      {/* ════ NAV ═══════════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300
          ${navScrolled
            ? "bg-white/94 backdrop-blur-lg border-b border-gray-200 shadow-[0_1px_16px_rgba(0,0,0,.06)]"
            : ""}`}
      >
        <nav className="max-w-6xl mx-auto px-5 h-[60px] flex items-center justify-between">

          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E85D04] to-[#f97316] flex items-center justify-center shadow-[0_2px_8px_rgba(232,93,4,.35)]">
              <svg viewBox="0 0 20 20" fill="none" className="w-4.5 h-4.5">
                <path d="M4 15 8 6l3.5 5.5L14 7l3 5" stroke="white" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-[15px] text-gray-900 tracking-tight">LeverAI</span>
              <span className="font-normal text-[15px] text-gray-400 tracking-tight"> Ventures</span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {[
              ["#how-it-works", "How It Works"],
              ["#pillars",      "Our System"],
              ["#who",          "Who It's For"],
              ["#audit",        "AI Profit Audit"],
            ].map(([href, label]) => (
              <a key={label} href={href}
                className="text-[14px] font-medium text-gray-500 hover:text-gray-900 px-3.5 py-2 rounded-xl hover:bg-gray-100 transition-all duration-150">
                {label}
              </a>
            ))}
            <div className="w-px h-5 bg-gray-200 mx-3" />
            <CTABtn size="md" />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <HeroIcon paths={menuOpen ? ICONS.xMark : ICONS.bars3} className="w-5 h-5" strokeWidth={2} />
          </button>
        </nav>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl px-5 py-5 flex flex-col gap-1">
            {[
              ["#how-it-works", "How It Works"],
              ["#pillars",      "Our System"],
              ["#who",          "Who It's For"],
              ["#audit",        "AI Profit Audit"],
            ].map(([href, label]) => (
              <a key={label} href={href}
                className="text-[15px] font-medium text-gray-700 py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
            <div className="pt-3 border-t border-gray-100 mt-2">
              <CTABtn size="lg" className="w-full justify-center" />
            </div>
          </div>
        )}
      </header>

      {/* ════ HERO ═══════════════════════════════════════════════════ */}
      <section className="hero-mesh relative pt-[100px] pb-24 overflow-hidden">

        {/* Decorative rings */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[900, 680, 480].map((s, i) => (
            <div key={s}
              className="absolute rounded-full border border-[#E85D04]"
              style={{
                width: s, height: s,
                top: -s * 0.4, left: "50%",
                transform: "translateX(-50%)",
                opacity: 0.04 + i * 0.02,
              }} />
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-5 relative">
          <div className="grid lg:grid-cols-2 gap-14 xl:gap-20 items-center">

            {/* LEFT ─────────────────────────────── */}
            <div>
              <Reveal>
                <div className="pill-live mb-6">
                  <span className="liveDot" />
                  AI-Powered Profit Optimization
                </div>
              </Reveal>

              <Reveal delay={70}>
                <h1 className="text-[54px] md:text-[68px] font-extrabold leading-[1.03] tracking-[-0.032em] text-gray-900 mb-6">
                  Profit<br />
                  Optimization<br />
                  <span className="text-grad">for Ecommerce</span>
                </h1>
              </Reveal>

              <Reveal delay={140}>
                <p className="text-[17px] text-gray-500 leading-[1.7] mb-3 max-w-[420px]">
                  We help ecommerce brands scale profitably by combining AI-driven growth systems with focus on right metrics that drive profitability.
                </p>
                <p className="text-sm text-gray-400 leading-relaxed mb-9 max-w-[400px]">
                  Most agencies simply increase your ad spend to drive revenue growth with little focus on profitability. We perform end-to-end optimization to drive growth with profitability.
                </p>
              </Reveal>

              <Reveal delay={200}>
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <CTABtn size="lg" />
                  <CTABtn size="lg" variant="ghost" />
                </div>
                <p className="text-xs text-gray-400">For brands doing $500k–$20M annually · No commitment required</p>
              </Reveal>

              {/* Stat strip */}
              <Reveal delay={270}>
                <div className="mt-10 pt-9 border-t border-gray-200/70">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      ["4.2×",  "Avg ROAS lift",   "avg across clients"],
                      ["−31%",  "CAC reduction",   "vs. baseline"],
                      ["+18pt", "Gross margin",    "improvement"],
                    ].map(([v, l, s]) => (
                      <div key={l}>
                        <div className="text-[26px] font-extrabold text-gray-900 tracking-tight leading-none">{v}</div>
                        <div className="text-xs font-semibold text-[#E85D04] mt-1.5 uppercase tracking-wide">{l}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{s}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* RIGHT ─────────────────────────────── */}
            <Reveal delay={100} className="flex flex-col gap-3">
              <DashboardWidget />

              {/* Tech chip row */}
              <div className="flex flex-wrap gap-2 mt-1">
                {["Shopify Native", "Real-time Data", "No Code Setup", "Fractional CFO", "AI-Powered"].map(t => (
                  <span key={t}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full
                      bg-white border border-gray-200 text-gray-500 shadow-sm hover:border-gray-300 hover:text-gray-700 transition-colors cursor-default">
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ════ TRUST BAR ══════════════════════════════════════════════ */}
      <section className="border-y border-gray-100/80 bg-white py-6">
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-center text-[11px] font-bold uppercase tracking-[.14em] text-gray-300 mb-5">
            Built for brands operating on
          </p>
          <div className="flex items-center justify-center flex-wrap gap-8 md:gap-14">
            {[
              { name: "Shopify",    icon: "S" },
              { name: "Meta Ads",   icon: "M" },
              { name: "Google Ads", icon: "G" },
              { name: "MailChimp", icon: "M" },
              { name: "Klaviyo",    icon: "K" },
              { name: "Other systems",    icon: "O" },
            ].map(({ name, icon }) => (
              <div key={name} className="flex items-center gap-2 trust-logo group cursor-default">
                <span className="w-5 h-5 rounded-md bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center text-[10px] font-black text-gray-400 transition-colors">
                  {icon}
                </span>
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ THE PROBLEM ════════════════════════════════════════════ */}
      <section className="bg-tint-orange py-24">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal className="mb-14">
            <EyeBrow>The Problem</EyeBrow>
            <SectionHeading
              sub="Scaling revenue is relatively straightforward. Scaling profit — while managing CAC, margins, and retention — is where most brands get stuck."
            >
              Growing Revenue Isn't the<br />
              <span className="text-gray-400 font-normal">Same as Growing Profit</span>
            </SectionHeading>
          </Reveal>

          {/* 2-up top + 3-up bottom */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {problems.map((p, i) => (
              <FeatureCard key={p.title} icon={p.icon} iconColor={p.color}
                title={p.title} body={p.body} delay={i * 65} />
            ))}
          </div>
        </div>
      </section>

      {/* ════ WHY AGENCIES FAIL ══════════════════════════════════════ */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal className="mb-14">
            <EyeBrow>The Gap</EyeBrow>
            <SectionHeading>
              Traditional Agencies Optimize Traffic.<br />
              <span className="text-grad">We Optimize Profit.</span>
            </SectionHeading>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5 max-w-3xl">
            {/* Bad column */}
            <Reveal>
              <div className="rounded-2xl border p-8 panel-bad h-full">
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <HeroIcon paths={ICONS.xCircle} className="w-4 h-4" strokeWidth={2} />
                  Most Agencies Focus On
                </p>
                <div className="space-y-3.5">
                  {["Clicks & impressions", "Ad spend volume", "Top-line revenue", "Traffic at any cost"].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-500">
                        <HeroIcon paths={ICONS.xMark} className="w-3 h-3" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Good column */}
            <Reveal delay={100}>
              <div className="rounded-2xl border p-8 panel-good h-full">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <HeroIcon paths={ICONS.checkCircle} className="w-4 h-4" strokeWidth={2} />
                  Founders Actually Need
                </p>
                <div className="space-y-3.5">
                  {[
                    "Profit visibility in real time",
                    "Conversion rate optimization",
                    "Retention & lifecycle systems",
                    "Financial intelligence — CAC, LTV, margins",
                  ].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                        <HeroIcon paths={ICONS.check} className="w-3 h-3" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ════ LEVERAI PILLARS ════════════════════════════════════════ */}
      <section id="pillars" className="bg-tint-purple py-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal className="mb-14">
            <EyeBrow>The LeverAI System</EyeBrow>
            <SectionHeading
              sub="Five interconnected AI systems that compound over time — transforming the way you acquire, convert, and retain customers profitably."
            >
              Five Systems That Compound<br />
              <span className="text-gray-400 font-normal">Into Profitable Growth</span>
            </SectionHeading>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillars.map((p, i) => (
              <FeatureCard key={p.title} icon={p.icon} iconColor={p.color}
                title={p.title} body={p.body} delay={i * 60} />
            ))}
          </div>
        </div>
      </section>

      {/* ════ HOW IT WORKS ═══════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-tint-blue py-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal className="mb-14">
            <EyeBrow>Process</EyeBrow>
            <SectionHeading sub="Three clear phases — from diagnosing your current state to deploying systems and compounding results.">
              Three Steps to Profitable Scale
            </SectionHeading>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 steps-grid">
            {[
              { n: "01", title: "AI Profit Audit",
                body: "Deep diagnostic of your margins, CAC, conversion funnel, and retention — delivered with a prioritized action map." },
              { n: "02", title: "Install LeverAI Systems",
                body: "We deploy the full stack: profit dashboard, ad creative engine, A/B conversion tests, and retention flows." },
              { n: "03", title: "Optimize & Scale",
                body: "Continuous, signal-driven iteration to compound profitability as your revenue grows quarter over quarter." },
            ].map((s, i) => (
              <StepCard key={s.n} number={s.n} title={s.title} body={s.body}
                isLast={i === 2} delay={i * 90} />
            ))}
          </div>
        </div>
      </section>

      {/* ════ PRICING ════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#FAFAF8] border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal className="mb-14">
            <EyeBrow>Engagement Models</EyeBrow>
            <SectionHeading sub="Two models — both structured so our incentives stay tightly aligned with your growth and profitability.">
              Aligned With Founder Success
            </SectionHeading>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
            <PricingCard
              plan="Standard Retainer"
              price="Fixed  $"
              period="per month"
              description="Full-stack deployment of the LeverAI system with ongoing optimization, weekly reporting, and fractional CFO guidance for your brand."
              delay={0}
            />
            <PricingCard
              plan="Aligned Growth Model"
              price={<>Low Base <span className="text-grad">+ % Growth</span></>}
              period="performance-linked"
              description="Reduced monthly base combined with a share of measurable profit improvement or revenue growth. Reserved for brands we believe have strong upside potential."
              featured={true}
              delay={100}
            />
          </div>
        </div>
      </section>

      {/* ════ WHO THIS IS FOR ════════════════════════════════════════ */}
      <section id="who" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-start">

            {/* Left */}
            <Reveal>
              <EyeBrow>Ideal Fit</EyeBrow>
              <SectionHeading
                sub="We work selectively with a small number of brands at a time — so we can go deep on every engagement rather than spread thin."
              >
                Who We Work With
              </SectionHeading>

              {/* Mini stat grid */}
              <div className="grid grid-cols-2 gap-3 mt-10">
                {[
                  { v: "$250k+",  l: "Min. Annual Revenue",  c: C.orange  },
                  { v: "8–10",    l: "Active Clients Max",   c: C.purple  },
                  { v: "45 min",  l: "Audit Session",        c: C.blue    },
                  { v: "3–6mo",   l: "Avg. ROI Horizon",     c: C.green   },
                ].map(({ v, l, c }) => (
                  <div key={l}
                    className="rounded-xl border border-gray-100 bg-[#FAFAF8] px-4 py-4 hover:border-gray-200 hover:bg-white transition-all duration-150">
                    <div className="text-xl font-extrabold tracking-tight" style={{ color: c }}>{v}</div>
                    <div className="text-xs text-gray-500 mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Right checklist */}
            <div className="space-y-3 pt-2">
              {clients.map((item, i) => (
                <Reveal key={item} delay={i * 70}>
                  <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-[#FAFAF8] px-5 py-4
                    hover:border-[rgba(232,93,4,.2)] hover:bg-white hover:shadow-[0_2px_12px_rgba(232,93,4,.06)]
                    transition-all duration-200 cursor-default">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-emerald-600">
                      <HeroIcon paths={ICONS.check} className="w-3 h-3" strokeWidth={2.5} />
                    </div>
                    <span className="text-[14px] text-gray-700 leading-relaxed">{item}</span>
                  </div>
                </Reveal>
              ))}

              <Reveal delay={320}>
                <div className="mt-6">
                  <CTABtn size="lg" />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ════ AI PROFIT AUDIT ════════════════════════════════════════ */}
      <section id="audit" className="py-24 border-t border-gray-100 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-5">
          <Reveal>
            <div className="relative rounded-3xl border border-orange-200 overflow-hidden
              bg-gradient-to-br from-[#fff8f5] via-white to-[#fefefe]
              shadow-[0_2px_40px_rgba(232,93,4,.10),0_0_0_1px_rgba(232,93,4,.06)]">

              {/* Decorative gradient blob */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-[#E85D04]/10 to-transparent translate-x-1/3 -translate-y-1/3 pointer-events-none" />

              <div className="relative grid lg:grid-cols-2 gap-12 p-10 md:p-14">

                {/* Left */}
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E85D04] to-[#f97316] flex items-center justify-center mb-5 shadow-[0_4px_16px_rgba(232,93,4,.3)]">
                    <HeroIcon paths={ICONS.sparkles} className="w-6 h-6 text-white" strokeWidth={1.75} />
                  </div>
                  <EyeBrow>Free Diagnostic</EyeBrow>
                  <h2 className="text-[34px] md:text-[40px] font-extrabold tracking-tight text-gray-900 leading-tight mb-4">
                    Start With an<br />AI Profit Audit
                  </h2>
                  <p className="text-[16px] text-gray-500 leading-relaxed mb-8 max-w-md">
                    A comprehensive diagnostic of your ecommerce growth system — not a sales pitch. You'll leave with clear, actionable insight into exactly where profit is leaking and how to fix it.
                  </p>
                  <CTABtn size="xl" />
                  <p className="mt-3.5 text-xs text-gray-400 flex items-center gap-2">
                    <HeroIcon paths={ICONS.check} className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
                    No commitment · 45-minute deep-dive · Completely free
                  </p>
                </div>

                {/* Right deliverables */}
                <div className="flex flex-col justify-center gap-2.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">What you'll receive</p>
                  {auditDeliverables.map((item, i) => (
                    <Reveal key={item} delay={i * 55}>
                      <div className="deliverable-row">
                        <div className="w-5 h-5 rounded-full bg-[#E85D04]/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#E85D04]">
                          <HeroIcon paths={ICONS.check} className="w-3 h-3" strokeWidth={2.5} />
                        </div>
                        <span className="text-[14px] text-gray-700 leading-snug">{item}</span>
                      </div>
                    </Reveal>
                  ))}
                </div>

              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════ FINAL CTA ══════════════════════════════════════════════ */}
      <section className="bg-cta py-28 md:py-36 text-center">
        <div className="max-w-2xl mx-auto px-5">
          <Reveal>
            <div className="pill-live mx-auto mb-8 w-fit">
              <span className="liveDot" />
              Limited spots available
            </div>

            <h2 className="text-[50px] md:text-[64px] font-extrabold tracking-[-0.028em] leading-[1.05] text-gray-900 mb-6">
              Ready to Scale<br />
              <span className="text-grad">Profitably?</span>
            </h2>

            <p className="text-[17px] text-gray-500 leading-relaxed mb-4 max-w-lg mx-auto">
              Book a call and we'll review your store together — walk through your unit economics, surface growth opportunities, and determine if we're the right fit.
            </p>
            <p className="text-sm text-gray-400 mb-10">No fluff. No strategy decks. Just clarity on your path to profitable growth.</p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <CTABtn size="xl" />
            </div>

            {/* Mini trust bar */}
            <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
              {[
                [ICONS.check, "No commitment"],
                [ICONS.bolt,  "45-min session"],
                [ICONS.eye,   "Actionable insight"],
              ].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <HeroIcon paths={icon} className="w-3.5 h-3.5 text-[#E85D04]" strokeWidth={2} />
                  {label}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════ FOOTER ═════════════════════════════════════════════════ */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#E85D04] to-[#f97316] flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <path d="M4 15 8 6l3.5 5.5L14 7l3 5" stroke="white" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-700">LeverAI
              <span className="font-normal text-gray-400"> Ventures</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5">
            {["Privacy","Terms","Contact"].map(l => (
              <a key={l} href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">{l}</a>
            ))}
          </div>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} LeverAI Ventures
          </p>
        </div>
      </footer>

    </div>
  );
}
