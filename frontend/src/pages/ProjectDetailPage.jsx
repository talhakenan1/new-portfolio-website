import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import ReactMarkdown from "react-markdown";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ProjectDetailPage() {
    const { slug } = useParams();
    const [project, setProject] = useState(null);
    const [site, setSite] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        fetch("/data/site.json").then((r) => r.json()).then(setSite).catch(() => {});
        fetch("/data/projects.json")
            .then((r) => r.json())
            .then((data) => {
                const found = data.projects.find((p) => p.slug === slug);
                if (found) setProject(found);
                else setNotFound(true);
            })
            .catch(() => setNotFound(true));
    }, [slug]);

    if (notFound) {
        return (
            <div className="min-h-screen bg-paper text-ink">
                <Navbar />
                <div className="max-w-3xl mx-auto px-6 py-32 text-center">
                    <div className="font-display text-6xl">Not Found</div>
                    <p className="mt-4 text-ink/60">
                        This project doesn&apos;t exist or has been retired.
                    </p>
                    <Link to="/" className="btn-ink mt-8 inline-flex">
                        <ArrowLeft size={14} /> Back home
                    </Link>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="label-kicker text-ink/50">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-paper text-ink min-h-screen" data-testid="project-detail-page">
            <Navbar />

            <article className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16 py-16 lg:py-24">
                <Link
                    to="/#work"
                    className="kicker-num inline-flex items-center gap-2 mb-12 hover:text-signal"
                    data-testid="back-to-work"
                >
                    <ArrowLeft size={14} /> Back to work
                </Link>

                <div className="grid grid-cols-12 gap-y-10 lg:gap-x-12 mb-16">
                    <div className="col-span-12 lg:col-span-2">
                        <div className="kicker-num">YEAR</div>
                        <div className="font-display text-2xl mt-1">{project.year}</div>
                    </div>
                    <div className="col-span-12 lg:col-span-10">
                        <div className="label-kicker text-signal mb-4">
                            {project.featured ? "Featured" : "Project"}
                        </div>
                        <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tight">
                            {project.title}
                        </h1>
                        <p className="mt-8 text-xl text-ink/70 max-w-2xl">
                            {project.summary}
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            {project.live_url && (
                                <a
                                    href={project.live_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-ink"
                                    data-testid="project-live-link"
                                >
                                    View live <ExternalLink size={14} />
                                </a>
                            )}
                            {project.github_url && (
                                <a
                                    href={project.github_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-outline"
                                    data-testid="project-github-link"
                                >
                                    <Github size={14} /> Source
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {project.image_url && (
                    <div className="w-full aspect-[16/9] overflow-hidden mb-16 border border-ink/10">
                        <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="grid grid-cols-12 gap-y-10 lg:gap-x-12">
                    <div className="col-span-12 lg:col-span-4">
                        <div className="kicker-num mb-3">Stack</div>
                        <div className="flex flex-wrap gap-2">
                            {(project.tech || []).map((t) => (
                                <span
                                    key={t}
                                    className="border border-ink/20 px-3 py-1 text-sm"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-12 lg:col-span-8">
                        <div className="kicker-num mb-3">About this project</div>
                        <div className="prose prose-lg prose-headings:font-display prose-headings:font-normal prose-a:text-signal hover:prose-a:text-signal/80 transition-colors max-w-none text-ink/90 prose-img:rounded-md prose-img:border prose-img:border-ink/10">
                            <ReactMarkdown>{project.description}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            </article>

            {site && <Footer site={site} />}
        </div>
    );
}
