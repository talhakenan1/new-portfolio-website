import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NAV = [
    { label: "About", href: "#about" },
    { label: "Work", href: "#work" },
    { label: "Contact", href: "#contact" },
];

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            data-testid="site-navbar"
            className={`sticky top-0 z-50 w-full border-b transition-colors ${
                scrolled
                    ? "bg-paper/85 backdrop-blur-md border-ink/10"
                    : "bg-paper border-transparent"
            }`}
        >
            <div className="mx-auto max-w-[1600px] flex items-center justify-between px-6 sm:px-10 lg:px-16 h-16">
                <Link
                    to="/"
                    className="font-display text-xl tracking-tight"
                    data-testid="brand-link"
                >
                    Talha<span className="text-signal">.</span>
                </Link>

                <nav className="hidden md:flex items-center gap-10">
                    {NAV.map((n) => (
                        <a
                            key={n.href}
                            href={n.href}
                            className="label-kicker red-underline pb-1"
                            data-testid={`nav-${n.label.toLowerCase()}`}
                        >
                            {n.label}
                        </a>
                    ))}
                </nav>

                <a
                    href="#contact"
                    className="hidden md:inline-flex btn-outline"
                    data-testid="nav-cta"
                >
                    Hire Me
                </a>

                <button
                    className="md:hidden p-2 -mr-2"
                    onClick={() => setOpen(true)}
                    data-testid="mobile-menu-toggle"
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>
            </div>

            {open && (
                <div className="fixed inset-0 z-50 bg-paper" data-testid="mobile-menu">
                    <div className="flex items-center justify-between px-6 h-16 border-b border-ink/10">
                        <span className="font-display text-xl">Talha<span className="text-signal">.</span></span>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Close menu"
                            data-testid="mobile-menu-close"
                            className="p-2 -mr-2"
                        >
                            <X size={22} />
                        </button>
                    </div>
                    <nav className="flex flex-col px-6 py-12 gap-6">
                        {NAV.map((n) => (
                            <a
                                key={n.href}
                                href={n.href}
                                onClick={() => setOpen(false)}
                                className="font-display text-4xl tracking-tight"
                                data-testid={`mobile-nav-${n.label.toLowerCase()}`}
                            >
                                {n.label}
                            </a>
                        ))}
                        <a
                            href="#contact"
                            onClick={() => setOpen(false)}
                            className="btn-ink mt-4 w-fit"
                            data-testid="mobile-nav-cta"
                        >
                            Hire Me
                        </a>
                    </nav>
                </div>
            )}
        </header>
    );
}
