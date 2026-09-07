"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, MapPin, MessageCircleHeart, Navigation, Sparkles } from "lucide-react";

const appUrl = "https://pop-up-nu.vercel.app";

const rise = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stories = [
  { number: "01", title: "The Casual\nVisit", chinese: "顺路的轻盈", text: '“Pop by” is the simplest, most effortless invitation in daily life. No elaborate planning, no social agendas. Just step outside and casually turn a new corner.', color: "bg-[#E9C7B8]", dot: "bg-[#D8755A]" },
  { number: "02", title: "Popping\nUp", chinese: "浮现的记忆", text: "City architecture may be cold, but streets hold memories. As you draw near, invisible stories gently pop up like soft bubbles on your screen.", color: "bg-[#D5E2D5]", dot: "bg-[#7EAA91]" },
  { number: "03", title: "Presence\nwithout Pressure", chinese: "异步的陪伴", text: '“I passed by and left a piece of my mind; you walked by and picked up a spark of resonance.” Feel human connection without algorithmic noise.', color: "bg-[#EDE2B8]", dot: "bg-[#C59D44]" },
];

function StoryScene({ type }: { type: number }) {
  if (type === 0) return <div className="relative mb-5 h-[145px] overflow-hidden rounded-[1.25rem] border border-ink/10 bg-[#F8E4D9]/60" aria-hidden="true">
    <svg viewBox="0 0 360 150" className="h-full w-full fill-none" stroke="#7B5147" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 121C53 105 101 123 144 105s79-8 116 7 70-5 111-26" strokeWidth="1.5" opacity=".4" />
      <path className="scene-draw" d="M19 110h83M36 110V54h49v56M30 54h61M44 69h9m12 0h9M106 110V73h45v37m-52-37h59M120 87h16" strokeWidth="2" />
      <path d="M191 106c0-14 9-23 21-23s21 9 21 23M194 106h36" strokeWidth="2" />
      <path className="scene-draw-slow" d="M263 110V63m0 13c-12 3-17 10-20 17m20-17c12 3 17 10 20 17m-20-30 9-12M244 110h38" strokeWidth="2" />
      <path d="M310 104c5-19 18-32 33-40M328 64c-8 1-14 5-18 10m18-10c-1 8-5 14-10 18" strokeWidth="2" />
      <motion.g animate={{ x: [0, 30, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}><circle cx="157" cy="87" r="6" fill="#D8755A" stroke="none" /><path d="M157 94v13m-7-6 7-7 7 7m-7 6-5 7m5-7 5 7" strokeWidth="2" /></motion.g>
    </svg><span className="absolute left-4 top-3 text-[10px] font-medium text-ink/45">a small detour, no reason needed</span>
  </div>;
  if (type === 1) return <div className="relative mb-5 h-[145px] overflow-hidden rounded-[1.25rem] border border-ink/10 bg-[#E9F0E5]/70" aria-hidden="true">
    <svg viewBox="0 0 360 150" className="h-full w-full fill-none" stroke="#486D58" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 118h360" strokeWidth="1.5" opacity=".45" /><path className="scene-draw" d="M29 118V43h62v75M40 62h14m12 0h14M40 83h14m12 0h14M108 118V25h68v93m-52-72h14m12 0h14m-40 23h14m12 0h14m-40 23h14m12 0h14M199 118V57h50v61m-35-39h20m-20 19h20M269 118V37h56v81m-40-59h10m11 0h10m-31 22h10m11 0h10" strokeWidth="2" />
      <motion.g animate={{ y: [0, -9, 0], opacity: [.65, 1, .65] }} transition={{ duration: 3.2, repeat: Infinity, delay: .2 }}><path d="M95 53c0-8 8-12 14-6 6-6 14-2 14 6 0 9-14 17-14 17S95 62 95 53Z" fill="#7EAA91" stroke="none" /></motion.g>
      <motion.g animate={{ y: [0, -13, 0], opacity: [.55, 1, .55] }} transition={{ duration: 4, repeat: Infinity, delay: .7 }}><circle cx="188" cy="44" r="10" fill="#D8755A" stroke="none" /><path d="M184 44h8M188 40v8" stroke="#FDFBF7" strokeWidth="1.5" /></motion.g>
      <motion.g animate={{ y: [0, -8, 0], opacity: [.55, 1, .55] }} transition={{ duration: 3.5, repeat: Infinity }}><path d="M250 77c0-8 8-12 14-6 6-6 14-2 14 6 0 9-14 17-14 17S250 86 250 77Z" fill="#E3C157" stroke="none" /></motion.g>
    </svg><span className="absolute left-4 top-3 text-[10px] font-medium text-ink/45">the buildings remember</span>
  </div>;
  return <div className="relative mb-5 h-[145px] overflow-hidden rounded-[1.25rem] border border-ink/10 bg-[#F8F0D3]/75" aria-hidden="true">
    <svg viewBox="0 0 360 150" className="h-full w-full fill-none" stroke="#806B32" strokeLinecap="round" strokeLinejoin="round">
      <path d="M0 113c47-11 71 8 121 0s64-12 107 0 85 0 132-6" strokeWidth="1.5" opacity=".45" /><path className="scene-draw" d="M71 111V88h90v23M80 88l10-15h51l11 15M88 97h58M236 111V45m0 20c-16 3-22 13-24 23m24-23c16 3 22 13 24 23m-24-43 12-16M215 111h42" strokeWidth="2" />
      <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "125px 82px" }}><circle cx="108" cy="79" r="6" fill="#C59D44" stroke="none" /><path d="M108 86v16m-8-7 8-9 8 9m-8 7-5 8m5-8 5 8" strokeWidth="2" /></motion.g>
      <motion.g animate={{ rotate: [2, -2, 2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: .4 }} style={{ transformOrigin: "145px 82px" }}><circle cx="143" cy="79" r="6" fill="#7EAA91" stroke="none" /><path d="M143 86v16m-8-7 8-9 8 9m-8 7-5 8m5-8 5 8" strokeWidth="2" /></motion.g>
      <motion.path d="M178 48c0-10 10-14 17-7 7-7 17-3 17 7 0 11-17 21-17 21s-17-10-17-21Z" fill="#D8755A" stroke="none" animate={{ scale: [.9, 1.08, .9] }} transition={{ duration: 2.5, repeat: Infinity }} style={{ transformOrigin: "195px 58px" }} />
    </svg><span className="absolute left-4 top-3 text-[10px] font-medium text-ink/45">company, with room to breathe</span>
  </div>;
}

function FeatureSketch({ kind }: { kind: "pin" | "heart" | "spark" }) {
  const accent = kind === "pin" ? "#D8755A" : kind === "heart" ? "#7EAA91" : "#C59D44";
  return <div className="pointer-events-none absolute bottom-5 right-5 h-[76px] w-[118px] opacity-70" aria-hidden="true"><svg viewBox="0 0 118 76" className="h-full w-full fill-none" stroke={accent} strokeLinecap="round" strokeLinejoin="round"><path d="M3 59c18-14 33 5 52-8s32-16 59-5" strokeWidth="1.5" strokeDasharray="3 5" />{kind === "pin" && <><motion.circle cx="67" cy="29" r="17" animate={{ scale: [.9, 1.08, .9] }} transition={{ duration: 2.6, repeat: Infinity }} fill="#FDFBF7" strokeWidth="1.5" /><path d="M67 21c-4 0-7 3-7 7 0 6 7 12 7 12s7-6 7-12c0-4-3-7-7-7Z" fill={accent} stroke="none" /></>}{kind === "heart" && <motion.path d="M47 20c0-10 11-15 19-7 8-8 19-3 19 7 0 12-19 23-19 23S47 32 47 20Z" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} fill="#FDFBF7" strokeWidth="1.5" />}{kind === "spark" && <motion.path d="m67 13 4 14 14 4-14 4-4 14-4-14-14-4 14-4 4-14Z" animate={{ rotate: [0, 15, 0] }} transition={{ duration: 3.5, repeat: Infinity }} style={{ transformOrigin: "67px 31px" }} fill="#FDFBF7" strokeWidth="1.5" />}</svg></div>;
}

function HumanMoment({ type }: { type: "crossing" | "dog" | "shop" }) {
  const copy = type === "crossing" ? "You wait for the light. Someone else left a thought right where you are." : type === "dog" ? "A dog pauses at the same tree. Its person notices a kind note nearby." : "The corner store is still lit. A stranger leaves a little courage for tomorrow.";
  return <div className="relative mt-7 overflow-hidden rounded-2xl border border-ink/10 bg-paper/45 px-4 pb-3 pt-2"><svg viewBox="0 0 340 80" className="h-[74px] w-full fill-none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M0 63h340" strokeWidth="1.3" opacity=".35" />
    {type === "crossing" && <><path d="M7 60h121M15 60l18-17m3 17 18-17m3 17 18-17m3 17 18-17M144 60h63M151 60V18h39v42m-30-31h8m7 0h8m-23 13h8m7 0h8" strokeWidth="1.8" /><motion.g animate={{ x: [0, 17, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}><circle cx="218" cy="37" r="5" fill="#D8755A" stroke="none" /><path d="M218 43v12m-6-5 6-7 6 7m-6 5-4 6m4-6 4 6" strokeWidth="1.8" /></motion.g><motion.g animate={{ opacity: [.35, 1, .35] }} transition={{ duration: 2.5, repeat: Infinity }}><path d="M270 22c0-6 7-9 11-4 4-5 11-2 11 4 0 7-11 13-11 13s-11-6-11-13Z" fill="#D8755A" stroke="none" /></motion.g></>}
    {type === "dog" && <><path d="M8 60c33-12 70 3 100-5s53-12 91-2 82 2 133-8M205 60V18m0 17c-10 2-15 9-16 16m16-16c10 2 15 9 16 16m-16-33 8-11" strokeWidth="1.8" /><motion.g animate={{ x: [0, 14, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}><circle cx="73" cy="39" r="5" fill="#7EAA91" stroke="none" /><path d="M73 45v13m-6-6 6-7 6 7m-6 6-4 6m4-6 4 6M82 53c8-2 12 1 15 4m0 0c7-2 10 1 10 4s-4 5-8 3" strokeWidth="1.8" /></motion.g><motion.path d="M124 26c0-7 8-10 12-5 5-5 13-2 13 5 0 8-13 15-13 15s-12-7-12-15Z" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} fill="#7EAA91" stroke="none" /></>}
    {type === "shop" && <><path d="M21 60V24h88v36M15 24h100M35 35h23m13 0h23M35 47h23m13 0h23M143 60h180" strokeWidth="1.8" /><path d="M242 60V16m0 18c-13 2-18 10-20 17m20-17c13 2 18 10 20 17m-20-35 9-12" strokeWidth="1.8" /><motion.g animate={{ scale: [.92, 1.08, .92] }} transition={{ duration: 2.7, repeat: Infinity }} style={{ transformOrigin: "126px 33px" }}><path d="M117 32c0-7 7-10 12-5 5-5 12-2 12 5 0 8-12 15-12 15s-12-7-12-15Z" fill="#C59D44" stroke="none" /></motion.g><motion.g animate={{ x: [0, 12, 0] }} transition={{ duration: 5.5, repeat: Infinity }}><circle cx="183" cy="43" r="5" fill="#C59D44" stroke="none" /><path d="M183 49v11m-6-5 6-6 6 6m-6 5-4 6m4-6 4 6" strokeWidth="1.8" /></motion.g></>}
  </svg><p className="relative max-w-[380px] text-[11px] leading-5 text-ink/60"><span className="mr-1 font-semibold text-ink/75">A real moment:</span>{copy}</p></div>;
}

function LaunchButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <a href={appUrl} target="_blank" rel="noopener noreferrer" className={`group inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper transition duration-300 hover:-translate-y-0.5 hover:bg-clay focus:outline-none focus:ring-2 focus:ring-clay focus:ring-offset-2 ${className}`}>{children}<ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></a>;
}

function DevicePreview() {
  return <div className="relative mx-auto w-full max-w-[420px]">
    <div className="absolute -left-12 top-20 h-28 w-28 rounded-full bg-[#E7BBAA]/40 blur-2xl" />
    <div className="absolute -right-10 bottom-24 h-32 w-32 rounded-full bg-[#A5C4AD]/40 blur-2xl" />
    <motion.div initial={{ opacity: 0, rotate: 4, y: 30 }} animate={{ opacity: 1, rotate: 3, y: 0 }} transition={{ duration: .8, ease: "easeOut" }} className="relative overflow-hidden rounded-[2.5rem] border-[7px] border-[#292824] bg-[#F6EBDD] p-3 shadow-[18px_22px_0_rgba(42,40,36,.13)]">
      <div className="relative h-[470px] overflow-hidden rounded-[2rem] bg-[#DDE8D9]">
        <div className="absolute inset-0 opacity-45 paper-grid" />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 520" fill="none" aria-hidden="true">
          <path className="map-line" d="M-23 101C89 23 145 150 218 82s101 5 210-48M-11 347c71-88 139 10 213-68s124-58 222-33M82-3c6 111 61 136 31 225s-29 126 44 298M307-7c-89 81-31 129-115 210s-8 166-114 318" stroke="#8CA994" strokeWidth="3" strokeLinecap="round" />
          <path d="M-18 203c103 37 154-15 230 48s129 34 206 98" stroke="#D5977E" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div className="absolute left-4 right-4 top-5 flex items-center justify-between text-[10px] font-semibold"><span>9:41</span><span className="rounded-full bg-[#FDFBF7]/75 px-2 py-1">around Carlton</span><span>•••</span></div>
        <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute left-[29%] top-[28%] grid h-12 w-12 place-items-center rounded-full bg-clay shadow-lg"><MapPin size={23} fill="#FDFBF7" color="#FDFBF7" /></motion.div>
        <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute bottom-[27%] right-[16%] grid h-9 w-9 place-items-center rounded-full bg-[#FDFBF7] shadow-md"><span className="h-2 w-2 rounded-full bg-sage" /></motion.div>
        <motion.div initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .65, duration: .5 }} className="absolute left-[20%] top-[42%] max-w-[220px] rounded-[1.35rem] rounded-tl-sm bg-[#FDFBF7] p-4 shadow-[0_8px_24px_rgba(42,40,36,.12)]">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold text-clay"><span className="h-2 w-2 rounded-full bg-clay" />someone passed by</div>
          <p className="font-display text-[19px] leading-[1.13] text-ink">The late sun makes this corner feel like a small town.</p>
          <div className="mt-3 flex items-center justify-between border-t border-[#E9E2D6] pt-2 text-[10px] text-[#827d75]"><span>24m away</span><Sparkles size={13} className="text-[#C59D44]" /></div>
        </motion.div>
        <div className="absolute bottom-5 left-1/2 flex w-[86%] -translate-x-1/2 items-center gap-3 rounded-full bg-[#292824] px-4 py-3 text-[11px] text-paper"><div className="grid h-7 w-7 place-items-center rounded-full bg-clay"><Navigation size={13} fill="currentColor" /></div><span className="flex-1">Leave a thought here</span><span className="text-[#B6B1A8]">+</span></div>
      </div>
    </motion.div>
    <div className="float-soft absolute -right-6 top-[21%] rounded-2xl border border-[#292824]/10 bg-paper px-3 py-2 text-[11px] shadow-sm"><span className="mr-1">✦</span> a soft signal</div>
  </div>;
}

export default function Home() {
  return <main className="overflow-hidden bg-paper">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-10 md:py-8">
      <a href="#top" className="font-display text-2xl font-semibold tracking-tight" aria-label="PopBy home">PopBy<span className="text-clay">.</span></a>
      <LaunchButton className="px-5 py-2.5 text-xs">Try PopBy</LaunchButton>
    </header>

    <section id="top" className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-12 md:grid-cols-[1.08fr_.92fr] md:px-10 md:pb-36 md:pt-20">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: .12 } } }}>
        <motion.div variants={rise} className="mb-7 flex items-center gap-3 text-[11px] font-semibold tracking-[.17em] text-clay"><span className="h-px w-8 bg-clay" /> APP OF THE DAY <span className="text-[#9D9991]">/ EXPERIENCE</span></motion.div>
        <motion.h1 variants={rise} className="max-w-3xl font-display text-[clamp(3.8rem,8.2vw,7.6rem)] leading-[.91] tracking-[-.065em]">Pop-up when<br />you <em className="font-normal text-clay">pop by.</em></motion.h1>
        <motion.p variants={rise} className="mt-8 max-w-xl text-base leading-8 text-[#68655e] md:text-lg">A zero-anxiety, location-anchored social space for feeling human presence in the physical world.</motion.p>
        <motion.div variants={rise} className="mt-9 flex flex-wrap items-center gap-5"><LaunchButton className="px-7 py-4">Open PopBy App</LaunchButton><a href="#atmosphere" className="group inline-flex items-center gap-2 text-sm font-medium underline decoration-[#bcb6aa] underline-offset-4 transition hover:text-clay">See how it feels <ArrowDownRight size={15} className="transition-transform group-hover:translate-y-0.5" /></a></motion.div>
        <motion.div variants={rise} className="mt-16 flex items-center gap-4 text-xs text-[#77736b]"><div className="flex -space-x-2"><span className="h-7 w-7 rounded-full border-2 border-paper bg-[#E7BBAA]" /><span className="h-7 w-7 rounded-full border-2 border-paper bg-[#9DBAA4]" /><span className="h-7 w-7 rounded-full border-2 border-paper bg-[#E8D587]" /></div><span>Made for the places in-between.</span></motion.div>
      </motion.div>
      <DevicePreview />
    </section>

    <section id="atmosphere" className="border-y border-[#E6E0D6] bg-[#F8F4EC] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10"><motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: .35 }} variants={rise} className="mb-12 flex flex-wrap items-end justify-between gap-6"><div><p className="mb-4 text-[11px] font-semibold tracking-[.16em] text-sage">A DIFFERENT KIND OF SOCIAL</p><h2 className="font-display text-5xl tracking-[-.05em] md:text-6xl">The Atmosphere<br />of PopBy</h2></div><p className="max-w-xs text-sm leading-6 text-[#77736b]">Three small ways to make the ordinary walk feel a little more alive.</p></motion.div>
        <div className="story-scroll -mr-6 flex snap-x gap-5 overflow-x-auto pb-5 pr-6 md:-mr-10 md:pr-10">
          {stories.map((story, index) => <motion.article key={story.number} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ delay: index * .1 }} whileHover={{ y: -5, rotate: index === 1 ? 0 : index === 0 ? -.5 : .5 }} className={`relative flex min-h-[500px] w-[82vw] shrink-0 snap-start flex-col overflow-hidden rounded-[2rem] p-7 md:w-[385px] md:p-8 ${story.color}`}>
            <div className="flex items-start justify-between"><span className="text-xs font-semibold">{story.number} / 03</span><span className={`h-3 w-3 rounded-full ${story.dot}`} /></div>
            <StoryScene type={index} />
            <div className="relative mt-auto"><p className="relative mb-3 text-xs font-medium tracking-[.18em] text-ink/55">{story.chinese}</p><h3 className="relative whitespace-pre-line font-display text-[2.65rem] leading-[.9] tracking-[-.055em]">{story.title}</h3><p className="relative mt-5 max-w-[300px] text-sm leading-6 text-ink/70">{story.text}</p></div>
          </motion.article>)}
        </div>
        <p className="mt-3 text-xs text-[#928e85] md:hidden">Swipe to wander →</p>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-36">
      <div className="grid gap-12 lg:grid-cols-[.78fr_1.22fr]"><motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: .35 }} variants={rise}><p className="mb-4 text-[11px] font-semibold tracking-[.16em] text-clay">GENTLER BY DESIGN</p><h2 className="font-display text-5xl leading-[.94] tracking-[-.055em] md:text-6xl">Socializing<br />without the<br /><em className="font-normal text-sage">noise.</em></h2><p className="mt-7 max-w-sm text-sm leading-7 text-[#77736b]">A new rhythm for sharing space: less performance, more presence.</p></motion.div>
        <div className="grid gap-4 sm:grid-cols-2"><motion.article initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ y: -4 }} className="relative overflow-hidden rounded-[1.75rem] bg-[#F2E2D8] p-7 sm:col-span-2"><div className="mb-12 grid h-11 w-11 place-items-center rounded-full bg-clay text-paper"><MapPin size={19} /></div><span className="text-xs font-semibold tracking-[.14em] text-clay">01 / IN PLACE</span><h3 className="mt-3 font-display text-3xl tracking-[-.04em]">Asynchronous Unlocking</h3><p className="mt-3 max-w-md text-sm leading-6 text-ink/70">Leave thoughts tied to physical coordinates. They can only be opened by someone truly nearby.</p><HumanMoment type="crossing" /><FeatureSketch kind="pin" /></motion.article>
          <motion.article initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .1 }} whileHover={{ y: -4 }} className="relative overflow-hidden rounded-[1.75rem] bg-[#DFEAD9] p-7"><div className="mb-12 grid h-11 w-11 place-items-center rounded-full bg-sage text-paper"><MessageCircleHeart size={19} /></div><span className="text-xs font-semibold tracking-[.14em] text-sage">02 / UNBURDENED</span><h3 className="mt-3 font-display text-3xl tracking-[-.04em]">Zero Anxiety</h3><p className="mt-3 text-sm leading-6 text-ink/70">No likes. No comments. No DMs. No pressure to perform.</p><HumanMoment type="dog" /><FeatureSketch kind="heart" /></motion.article>
          <motion.article initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .2 }} whileHover={{ y: -4 }} className="relative overflow-hidden rounded-[1.75rem] bg-[#F4E9C9] p-7"><div className="mb-12 grid h-11 w-11 place-items-center rounded-full bg-[#C59D44] text-paper"><Sparkles size={19} /></div><span className="text-xs font-semibold tracking-[.14em] text-[#A27F2E]">03 / TOGETHER</span><h3 className="mt-3 font-display text-3xl tracking-[-.04em]">Shifting Perspective</h3><p className="mt-3 text-sm leading-6 text-ink/70">Co-create a soul for physical places, instead of showing off yourself.</p><HumanMoment type="shop" /><FeatureSketch kind="spark" /></motion.article>
        </div>
      </div>
    </section>

    <section className="mx-4 mb-4 rounded-[2.5rem] bg-ink px-6 py-20 text-paper md:mx-6 md:mb-6 md:py-28"><div className="mx-auto max-w-3xl text-center"><p className="mb-6 text-[11px] font-semibold tracking-[.18em] text-[#E7BBAA]">THE STREET IS WAITING</p><h2 className="font-display text-5xl leading-[.94] tracking-[-.055em] md:text-7xl">Rediscover the streets.<br /><em className="font-normal text-[#D9E9D6]">Feel the quiet presence</em><br />around you.</h2><LaunchButton className="mt-10 bg-paper px-7 py-4 text-ink hover:bg-clay hover:text-paper">Pop By Now</LaunchButton></div></section>

    <footer className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-[#817d74] md:flex-row md:items-center md:justify-between md:px-10"><span>© 2025 PopBy. A softer way to be here.</span><div className="flex gap-5"><a href="#top" className="transition hover:text-ink">Back to top ↑</a><a href={appUrl} target="_blank" rel="noopener noreferrer" className="transition hover:text-ink">Try PopBy →</a></div></footer>
  </main>;
}
