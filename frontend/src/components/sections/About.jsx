import React from "react";
import { motion } from "framer-motion";

const PORTRAIT =
    "https://static.prod-images.emergentagent.com/jobs/fa030bf2-d494-4085-8cdd-d7d2f00b8c72/images/50ffae79372b4e4b6f84a4ae44593b7e9ead9fcf323eadb401dbf9e64a603fca.png";

export default function About({ site }) {
    return (
        <section
            id="about"
            data-testid="about-section"
            className="relative border-b border-ink/10 bg-paper"
        >
            <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16 py-24 lg:py-36 grid grid-cols-12 gap-y-12 lg:gap-x-12">
                {/* Kicker */}
                <div className="col-span-12 lg:col-span-2">
                    <div className="kicker-num mb-3">№ 002</div>
                    <div className="label-kicker text-signal">About</div>
                </div>

                {/* Portrait */}
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                    className="col-span-12 lg:col-span-4 relative"
                >
                    <div className="aspect-[4/5] overflow-hidden">
                        <img
                            src={PORTRAIT}
                            alt={`Portrait of ${site?.name}`}
                            className="h-full w-full object-cover img-hover-color"
                        />
                    </div>
                    <div className="fig-caption mt-3">
                        Fig. 01 — {site?.name}, {site?.role}
                    </div>
                </motion.div>

                {/* Bio + Skills */}
                <div className="col-span-12 lg:col-span-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight"
                    >
                        Engineer by trade.{" "}
                        <span className="italic font-light text-signal">
                            Editor
                        </span>{" "}
                        of small details.
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="mt-10 text-lg lg:text-xl leading-relaxed text-ink/70 max-w-2xl"
                    >
                        {site?.bio}
                    </motion.p>

                    {/* Skills ribbon */}
                    <div className="mt-14">
                        <div className="kicker-num mb-4">Stack</div>
                        <div className="flex flex-wrap gap-x-2 gap-y-3">
                            {(site?.skills || []).map((s, i) => (
                                <motion.span
                                    key={s}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.5,
                                        delay: i * 0.03,
                                    }}
                                    data-testid={`skill-${s.toLowerCase().replace(/\s/g, "-")}`}
                                    className="border border-ink/20 px-3 py-1.5 text-sm font-medium hover:bg-ink hover:text-paper transition-colors"
                                >
                                    {s}
                                </motion.span>
                            ))}
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 gap-8 border-t border-ink/10 pt-10">
                        <div>
                            <div className="font-display text-5xl lg:text-6xl">7+</div>
                            <div className="kicker-num mt-2">Years shipping</div>
                        </div>
                        <div>
                            <div className="font-display text-5xl lg:text-6xl">40+</div>
                            <div className="kicker-num mt-2">Projects delivered</div>
                        </div>
                        <div>
                            <div className="font-display text-5xl lg:text-6xl">
                                <span className="text-signal">∞</span>
                            </div>
                            <div className="kicker-num mt-2">Coffees consumed</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
