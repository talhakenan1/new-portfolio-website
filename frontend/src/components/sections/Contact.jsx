import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { api, formatApiError } from "@/lib/api";

export default function Contact({ site }) {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [submitting, setSubmitting] = useState(false);

    const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.error("Please fill name, email and message.");
            return;
        }
        setSubmitting(true);
        try {
            const { data } = await api.post("/contact", form);
            if (data.email_sent) {
                toast.success("Message sent. I'll reply soon.");
            } else {
                toast.success("Message received. I'll be in touch.");
            }
            setForm({ name: "", email: "", subject: "", message: "" });
        } catch (err) {
            toast.error(formatApiError(err.response?.data?.detail) || "Could not send. Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section
            id="contact"
            data-testid="contact-section"
            className="relative bg-ink text-paper"
        >
            <div className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16 py-24 lg:py-36 grid grid-cols-12 gap-y-16 lg:gap-x-12">
                <div className="col-span-12 lg:col-span-2">
                    <div className="kicker-num text-paper/50 mb-3">№ 004</div>
                    <div className="label-kicker text-signal">Contact</div>
                </div>

                <div className="col-span-12 lg:col-span-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="font-display text-6xl sm:text-7xl lg:text-[8rem] leading-[0.85] tracking-tighter"
                    >
                        Let&apos;s
                        <br />
                        <span className="italic font-light text-signal">talk</span>.
                    </motion.h2>
                    <p className="mt-8 text-lg text-paper/70 max-w-md leading-relaxed">
                        Have a project, a role, or an idea worth building? Drop a note —
                        I read every message.
                    </p>

                    <div className="mt-12 space-y-3 text-paper/80">
                        {site?.email && (
                            <div className="flex items-baseline gap-4">
                                <span className="kicker-num text-paper/40">EMAIL</span>
                                <a
                                    href={`mailto:${site.email}`}
                                    className="red-underline pb-0.5"
                                    data-testid="contact-email-link"
                                >
                                    {site.email}
                                </a>
                            </div>
                        )}
                        {site?.location && (
                            <div className="flex items-baseline gap-4">
                                <span className="kicker-num text-paper/40">BASED</span>
                                <span>{site.location}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form
                    onSubmit={submit}
                    className="col-span-12 lg:col-span-4 space-y-6"
                    data-testid="contact-form"
                >
                    <div>
                        <label className="kicker-num text-paper/50">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={change("name")}
                            placeholder="Your name"
                            data-testid="contact-name-input"
                            className="editorial-input mt-1"
                            style={{ color: "#fff", borderBottomColor: "rgba(255,255,255,0.4)" }}
                        />
                    </div>
                    <div>
                        <label className="kicker-num text-paper/50">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={change("email")}
                            placeholder="you@domain.com"
                            data-testid="contact-email-input"
                            className="editorial-input mt-1"
                            style={{ color: "#fff", borderBottomColor: "rgba(255,255,255,0.4)" }}
                        />
                    </div>
                    <div>
                        <label className="kicker-num text-paper/50">Subject</label>
                        <input
                            type="text"
                            value={form.subject}
                            onChange={change("subject")}
                            placeholder="What is this about?"
                            data-testid="contact-subject-input"
                            className="editorial-input mt-1"
                            style={{ color: "#fff", borderBottomColor: "rgba(255,255,255,0.4)" }}
                        />
                    </div>
                    <div>
                        <label className="kicker-num text-paper/50">Message</label>
                        <textarea
                            value={form.message}
                            onChange={change("message")}
                            placeholder="Tell me about your project..."
                            data-testid="contact-message-input"
                            className="editorial-input editorial-textarea mt-1"
                            style={{ color: "#fff", borderBottomColor: "rgba(255,255,255,0.4)" }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        data-testid="contact-submit-button"
                        className="btn-ink w-full"
                        style={{ background: "#fff", color: "#0A0A0A" }}
                    >
                        {submitting ? "Sending..." : (<>Send message <Send size={14} /></>)}
                    </button>
                </form>
            </div>
        </section>
    );
}
