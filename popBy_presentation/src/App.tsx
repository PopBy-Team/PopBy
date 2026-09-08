import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Footprints,
  Map,
  Palette,
  ShoppingBag,
  Sparkles,
  Store,
  Ticket,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

const introductionUrl = "https://popbypop.vercel.app";

export type Slide = {
  eyebrow: string;
  title: string;
  italic: string;
  copy: string;
  source: string;
  icon: typeof Users;
  content: React.ReactNode;
  cover?: boolean;
  visualOnly?: boolean;
  businessKind?: "B2C" | "B2B";
};

const card = (number: string, heading: string, body: string, source?: string) => (
  <article className="card">
    <strong>{number}</strong>
    <h3>{heading}</h3>
    <p>{body}</p>
    {source && <small>{source}</small>}
  </article>
);

export const slides: Slide[] = [
  { eyebrow: "", title: "", italic: "", copy: "", source: "", icon: Sparkles, content: null, cover: true },
  {
    eyebrow: "01 / RESEARCH & EVIDENCE",
    source: "EVIDENCE  Ending Loneliness Together · Orygen · headspace · ABS · AIHW",
    icon: BarChart3,
    title: "Loneliness can feel",
    italic: "very public",
    copy: "Even when people are connected online, the pressure to look fine can make genuine presence feel further away.",
    content: <div className="cards compact evidence-grid">{card("> 40%", "Chronic loneliness", "15–24 year olds report the highest rates.", "Ending Loneliness Together & Orygen")}{card("60–62%", "Excluded", "Many feel a lack of companionship.", "Headspace youth survey")}{card("2×", "Need for safety", "Young women report greater social anxiety.", "ABS & AIHW")}{card("Quiet", "Performance fatigue", "Connection should not be another audition.", "Orygen")}</div>,
  },
  {
    eyebrow: "02 / MARKET POSITIONING",
    source: "",
    icon: Users,
    title: "A generation that",
    italic: "wants softer connection",
    copy: "They want company. They do not want the pressure of a plan, a performance or a reply.",
    content: <div className="split"><article className="warm-card"><span>CORE AUDIENCE</span><h3>18–25<br />Gen Z</h3><p>Students and early-career people moving through a city while holding their boundaries close.</p></article><article className="spectrum"><span>WHERE POPBY SITS</span><div><p>Solitude<small>isolated</small></p><b>Ambient connection<small>PopBy</small></b><p>Active socialising<small>high pressure</small></p></div></article></div>,
  },
  {
    eyebrow: "03 / MARKET SIGNALS",
    source: "EVIDENCE  ABS Consumer Price Index · RACGP · AusPlay",
    icon: Footprints,
    title: "The city became",
    italic: "the plan",
    copy: "When a casual night out costs more, a walk is still a way to leave the room and meet the world.",
    content: <div className="cards three compact">{card("01", "Cost", "A walk stays free when a meetup does not.")}{card("02", "Micro-outdoors", "A small route can shift the whole day.")}{card("03", "Solo, not isolated", "Going alone still leaves room for presence.")}</div>,
  },
  {
    eyebrow: "04 / ACADEMIC FOUNDATION",
    source: "FOUNDATION  Scannell & Gifford · Urban Belonging Photo App · Levordashka & Utz",
    icon: BookOpen,
    title: "A place becomes real",
    italic: "when feeling stays",
    copy: "A corner, a bench, a street. Meaning arrives when people leave a small part of themselves there.",
    content: <div className="quote"><span>PLACE ATTACHMENT</span><blockquote>“A physical space becomes a lived place through the fragments people attach to it.”</blockquote><p>Scannell &amp; Gifford</p></div>,
  },
  {
    eyebrow: "05 / USER PAIN POINTS",
    source: "",
    icon: AlertCircle,
    title: "Four reasons to",
    italic: "stay home",
    copy: "The barriers are not a lack of desire. They are the weight that arrives before a simple hello.",
    content: <div className="pain-copy"><b>PopBy makes the first step smaller.</b><p>Location turns a vague wish for connection into a small, low-pressure moment in the world outside.</p><a className="showcase-link" href={introductionUrl} target="_blank" rel="noreferrer">Open the PopBy experience <ArrowUpRight size={16} /></a></div>,
  },
  {
    eyebrow: "06 / GROWTH & EXPANSION",
    source: "MODEL  PopBy launch milestones and engagement signals",
    icon: Compass,
    title: "A suburb grows",
    italic: "through shared traces",
    copy: "Fitzroy starts small. Community activity earns the next neighbourhood, one shared threshold at a time.",
    content: <div className="growth-summary strategy-stack"><article className="growth-step"><span>01</span><div><small className="strategy-kicker">LOCAL LAUNCH</small><h3>Unlock the suburb</h3><p>Fitzroy launches first. Four shared milestones open the next suburb.</p></div></article><article className="growth-step"><span>02</span><div><small className="strategy-kicker">DISCOVERY SIGNALS</small><h3>Rank hidden gems</h3><p>Engagement history and postcode signals surface places worth a detour. Image clustering can follow.</p></div></article><article className="growth-step"><span>03</span><div><small className="strategy-kicker">ORGANIC REACH</small><h3>Share Corner Stories</h3><p>High dwell time Thoughts become social posters that bring new people back to the map.</p></div></article></div>,
  },
  {
    eyebrow: "07 / BUSINESS MODEL · B2C",
    source: "MODEL  PopBy monetization principles",
    icon: ShoppingBag,
    title: "Poetic & Non-Invasive",
    italic: "Monetization",
    copy: "Monetizing through foot traffic and emotional experiences—never invasive ads or social clout.",
    businessKind: "B2C",
    content: <div className="revenue-content strategy-stack"><div className="revenue-grid"><article className="revenue-card b2c"><i className="strategy-signal" aria-hidden="true" /><span className="strategy-kicker">01 / B2C</span><h3>Aesthetics &amp; Memory Plus</h3><p>Paid themes, private memory maps, annual recaps and digital postcards.</p><small>SEASONAL THEMES · MY MAP · YEAR RECAP</small></article><article className="revenue-card b2c"><i className="strategy-signal" aria-hidden="true" /><span className="strategy-kicker">02 / B2C</span><h3>Stories You Can Keep</h3><p>Loved public Thoughts become licensed city maps, zines and postcards.</p><small>FITZROY ZINE · CITY MAP · POSTCARDS</small></article></div><div className="revenue-guardrail"><span>No social clout</span><span>No who viewed me</span><span>Public core stays free</span></div></div>,
  },
  {
    eyebrow: "08 / BUSINESS MODEL · B2B",
    source: "MODEL  PopBy monetization principles",
    icon: Store,
    title: "Poetic & Non-Invasive",
    italic: "Monetization",
    copy: "Monetizing through foot traffic and emotional experiences—never invasive ads or social clout.",
    businessKind: "B2B",
    content: <div className="revenue-content strategy-stack"><div className="revenue-grid"><article className="revenue-card b2b"><i className="strategy-signal" aria-hidden="true" /><span className="strategy-kicker">01 / B2B</span><h3>Hidden Treasures</h3><p>Indie shops subscribe to anchor stories and gentle perks that bring people through the door.</p><small>STORE STORY · QUIET PERK · REAL VISIT</small></article><article className="revenue-card b2b"><i className="strategy-signal" aria-hidden="true" /><span className="strategy-kicker">02 / B2B</span><h3>Cultural Trails</h3><p>Selected brands sponsor carefully designed city walks with sound and stories.</p><small>QUIET WALK · SOUND LAYER · CITY STORY</small></article></div><div className="revenue-guardrail"><span>No intrusive ads</span><span>No paid visibility</span><span>Partner stories stay useful</span></div></div>,
  },
  { eyebrow: "", source: "", icon: Compass, title: "", italic: "", copy: "", content: null, visualOnly: true },
];

function Person({ className = "" }: { className?: string }) {
  return <div className={`person ${className}`}><i /><b /><span /><em /></div>;
}

function CoverScene() {
  return <div className="cover-scene" role="img" aria-label="PopBy presentation cover"><div className="cover-grid" /><motion.span className="cover-orbit orbit-a" animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} /><motion.span className="cover-orbit orbit-b" animate={{ rotate: -360 }} transition={{ duration: 31, repeat: Infinity, ease: "linear" }} /><div className="cover-fireflies" aria-hidden="true"><i /><i /><i /><i /><i /></div><div className="cover-mark"><motion.div className="cover-mark-inner" initial={{ opacity: 0, scale: .86 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8, ease: [.2, .8, .2, 1] }}><div className="cover-logo">PopBy<span>.</span></div><h1>Pop up when<br /><em>you pop by.</em></h1><p>RESEARCH · EXPERIENCE · BUSINESS</p></motion.div></div><motion.div className="cover-walk" animate={{ x: [-28, 28, -28] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}><Footprints size={25} /></motion.div></div>;
}

function ConsumerRevenueScene() {
  return <div className="scene revenue-scene consumer-scene" role="img" aria-label="PopBy consumer revenue model"><motion.div className="memory-orbit" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}><span><Palette size={19} /></span><span><Map size={19} /></span><span><BookOpen size={19} /></span></motion.div><div className="revenue-core"><Sparkles size={34} /><b>MY<br />MEMORIES</b><small>private + beautiful</small></div><article className="revenue-stream stream-memory"><span>B2C</span><Palette size={21} /><b>THEMES</b><small>seasonal details</small></article><article className="revenue-stream stream-print"><span>B2C</span><BookOpen size={21} /><b>KEEPSAKES</b><small>zines + recaps</small></article><div className="postcard-stack"><i /><i /><b>FITZROY<br /><small>MEMORY MAP</small></b></div><p>pay for a richer way<br />to keep what mattered</p></div>;
}

function PartnerRevenueScene() {
  return <div className="scene revenue-scene partner-scene" role="img" aria-label="PopBy partner revenue model"><svg className="partner-route" viewBox="0 0 500 430" aria-hidden="true"><path d="M44 329C121 264 126 117 241 126s113 183 220 118" /></svg><motion.div className="route-spark" animate={{ offsetDistance: ["0%", "100%"] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>✦</motion.div><div className="revenue-core"><Footprints size={34} /><b>REAL<br />VISITS</b><small>foot traffic</small></div><article className="revenue-stream stream-shop"><span>B2B</span><Store size={21} /><b>LOCAL SHOPS</b><small>stories + perks</small></article><article className="revenue-stream stream-trail"><span>B2B</span><Compass size={21} /><b>TRAILS</b><small>quiet city walks</small></article><motion.div className="gentle-ticket" animate={{ y: [0, -7, 0], rotate: [-2, 1, -2] }} transition={{ duration: 4, repeat: Infinity }}><Ticket size={18} /> oat milk on us</motion.div><p>places pay for footsteps,<br />not attention</p></div>;
}

export function Scene({ index }: { index: number }) {
  if (index === 0) return <CoverScene />;
  if (index === 1) return <div className="scene bench-scene"><div className="phone">notifications<br /><b>29</b></div><div className="bench" /><Person className="bench-person" /><motion.div animate={{ opacity: [.35, 1, .35], y: [0, -9, 0] }} transition={{ duration: 3, repeat: Infinity }} className="quiet-heart">♥</motion.div><p>surrounded by signals,<br />still feeling unseen</p></div>;
  if (index === 2) return <div className="scene persona-scene"><div className="window" /><motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 3.5, repeat: Infinity }} className="thought">“Maybe I’ll take the long way home.”</motion.div><Person className="persona-main" /><Person className="persona-friend" /><div className="plant" /><p>commuting, waiting,<br />wanting a gentler way in</p></div>;
  if (index === 3) return <div className="scene walk-scene"><div className="cafe">$</div><div className="tree" /><div className="sidewalk" /><motion.div animate={{ x: [0, 52, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}><Person className="walk-person" /></motion.div><div className="dog"><i /><b /></div><p>the cheapest plan<br />is a walk around the block</p></div>;
  if (index === 4) return <div className="scene place-scene"><div className="corner-building"><b>GROCER</b></div><div className="memory-note">I came here after<br />my first interview.</div><motion.div animate={{ scale: [.92, 1.06, .92] }} transition={{ duration: 2.7, repeat: Infinity }} className="pin">✦</motion.div><Person className="place-person" /><p>the city remembers<br />what we attach to it</p></div>;
  if (index === 5) return <div className="scene pain-scene" role="img" aria-label="Pain-point concept hierarchy"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" /><b className="pain-layer layer-emotional">EMOTIONAL</b><b className="pain-layer layer-financial">FINANCIAL</b><b className="pain-layer layer-behavioural">BEHAVIOURAL</b><b className="pain-layer layer-contextual">CONTEXTUAL</b><span className="pain-word word-one" data-weight="primary">THE COST</span><span className="pain-word word-two" data-weight="primary">SAFETY</span><span className="pain-word word-three" data-weight="primary">WHO TO ASK?</span><span className="pain-word word-four" data-weight="secondary">REPLY NOW</span><span className="pain-word word-five" data-weight="primary">TOO MUCH</span><span className="pain-word word-six" data-weight="secondary">WHAT IF?</span><span className="pain-word word-seven" data-weight="secondary">BOUNDARIES</span><span className="pain-word word-eight" data-weight="secondary">NO PLAN</span><span className="pain-word word-nine" data-weight="tertiary">SOCIAL ENERGY</span><span className="pain-word word-ten" data-weight="tertiary">WHERE TO GO?</span><span className="pain-word word-eleven" data-weight="tertiary">AWKWARD?</span><span className="pain-word word-twelve" data-weight="tertiary">TIMING</span><motion.div animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} className="pain-center"><AlertCircle size={42} /><b>THE<br />WEIGHT</b></motion.div><p>the barriers arrive<br />before the invitation</p></div>;
  if (index === 6) return <div className="scene growth-scene" role="img" aria-label="Fitzroy community growth flywheel"><div className="growth-grid" /><div className="flywheel-loop" /><motion.div animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }} className="growth-pulse"><i /><i /><i /></motion.div><div className="growth-hub"><Compass size={34} /><b>FITZROY</b><small>LAUNCH SUBURB</small></div><article className="flywheel-node node-unlock"><Users size={22} /><b>UNLOCK</b><small>community milestones</small></article><article className="flywheel-node node-rank"><Footprints size={22} /><b>RANK</b><small>hidden gems</small></article><article className="flywheel-node node-share"><Sparkles size={22} /><b>SHARE</b><small>Corner Stories</small></article><div className="milestone-ribbon" aria-label="Fitzroy unlock milestones"><span className="milestone"><b>15</b><small>active places</small></span><span className="milestone"><b>50</b><small>Thoughts</small></span><span className="milestone"><b>30</b><small>contributors</small></span><span className="milestone"><b>50</b><small>unlocks</small></span></div><div className="next-suburb">CARLTON<small>NEXT</small></div><p>each active suburb helps<br />the next one begin</p></div>;
  if (index === 7) return <ConsumerRevenueScene />;
  if (index === 8) return <PartnerRevenueScene />;
  return <div className="finale-scene" role="img" aria-label="Centered smartphone product mockup"><motion.img className="phone-hero" src="/popby-phone-finale.png" alt="" animate={{ scale: [1, 1.006, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} /></div>;
}

export function SourceLabel({ source }: { source: string }) {
  if (!source) return null;
  const [type, detail = source] = source.split(/\s{2,}/, 2);
  return <aside className="source-label" aria-label="Report source"><strong>{type}</strong><span>{detail}</span></aside>;
}

const pageMotion = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 56 : -56, rotate: direction > 0 ? 1.2 : -1.2, scale: .985 }),
  center: { opacity: 1, x: 0, rotate: 0, scale: 1 },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -44 : 44, rotate: direction > 0 ? -1 : 1, scale: .99 }),
};

export default function App() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const goTo = (next: number) => {
    const bounded = Math.max(0, Math.min(slides.length - 1, next));
    if (bounded === current) return;
    setDirection(bounded > current ? 1 : -1);
    setCurrent(bounded);
  };
  const advance = (amount: number) => goTo(current + amount);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") advance(1);
      if (event.key === "ArrowLeft") advance(-1);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  });

  const slide = slides[current];
  const Icon = slide.icon;

  if (slide.cover) return <main className="cover-main"><Scene index={0} /><button className="cover-next" onClick={() => goTo(1)}>Begin the story <ChevronRight size={18} /></button></main>;
  if (slide.visualOnly) return <main className="finale-main"><motion.div className="finale-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .8 }}><Scene index={current} /></motion.div><button className="finale-back" onClick={() => advance(-1)}><ArrowLeft size={17} /> Back</button></main>;

  const strategySlide = current >= 6 && current <= 8;

  return <main><header><button className="brand brand-button" onClick={() => goTo(0)} aria-label="Return to cover">PopBy<span>.</span></button><div className="deck-name">RESEARCH &amp; PROBLEM DECK</div><div className="progress">{String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</div></header><section className={`stage${strategySlide ? " strategy-stage" : ""}${slide.businessKind ? " business-stage" : ""}`}><AnimatePresence mode="wait" custom={direction}><motion.div key={current} custom={direction} variants={pageMotion} initial="enter" animate="center" exit="exit" transition={{ duration: .52, ease: [.22, .75, .18, 1] }} className={`copy slide-${current + 1}`}><p className="eyebrow"><Icon size={15} />{slide.eyebrow}</p><h1>{slide.title}<br /><em>{slide.italic}</em></h1><p className="intro">{slide.copy}</p><div className="content">{slide.content}</div><SourceLabel source={slide.source} /></motion.div></AnimatePresence><AnimatePresence mode="wait" custom={direction}><motion.div key={`scene-${current}`} custom={direction} variants={pageMotion} initial="enter" animate="center" exit="exit" transition={{ duration: .66, delay: .04, ease: [.22, .75, .18, 1] }}><Scene index={current} /></motion.div></AnimatePresence></section><footer><button onClick={() => advance(-1)} disabled={!current}><ChevronLeft size={18} />Previous</button><div className="dots">{slides.map((_, index) => <button aria-label={`Go to slide ${index + 1}`} onClick={() => goTo(index)} className={index === current ? "active" : ""} key={index} />)}</div><button className="next" onClick={() => advance(1)} disabled={current === slides.length - 1}>Next<ChevronRight size={18} /></button></footer></main>;
}
