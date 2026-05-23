from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
import uuid
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
import resend
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ---------- Setup ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ.get("JWT_SECRET", "change-me")
JWT_ALG = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
RECIPIENT_EMAIL = os.environ.get("RECIPIENT_EMAIL", ADMIN_EMAIL)

app = FastAPI(title="Portfolio API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# ---------- Helpers ----------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------- Models ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


class ProjectBase(BaseModel):
    title: str
    slug: str
    summary: str
    description: str = ""
    tech: List[str] = []
    image_url: str = ""
    live_url: str = ""
    github_url: str = ""
    featured: bool = False
    year: str = ""


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    subject: str = ""
    message: str
    created_at: str = Field(default_factory=now_iso)
    email_sent: bool = False


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str = ""
    message: str


class SiteContent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site"
    name: str = "Talha Kenan"
    role: str = "Developer / Engineer"
    tagline: str = "Building fast, thoughtful software at the intersection of design and engineering."
    bio: str = (
        "I'm a full-stack developer obsessed with the craft of shipping. "
        "I work across the stack — from sharp UI to resilient APIs — and care deeply about typography, "
        "performance, and the small details that make a product feel inevitable."
    )
    location: str = "Istanbul, Turkey"
    available: bool = True
    skills: List[str] = Field(default_factory=lambda: [
        "TypeScript", "React", "Next.js", "Python", "FastAPI", "Node.js",
        "PostgreSQL", "MongoDB", "Docker", "AWS", "Tailwind CSS", "System Design",
    ])
    github: str = "https://github.com"
    linkedin: str = "https://linkedin.com"
    twitter: str = "https://twitter.com"
    email: str = ""


# ---------- Routes: Public ----------
@api_router.get("/")
async def root():
    return {"message": "Portfolio API", "ok": True}


@api_router.get("/site")
async def get_site():
    doc = await db.site_content.find_one({"id": "site"}, {"_id": 0})
    if not doc:
        default = SiteContent().model_dump()
        await db.site_content.insert_one(default)
        return default
    return doc


@api_router.get("/projects", response_model=List[Project])
async def list_projects():
    cursor = db.projects.find({}, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(1000)


@api_router.get("/projects/{slug}")
async def get_project(slug: str):
    doc = await db.projects.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    return doc


@api_router.post("/contact")
async def submit_contact(payload: ContactCreate):
    submission = ContactSubmission(**payload.model_dump())
    doc = submission.model_dump()

    # Try sending email via Resend (non-blocking, never fail the request)
    email_sent = False
    try:
        if resend.api_key and resend.api_key.startswith("re_") and resend.api_key != "re_xxxxx":
            html = f"""
            <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
              <h2 style="border-bottom: 2px solid #0A0A0A; padding-bottom: 8px;">New portfolio contact</h2>
              <p><strong>From:</strong> {payload.name} &lt;{payload.email}&gt;</p>
              <p><strong>Subject:</strong> {payload.subject or '(no subject)'}</p>
              <p style="white-space: pre-wrap; line-height: 1.6;">{payload.message}</p>
              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
              <p style="color: #52525B; font-size: 12px;">Sent from your portfolio site.</p>
            </div>
            """
            params = {
                "from": SENDER_EMAIL,
                "to": [RECIPIENT_EMAIL],
                "subject": f"Portfolio: {payload.subject or 'New message from ' + payload.name}",
                "html": html,
                "reply_to": payload.email,
            }
            await asyncio.to_thread(resend.Emails.send, params)
            email_sent = True
    except Exception as e:
        logger.warning(f"Resend email failed (saving submission anyway): {e}")

    doc["email_sent"] = email_sent
    await db.contact_submissions.insert_one(doc)
    return {"ok": True, "id": doc["id"], "email_sent": email_sent}


# ---------- Routes: Auth ----------
@api_router.post("/auth/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    user_data = {k: v for k, v in user.items() if k not in ("_id", "password_hash")}
    return {"token": token, "user": user_data}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ---------- Routes: Admin ----------
@api_router.post("/admin/projects", response_model=Project)
async def create_project(payload: ProjectCreate, user: dict = Depends(get_current_user)):
    project = Project(**payload.model_dump())
    await db.projects.insert_one(project.model_dump())
    return project


@api_router.put("/admin/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, payload: ProjectCreate, user: dict = Depends(get_current_user)):
    existing = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")
    updated = {**existing, **payload.model_dump(), "id": project_id, "updated_at": now_iso()}
    await db.projects.update_one({"id": project_id}, {"$set": updated})
    return updated


@api_router.delete("/admin/projects/{project_id}")
async def delete_project(project_id: str, user: dict = Depends(get_current_user)):
    res = await db.projects.delete_one({"id": project_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"ok": True}


@api_router.put("/admin/site")
async def update_site(payload: SiteContent, user: dict = Depends(get_current_user)):
    data = payload.model_dump()
    data["id"] = "site"
    await db.site_content.update_one({"id": "site"}, {"$set": data}, upsert=True)
    return data


@api_router.get("/admin/contact-submissions")
async def list_contact_submissions(user: dict = Depends(get_current_user)):
    cursor = db.contact_submissions.find({}, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(1000)


@api_router.delete("/admin/contact-submissions/{sub_id}")
async def delete_submission(sub_id: str, user: dict = Depends(get_current_user)):
    res = await db.contact_submissions.delete_one({"id": sub_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"ok": True}


# ---------- Startup ----------
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.projects.create_index("slug", unique=True)

    # Seed admin
    existing = await db.users.find_one({"email": ADMIN_EMAIL.lower()})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL.lower(),
            "password_hash": hash_password(ADMIN_PASSWORD),
            "name": "Admin",
            "role": "admin",
            "created_at": now_iso(),
        })
        logger.info(f"Seeded admin user: {ADMIN_EMAIL}")
    elif not verify_password(ADMIN_PASSWORD, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": ADMIN_EMAIL.lower()},
            {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
        )
        logger.info(f"Updated admin password for: {ADMIN_EMAIL}")

    # Seed site content
    if not await db.site_content.find_one({"id": "site"}):
        await db.site_content.insert_one(SiteContent().model_dump())

    # Seed sample projects if empty
    if await db.projects.count_documents({}) == 0:
        samples = [
            Project(
                title="Helios Analytics",
                slug="helios-analytics",
                summary="Realtime product analytics platform with sub-100ms query latency.",
                description="A complete rewrite of an internal analytics stack. Designed an event ingestion pipeline backed by ClickHouse, a Python aggregation service, and a React dashboard with custom visualization primitives.",
                tech=["TypeScript", "React", "Python", "ClickHouse", "Redis"],
                image_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
                live_url="https://example.com",
                github_url="https://github.com",
                featured=True,
                year="2025",
            ).model_dump(),
            Project(
                title="Cartograph",
                slug="cartograph",
                summary="A graph-first knowledge base for engineering teams.",
                description="Document graph with bidirectional links, full-text search, and a custom WYSIWYG editor built on top of TipTap. Sub-50ms keystroke latency on documents up to 100k nodes.",
                tech=["Next.js", "PostgreSQL", "TipTap", "tRPC"],
                image_url="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
                live_url="https://example.com",
                github_url="https://github.com",
                featured=True,
                year="2024",
            ).model_dump(),
            Project(
                title="Nimbus CLI",
                slug="nimbus-cli",
                summary="Open-source command-line toolkit for cloud-native workflows.",
                description="A Go-based CLI used by 4k+ engineers monthly. Modular plugin system, zero-config defaults, and tight integration with Kubernetes and Terraform.",
                tech=["Go", "Kubernetes", "Terraform"],
                image_url="https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&q=80",
                live_url="https://example.com",
                github_url="https://github.com",
                featured=False,
                year="2024",
            ).model_dump(),
            Project(
                title="Atelier",
                slug="atelier",
                summary="A typography-obsessed writing app for long-form essays.",
                description="A minimalist long-form writing tool with focus modes, semantic outlines, and beautiful default typography. Built around the idea that defaults matter more than features.",
                tech=["Swift", "SwiftUI", "CloudKit"],
                image_url="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
                live_url="https://example.com",
                github_url="https://github.com",
                featured=False,
                year="2023",
            ).model_dump(),
        ]
        await db.projects.insert_many(samples)
        logger.info("Seeded sample projects")


@app.on_event("shutdown")
async def shutdown():
    client.close()


# ---------- App wiring ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
