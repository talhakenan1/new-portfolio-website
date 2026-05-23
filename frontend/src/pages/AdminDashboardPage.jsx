import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, Plus, Pencil, Trash2, ExternalLink, Mail, FolderKanban, User, Inbox } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { api, formatApiError } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const slugify = (s) =>
    s
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

export default function AdminDashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [site, setSite] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user === false) {
            navigate("/admin/login", { replace: true });
        }
    }, [user, navigate]);

    const refresh = async () => {
        try {
            const [p, s, m] = await Promise.all([
                api.get("/projects"),
                api.get("/site"),
                api.get("/admin/contact-submissions"),
            ]);
            setProjects(p.data);
            setSite(s.data);
            setMessages(m.data);
        } catch (e) {
            toast.error("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && typeof user === "object") refresh();
    }, [user]);

    if (!user || user === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="label-kicker text-ink/50">Loading...</div>
            </div>
        );
    }
    if (user === false) return null;

    return (
        <div className="min-h-screen bg-paper text-ink" data-testid="admin-dashboard">
            {/* Topbar */}
            <header className="border-b border-ink/10 bg-paper/95 backdrop-blur sticky top-0 z-30">
                <div className="mx-auto max-w-[1400px] px-6 lg:px-12 h-16 flex items-center justify-between">
                    <Link to="/" className="font-display text-xl">
                        Talha<span className="text-signal">.</span>
                        <span className="kicker-num ml-3">/ ADMIN</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline kicker-num text-ink/50">
                            {user.email}
                        </span>
                        <Link
                            to="/"
                            className="kicker-num hover:text-signal hidden sm:inline-flex items-center gap-1"
                            data-testid="admin-view-site"
                        >
                            View site <ExternalLink size={12} />
                        </Link>
                        <button
                            onClick={() => {
                                logout();
                                navigate("/admin/login");
                            }}
                            className="btn-outline"
                            data-testid="admin-logout"
                        >
                            <LogOut size={14} /> Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1400px] px-6 lg:px-12 py-10">
                <div className="mb-8">
                    <div className="label-kicker text-signal">Dashboard</div>
                    <h1 className="font-display text-5xl mt-2 tracking-tight">
                        Edit your<span className="italic font-light"> portfolio</span>.
                    </h1>
                </div>

                <Tabs defaultValue="projects" className="w-full">
                    <TabsList className="grid w-full max-w-2xl grid-cols-3 rounded-none border border-ink/15 bg-bone p-0 h-auto">
                        <TabsTrigger
                            value="projects"
                            className="rounded-none data-[state=active]:bg-ink data-[state=active]:text-paper py-3"
                            data-testid="tab-projects"
                        >
                            <FolderKanban size={14} className="mr-2" /> Projects
                        </TabsTrigger>
                        <TabsTrigger
                            value="site"
                            className="rounded-none data-[state=active]:bg-ink data-[state=active]:text-paper py-3"
                            data-testid="tab-site"
                        >
                            <User size={14} className="mr-2" /> Site
                        </TabsTrigger>
                        <TabsTrigger
                            value="messages"
                            className="rounded-none data-[state=active]:bg-ink data-[state=active]:text-paper py-3"
                            data-testid="tab-messages"
                        >
                            <Inbox size={14} className="mr-2" /> Messages
                            {messages.length > 0 && (
                                <span className="ml-2 bg-signal text-paper text-xs px-1.5 py-0.5">
                                    {messages.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="projects" className="mt-8">
                        <ProjectsAdmin
                            projects={projects}
                            refresh={refresh}
                            loading={loading}
                        />
                    </TabsContent>
                    <TabsContent value="site" className="mt-8">
                        {site && <SiteAdmin site={site} setSite={setSite} refresh={refresh} />}
                    </TabsContent>
                    <TabsContent value="messages" className="mt-8">
                        <MessagesAdmin messages={messages} refresh={refresh} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

/* ---------- Projects ---------- */
function ProjectsAdmin({ projects, refresh, loading }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const openCreate = () => {
        setEditing({
            title: "",
            slug: "",
            summary: "",
            description: "",
            tech: [],
            image_url: "",
            live_url: "",
            github_url: "",
            featured: false,
            year: String(new Date().getFullYear()),
        });
        setOpen(true);
    };
    const openEdit = (p) => {
        setEditing({ ...p });
        setOpen(true);
    };

    const onDelete = async () => {
        try {
            await api.delete(`/admin/projects/${deletingId}`);
            toast.success("Project deleted");
            setDeletingId(null);
            refresh();
        } catch (e) {
            toast.error(formatApiError(e.response?.data?.detail));
        }
    };

    return (
        <div data-testid="projects-admin">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="font-display text-3xl">Projects</h2>
                    <p className="text-ink/60 text-sm mt-1">
                        Manage the projects that appear on your site.
                    </p>
                </div>
                <Button
                    onClick={openCreate}
                    className="rounded-none bg-ink text-paper hover:bg-signal"
                    data-testid="add-project-button"
                >
                    <Plus size={16} className="mr-2" /> New project
                </Button>
            </div>

            <div className="border border-ink/15 bg-paper">
                <Table>
                    <TableHeader>
                        <TableRow className="border-ink/10">
                            <TableHead className="font-mono uppercase text-xs">Title</TableHead>
                            <TableHead className="font-mono uppercase text-xs">Slug</TableHead>
                            <TableHead className="font-mono uppercase text-xs">Year</TableHead>
                            <TableHead className="font-mono uppercase text-xs">Featured</TableHead>
                            <TableHead className="font-mono uppercase text-xs text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-12 text-center text-ink/40">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && projects.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-12 text-center text-ink/40">
                                    No projects yet.
                                </TableCell>
                            </TableRow>
                        )}
                        {projects.map((p) => (
                            <TableRow key={p.id} className="border-ink/10" data-testid={`project-admin-row-${p.slug}`}>
                                <TableCell className="font-medium">{p.title}</TableCell>
                                <TableCell className="font-mono text-xs text-ink/60">{p.slug}</TableCell>
                                <TableCell>{p.year}</TableCell>
                                <TableCell>
                                    {p.featured && (
                                        <span className="text-xs bg-signal text-paper px-2 py-0.5">
                                            FEATURED
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEdit(p)}
                                        data-testid={`edit-project-${p.slug}`}
                                        className="rounded-none"
                                    >
                                        <Pencil size={14} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeletingId(p.id)}
                                        data-testid={`delete-project-${p.slug}`}
                                        className="rounded-none text-signal hover:text-signal"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <ProjectDialog
                open={open}
                onOpenChange={setOpen}
                project={editing}
                onSaved={() => {
                    setOpen(false);
                    refresh();
                }}
            />

            <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
                <AlertDialogContent className="rounded-none">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently removes the project from your portfolio.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none" data-testid="cancel-delete">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onDelete}
                            className="rounded-none bg-signal text-paper hover:bg-signal/90"
                            data-testid="confirm-delete"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function ProjectDialog({ open, onOpenChange, project, onSaved }) {
    const [form, setForm] = useState(project || {});
    const [saving, setSaving] = useState(false);
    const isEditing = !!project?.id;

    useEffect(() => {
        setForm(project || {});
    }, [project]);

    if (!project) return null;

    const set = (k) => (e) =>
        setForm((f) => ({
            ...f,
            [k]: e.target ? e.target.value : e,
        }));

    const save = async () => {
        if (!form.title || !form.slug || !form.summary) {
            toast.error("Title, slug and summary are required.");
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                tech: Array.isArray(form.tech)
                    ? form.tech
                    : String(form.tech || "")
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
            };
            if (isEditing) {
                await api.put(`/admin/projects/${form.id}`, payload);
                toast.success("Project updated");
            } else {
                await api.post("/admin/projects", payload);
                toast.success("Project created");
            }
            onSaved();
        } catch (e) {
            toast.error(formatApiError(e.response?.data?.detail));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-none max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-display text-3xl">
                        {isEditing ? "Edit project" : "New project"}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Title</Label>
                            <Input
                                value={form.title || ""}
                                onChange={(e) => {
                                    const title = e.target.value;
                                    setForm((f) => ({
                                        ...f,
                                        title,
                                        slug: f.slug && isEditing ? f.slug : slugify(title),
                                    }));
                                }}
                                data-testid="project-title-input"
                                className="rounded-none"
                            />
                        </div>
                        <div>
                            <Label>Slug</Label>
                            <Input
                                value={form.slug || ""}
                                onChange={set("slug")}
                                data-testid="project-slug-input"
                                className="rounded-none"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Summary</Label>
                        <Input
                            value={form.summary || ""}
                            onChange={set("summary")}
                            data-testid="project-summary-input"
                            className="rounded-none"
                        />
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={form.description || ""}
                            onChange={set("description")}
                            rows={4}
                            data-testid="project-description-input"
                            className="rounded-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Year</Label>
                            <Input
                                value={form.year || ""}
                                onChange={set("year")}
                                className="rounded-none"
                                data-testid="project-year-input"
                            />
                        </div>
                        <div>
                            <Label>Tech stack (comma-separated)</Label>
                            <Input
                                value={Array.isArray(form.tech) ? form.tech.join(", ") : form.tech || ""}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, tech: e.target.value }))
                                }
                                placeholder="React, Python, Postgres"
                                className="rounded-none"
                                data-testid="project-tech-input"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Image URL</Label>
                        <Input
                            value={form.image_url || ""}
                            onChange={set("image_url")}
                            placeholder="https://..."
                            className="rounded-none"
                            data-testid="project-image-input"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Live URL</Label>
                            <Input
                                value={form.live_url || ""}
                                onChange={set("live_url")}
                                className="rounded-none"
                            />
                        </div>
                        <div>
                            <Label>GitHub URL</Label>
                            <Input
                                value={form.github_url || ""}
                                onChange={set("github_url")}
                                className="rounded-none"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <Switch
                            checked={!!form.featured}
                            onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))}
                            data-testid="project-featured-toggle"
                        />
                        <Label>Featured project</Label>
                    </div>
                </div>
                <DialogFooter className="mt-6">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-none"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={save}
                        disabled={saving}
                        className="rounded-none bg-ink text-paper hover:bg-signal"
                        data-testid="save-project-button"
                    >
                        {saving ? "Saving..." : "Save project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/* ---------- Site ---------- */
function SiteAdmin({ site, setSite, refresh }) {
    const [form, setForm] = useState(site);
    const [saving, setSaving] = useState(false);

    useEffect(() => setForm(site), [site]);

    const set = (k) => (e) =>
        setForm((f) => ({
            ...f,
            [k]: e.target ? e.target.value : e,
        }));

    const save = async () => {
        setSaving(true);
        try {
            const payload = {
                ...form,
                skills: Array.isArray(form.skills)
                    ? form.skills
                    : String(form.skills || "")
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
            };
            const { data } = await api.put("/admin/site", payload);
            setSite(data);
            toast.success("Site content saved");
            refresh();
        } catch (e) {
            toast.error(formatApiError(e.response?.data?.detail));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-12 gap-8" data-testid="site-admin">
            <div className="col-span-12 lg:col-span-8 space-y-6">
                <div>
                    <h2 className="font-display text-3xl">Site content</h2>
                    <p className="text-ink/60 text-sm mt-1">
                        These values populate the hero, about, and footer sections.
                    </p>
                </div>

                <div className="border border-ink/15 p-6 space-y-5 bg-paper">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Name</Label>
                            <Input
                                value={form.name || ""}
                                onChange={set("name")}
                                className="rounded-none"
                                data-testid="site-name-input"
                            />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Input
                                value={form.role || ""}
                                onChange={set("role")}
                                className="rounded-none"
                                data-testid="site-role-input"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Tagline</Label>
                        <Input
                            value={form.tagline || ""}
                            onChange={set("tagline")}
                            className="rounded-none"
                            data-testid="site-tagline-input"
                        />
                    </div>
                    <div>
                        <Label>Bio</Label>
                        <Textarea
                            value={form.bio || ""}
                            onChange={set("bio")}
                            rows={5}
                            className="rounded-none"
                            data-testid="site-bio-input"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Location</Label>
                            <Input
                                value={form.location || ""}
                                onChange={set("location")}
                                className="rounded-none"
                            />
                        </div>
                        <div className="flex items-center gap-3 mt-7">
                            <Switch
                                checked={!!form.available}
                                onCheckedChange={(v) => setForm((f) => ({ ...f, available: v }))}
                                data-testid="site-available-toggle"
                            />
                            <Label>Available for work</Label>
                        </div>
                    </div>
                    <div>
                        <Label>Skills (comma-separated)</Label>
                        <Textarea
                            value={Array.isArray(form.skills) ? form.skills.join(", ") : form.skills || ""}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, skills: e.target.value }))
                            }
                            rows={3}
                            className="rounded-none"
                            data-testid="site-skills-input"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Email (public)</Label>
                            <Input
                                value={form.email || ""}
                                onChange={set("email")}
                                className="rounded-none"
                            />
                        </div>
                        <div>
                            <Label>GitHub URL</Label>
                            <Input
                                value={form.github || ""}
                                onChange={set("github")}
                                className="rounded-none"
                            />
                        </div>
                        <div>
                            <Label>LinkedIn URL</Label>
                            <Input
                                value={form.linkedin || ""}
                                onChange={set("linkedin")}
                                className="rounded-none"
                            />
                        </div>
                        <div>
                            <Label>Twitter URL</Label>
                            <Input
                                value={form.twitter || ""}
                                onChange={set("twitter")}
                                className="rounded-none"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={save}
                        disabled={saving}
                        className="rounded-none bg-ink text-paper hover:bg-signal mt-2"
                        data-testid="save-site-button"
                    >
                        {saving ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            </div>

            <aside className="col-span-12 lg:col-span-4">
                <div className="border border-ink/15 p-6 bg-bone sticky top-24">
                    <div className="kicker-num mb-3">Preview</div>
                    <div className="font-display text-3xl leading-tight">
                        {form.name}
                    </div>
                    <div className="label-kicker text-signal mt-2">
                        {form.role}
                    </div>
                    <p className="mt-4 text-sm text-ink/70 leading-relaxed">
                        {form.tagline}
                    </p>
                </div>
            </aside>
        </div>
    );
}

/* ---------- Messages ---------- */
function MessagesAdmin({ messages, refresh }) {
    const [deletingId, setDeletingId] = useState(null);

    const onDelete = async () => {
        try {
            await api.delete(`/admin/contact-submissions/${deletingId}`);
            toast.success("Message deleted");
            setDeletingId(null);
            refresh();
        } catch (e) {
            toast.error("Could not delete message");
        }
    };

    return (
        <div data-testid="messages-admin">
            <div className="mb-6">
                <h2 className="font-display text-3xl">Messages</h2>
                <p className="text-ink/60 text-sm mt-1">
                    Submissions from the contact form.
                </p>
            </div>

            <div className="space-y-3">
                {messages.length === 0 && (
                    <div className="border border-ink/15 p-12 text-center text-ink/40 bg-paper">
                        <Mail className="mx-auto mb-4" size={32} strokeWidth={1.25} />
                        No messages yet.
                    </div>
                )}
                {messages.map((m) => (
                    <details
                        key={m.id}
                        className="border border-ink/15 bg-paper group"
                        data-testid={`message-${m.id}`}
                    >
                        <summary className="cursor-pointer p-5 flex items-center justify-between list-none">
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                    {m.name}{" "}
                                    <span className="text-ink/50 font-normal">— {m.subject || m.email}</span>
                                </div>
                                <div className="text-sm text-ink/60 truncate mt-0.5">
                                    {m.message}
                                </div>
                            </div>
                            <div className="kicker-num text-ink/50 ml-4 shrink-0">
                                {new Date(m.created_at).toLocaleDateString()}
                                {m.email_sent && (
                                    <span className="ml-2 text-signal">SENT</span>
                                )}
                            </div>
                        </summary>
                        <div className="border-t border-ink/10 p-5 space-y-3 bg-bone">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="kicker-num text-ink/50">From</div>
                                    <a
                                        href={`mailto:${m.email}`}
                                        className="red-underline"
                                    >
                                        {m.email}
                                    </a>
                                </div>
                                <div>
                                    <div className="kicker-num text-ink/50">Received</div>
                                    {new Date(m.created_at).toLocaleString()}
                                </div>
                            </div>
                            <div>
                                <div className="kicker-num text-ink/50 mb-1">Message</div>
                                <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <a
                                    href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "your message")}`}
                                    className="btn-outline"
                                >
                                    Reply <Mail size={14} />
                                </a>
                                <Button
                                    variant="ghost"
                                    onClick={() => setDeletingId(m.id)}
                                    className="rounded-none text-signal hover:text-signal"
                                    data-testid={`delete-message-${m.id}`}
                                >
                                    <Trash2 size={14} className="mr-1" /> Delete
                                </Button>
                            </div>
                        </div>
                    </details>
                ))}
            </div>

            <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
                <AlertDialogContent className="rounded-none">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete message?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This message will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={onDelete}
                            className="rounded-none bg-signal text-paper hover:bg-signal/90"
                            data-testid="confirm-delete-message"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
