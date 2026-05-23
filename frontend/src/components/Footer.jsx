import React from "react";
import { Github, Linkedin, Twitter } from "lucide-react";

export default function Footer({ site }) {
    const year = new Date().getFullYear();
    return (
        <footer
            data-testid="site-footer"
            className="bg-ink text-paper border-t border-paper/10"
        >
            {/* Giant marquee word */}
            <div className="overflow-hidden border-b border-paper/10">
                <div className="flex marquee whitespace-nowrap py-6">
                    {[...Array(2)].map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-12 px-6 font-display text-7xl lg:text-9xl leading-none tracking-tighter"
                        >
                            <span>Available for work</span>
                            <span className="text-signal">•</span>
                            <span className="italic font-light">Say hello</span>
                            <span className="text-signal">•</span>
                            <span>Available for work</span>
                            <span className="text-signal">•</span>
                            <span className="italic font-light">Say hello</span>
                            <span className="text-signal">•</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16 py-12 grid grid-cols-12 gap-6 items-center">
                <div className="col-span-12 md:col-span-4">
                    <div className="font-display text-2xl">
                        {site?.name}<span className="text-signal">.</span>
                    </div>
                    <div className="kicker-num mt-1 text-paper/50">
                        {site?.role}
                    </div>
                </div>

                <div className="col-span-12 md:col-span-4 flex gap-6 md:justify-center">
                    {site?.github && (
                        <a
                            href={site.github}
                            target="_blank"
                            rel="noreferrer"
                            data-testid="footer-github"
                            className="hover:text-signal transition-colors"
                            aria-label="GitHub"
                        >
                            <Github size={20} />
                        </a>
                    )}
                    {site?.linkedin && (
                        <a
                            href={site.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            data-testid="footer-linkedin"
                            className="hover:text-signal transition-colors"
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={20} />
                        </a>
                    )}
                    {site?.twitter && (
                        <a
                            href={site.twitter}
                            target="_blank"
                            rel="noreferrer"
                            data-testid="footer-twitter"
                            className="hover:text-signal transition-colors"
                            aria-label="Twitter"
                        >
                            <Twitter size={20} />
                        </a>
                    )}
                </div>

                <div className="col-span-12 md:col-span-4 md:text-right text-sm text-paper/50">
                    © {year} {site?.name}. Crafted with intent.
                </div>
            </div>
        </footer>
    );
}
