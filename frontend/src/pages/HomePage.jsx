import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";

export default function HomePage() {
    const [site, setSite] = useState(null);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        api.get("/site").then((r) => setSite(r.data)).catch(() => {});
        api.get("/projects").then((r) => setProjects(r.data)).catch(() => {});
    }, []);

    if (!site) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="label-kicker text-ink/50" data-testid="loading-state">
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-paper text-ink min-h-screen" data-testid="home-page">
            <Navbar />
            <Hero site={site} />
            <About site={site} />
            <Projects projects={projects} />
            <Contact site={site} />
            <Footer site={site} />
        </div>
    );
}
