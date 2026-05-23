import React from "react";
import { motion } from "framer-motion";
import { ArrowDownRight } from "lucide-react";

const HERO_IMG =
    "https://static.prod-images.emergentagent.com/jobs/fa030bf2-d494-4085-8cdd-d7d2f00b8c72/images/b9d2e6e8db3f6b1b0a235a5269df0878932ff811d8f24b9119b47a99ccf3571e.png";

const fade = {
    hidden: { opacity: 0, y: 40 },
    show: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: 0.08 * i, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] },
    }),
};

export default function Hero({ site }) {
    const name = (site?.name || "Talha Kenan").toUpperCase();
    const [first, ...rest] = name.split(" ");
    const last = rest.join(" ");

    return (
        <section
            data-testid="hero-section"
            className="relative overflow-hidden border-b border-ink/10"
        >
            <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16 pt-16 sm:pt-24 lg:pt-32 pb-20 lg:pb-32 grid grid-cols-12 gap-y-10">
                {/* Left kicker column */}
                <div className="col-span-12 lg:col-span-2 flex lg:flex-col justify-between lg:justify-start gap-6 lg:gap-12">
                    <motion.div
                        custom={0}
                        initial="hidden"
                        animate="show"
                        variants={fade}
                        className="kicker-num"
                    >
                        № 001 / PORTFOLIO
                    </motion.div>
                    <motion.div
                        custom={1}
                        initial="hidden"
                        animate="show"
                        variants={fade}
                        className="label-kicker text-signal"
                    >
                        {site?.role || "Developer / Engineer"}
                    </motion.div>
                </div>

                {/* Main editorial type */}
                <div className="col-span-12 lg:col-span-10 relative">
                    <h1 className="font-display font-black leading-[0.85] tracking-tighter text-[clamp(3.5rem,12vw,12rem)]">
                        <motion.span
                            custom={0}
                            initial="hidden"
                            animate="show"
                            variants={fade}
                            className="block"
                        >
                            {first}
                        </motion.span>
                        <motion.span
                            custom={1}
                            initial="hidden"
                            animate="show"
                            variants={fade}
                            className="block italic font-light pl-[12vw]"
                        >
                            {last || "Kenan"}
                        </motion.span>
                    </h1>

                    <motion.div
                        custom={3}
                        initial="hidden"
                        animate="show"
                        variants={fade}
                        className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-end"
                    >
                        <p className="md:col-span-6 text-lg md:text-xl text-ink/70 leading-relaxed max-w-xl">
                            {site?.tagline}
                        </p>

                        <div className="md:col-span-3 md:col-start-8">
                            <div className="kicker-num mb-2">CURRENTLY</div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="relative inline-flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-signal opacity-75 animate-ping" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
                                </span>
                                <span className="font-medium">
                                    {site?.available
                                        ? "Open to new collaborations"
                                        : "Currently unavailable"}
                                </span>
                            </div>
                            <div className="mt-1 text-sm text-ink/60">
                                {site?.location}
                            </div>
                        </div>

                        <div className="md:col-span-3 flex md:justify-end">
                            <a
                                href="#work"
                                className="btn-ink"
                                data-testid="hero-cta-work"
                            >
                                See the work
                                <ArrowDownRight size={16} />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Hero accent image (overlapping) */}
            <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
                className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block w-[380px] xl:w-[460px] aspect-[3/4] overflow-hidden pointer-events-none"
                aria-hidden
            >
                <img
                    src={HERO_IMG}
                    alt=""
                    className="h-full w-full object-cover mix-blend-multiply opacity-90"
                />
            </motion.div>
        </section>
    );
}
