import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function Projects({ projects = [] }) {
    const [filter, setFilter] = useState("all");

    const filtered = useMemo(() => {
        if (filter === "all") return projects;
        if (filter === "featured") return projects.filter((p) => p.featured);
        return projects;
    }, [projects, filter]);

    return (
        <section
            id="work"
            data-testid="projects-section"
            className="relative border-b border-ink/10 bg-bone"
        >
            <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16 py-24 lg:py-36">
                {/* Header */}
                <div className="grid grid-cols-12 gap-6 mb-16 lg:mb-24">
                    <div className="col-span-12 lg:col-span-2">
                        <div className="kicker-num mb-3">№ 003</div>
                        <div className="label-kicker text-signal">Selected Work</div>
                    </div>
                    <div className="col-span-12 lg:col-span-8">
                        <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
                            A curated{" "}
                            <span className="italic font-light">index</span> of
                            things I&apos;ve shipped.
                        </h2>
                    </div>
                    <div className="col-span-12 lg:col-span-2 flex lg:justify-end items-end">
                        <div className="flex gap-2" role="tablist">
                            {["all", "featured"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    data-testid={`filter-${f}`}
                                    className={`label-kicker px-3 py-2 border transition-colors ${
                                        filter === f
                                            ? "bg-ink text-paper border-ink"
                                            : "border-ink/30 hover:border-ink"
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editorial list */}
                <div className="border-t border-ink/15">
                    {filtered.map((p, i) => (
                        <ProjectRow key={p.id} project={p} index={i} />
                    ))}
                    {filtered.length === 0 && (
                        <div className="py-24 text-center text-ink/50 font-display text-2xl">
                            No projects to show yet.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function ProjectRow({ project, index }) {
    const [hover, setHover] = useState(false);

    return (
        <Link
            to={`/projects/${project.slug}`}
            data-testid={`project-row-${project.slug}`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="group block border-b border-ink/15 relative"
        >
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: index * 0.06 }}
                className="grid grid-cols-12 gap-4 items-center py-8 lg:py-10"
            >
                <div className="col-span-1 kicker-num">
                    {String(index + 1).padStart(2, "0")}
                </div>

                <div className="col-span-12 sm:col-span-6 lg:col-span-5">
                    <div className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight transition-colors group-hover:text-signal">
                        {project.title}
                    </div>
                </div>

                <div className="hidden lg:block lg:col-span-3 text-sm text-ink/70 max-w-md">
                    {project.summary}
                </div>

                <div className="hidden sm:block sm:col-span-3 lg:col-span-2 text-right">
                    <div className="kicker-num">{project.year}</div>
                    <div className="text-xs text-ink/60 mt-1">
                        {(project.tech || []).slice(0, 2).join(" · ")}
                    </div>
                </div>

                <div className="hidden lg:flex lg:col-span-1 justify-end">
                    <ArrowUpRight
                        size={28}
                        strokeWidth={1.25}
                        className="transition-transform group-hover:rotate-45 group-hover:text-signal"
                    />
                </div>
            </motion.div>

            {/* Floating thumbnail on hover */}
            {project.image_url && (
                <div
                    aria-hidden
                    className={`pointer-events-none hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 w-[280px] h-[180px] overflow-hidden transition-all duration-500 ${
                        hover
                            ? "opacity-100 translate-x-0"
                            : "opacity-0 translate-x-6"
                    }`}
                >
                    <img
                        src={project.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
        </Link>
    );
}
