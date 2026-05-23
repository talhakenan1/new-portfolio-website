import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-6">
            <div className="text-center">
                <div className="font-display text-[clamp(6rem,18vw,16rem)] leading-none tracking-tighter">
                    4<span className="italic font-light text-signal">0</span>4
                </div>
                <div className="label-kicker mt-4">Page not found</div>
                <Link to="/" className="btn-ink mt-10 inline-flex">
                    Back to safety
                </Link>
            </div>
        </div>
    );
}
