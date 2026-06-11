from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, WebSocket, WebSocketDisconnect, UploadFile, File, Header, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
import requests


# ---------- DB ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"

def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


# ---------- Password & JWT ----------
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=8),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> Dict[str, Any]:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(request: Request) -> Dict[str, Any]:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------- Models ----------
class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ContentUpdate(BaseModel):
    data: Any


class ForumMessageIn(BaseModel):
    nickname: str = Field(..., min_length=1, max_length=40)
    message: str = Field(..., min_length=1, max_length=500)


# ---------- App ----------
app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- AUTH ROUTES ----------
@api_router.post("/auth/login")
async def login(payload: LoginInput, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    response.set_cookie(
        key="access_token", value=token, httponly=True,
        secure=False, samesite="lax", max_age=8 * 3600, path="/"
    )
    return {
        "id": user["id"], "email": user["email"], "name": user.get("name", "Admin"),
        "role": user.get("role", "admin"), "token": token,
    }


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: Dict[str, Any] = Depends(get_current_user)):
    return user


# ---------- CONTENT ROUTES ----------
SECTIONS = {"summary", "skills", "experience", "portfolio", "education", "contact"}


def _exp_item(role, company, period, en_text, id_text, stack=None, highlights_en=None, highlights_id=None, location="Remote"):
    return {
        "id": str(uuid.uuid4()),
        "role": role, "company": company, "period": period, "location": location,
        "stack": stack or [],
        "i18n": {"en": en_text, "id": id_text},
        "highlights": {"en": highlights_en or [], "id": highlights_id or []},
    }


def _proj_item(title, tags, image, url, en_text, id_text, en_details=None, id_details=None, year=None, role=None):
    return {
        "id": str(uuid.uuid4()),
        "title": title, "tags": tags, "image": image, "url": url,
        "year": year, "role": role,
        "i18n": {"en": en_text, "id": id_text},
        "details": {"en": en_details or en_text, "id": id_details or id_text},
    }


def _edu_item(degree, school, period, en_text, id_text):
    return {
        "id": str(uuid.uuid4()),
        "degree": degree, "school": school, "period": period,
        "i18n": {"en": en_text, "id": id_text},
    }


DEFAULT_CONTENT = {
    "summary": {
        "i18n": {
            "en": {
                "name": "Alex Rivera",
                "title": "Full-Stack Developer & Systems Engineer",
                "tagline": "Building elegant, scalable products at the intersection of code and design.",
                "bio": "I architect performant web platforms with a focus on developer experience, real-time systems, and beautiful interfaces. Currently exploring distributed systems and edge computing.",
                "location": "San Francisco, CA",
                "available": True,
            },
            "id": {
                "name": "Alex Rivera",
                "title": "Full-Stack Developer & Systems Engineer",
                "tagline": "Membangun produk yang elegan dan scalable di persimpangan code dan desain.",
                "bio": "Saya merancang platform web berperforma tinggi dengan fokus pada developer experience, sistem real-time, dan antarmuka yang indah. Saat ini mendalami sistem terdistribusi dan edge computing.",
                "location": "San Francisco, CA",
                "available": True,
            },
        }
    },
    "skills": {
        "categories": [
            {
                "name": "Frontend",
                "icon": "Code2",
                "summary": {
                    "en": "Modern reactive UIs, animations, design systems, and accessibility-first interfaces.",
                    "id": "UI reaktif modern, animasi, design system, dan antarmuka yang accessibility-first.",
                },
                "items": [
                    {"name": "React", "level": 95, "years": 6, "i18n": {"en": "Hooks, Suspense, Server Components, performance profiling, advanced patterns.", "id": "Hooks, Suspense, Server Components, profiling performa, pola lanjutan."}},
                    {"name": "TypeScript", "level": 90, "years": 5, "i18n": {"en": "Strict typing, generics, conditional types, monorepo setups.", "id": "Typing ketat, generics, conditional types, setup monorepo."}},
                    {"name": "Next.js", "level": 88, "years": 4, "i18n": {"en": "App router, RSC, ISR, edge runtime, middleware.", "id": "App router, RSC, ISR, edge runtime, middleware."}},
                    {"name": "TailwindCSS", "level": 92, "years": 4, "i18n": {"en": "Design tokens, custom plugins, dark/light themes.", "id": "Design tokens, plugin custom, tema gelap/terang."}},
                    {"name": "Framer Motion", "level": 80, "years": 3, "i18n": {"en": "Choreographed animations, gestures, layout transitions.", "id": "Animasi terkoreografi, gesture, transisi layout."}},
                ],
            },
            {
                "name": "Backend",
                "icon": "Server",
                "summary": {
                    "en": "Scalable APIs, realtime systems, and event-driven architectures.",
                    "id": "API scalable, sistem realtime, dan arsitektur event-driven.",
                },
                "items": [
                    {"name": "Python", "level": 92, "years": 7, "i18n": {"en": "AsyncIO, FastAPI, data pipelines, testing with pytest.", "id": "AsyncIO, FastAPI, data pipeline, testing dengan pytest."}},
                    {"name": "FastAPI", "level": 90, "years": 3, "i18n": {"en": "Dependency injection, OAuth2, websockets, OpenAPI.", "id": "Dependency injection, OAuth2, websockets, OpenAPI."}},
                    {"name": "Node.js", "level": 85, "years": 5, "i18n": {"en": "Express, NestJS, streams, performance tuning.", "id": "Express, NestJS, streams, tuning performa."}},
                    {"name": "GraphQL", "level": 78, "years": 3, "i18n": {"en": "Schema design, resolvers, dataloader, federation.", "id": "Desain schema, resolver, dataloader, federation."}},
                    {"name": "WebSocket", "level": 88, "years": 4, "i18n": {"en": "Realtime broadcast, pub/sub, presence systems.", "id": "Broadcast realtime, pub/sub, sistem presence."}},
                ],
            },
            {
                "name": "Database",
                "icon": "Database",
                "summary": {
                    "en": "Modeling, indexing, sharding, and replication for high-throughput systems.",
                    "id": "Modeling, indexing, sharding, dan replikasi untuk sistem high-throughput.",
                },
                "items": [
                    {"name": "MongoDB", "level": 88, "years": 5, "i18n": {"en": "Aggregation pipelines, change streams, replica sets.", "id": "Aggregation pipeline, change stream, replica set."}},
                    {"name": "PostgreSQL", "level": 90, "years": 6, "i18n": {"en": "Advanced queries, JSONB, partitioning, performance tuning.", "id": "Query lanjutan, JSONB, partitioning, tuning performa."}},
                    {"name": "Redis", "level": 85, "years": 5, "i18n": {"en": "Caching, pub/sub, rate limiting, streams.", "id": "Caching, pub/sub, rate limiting, streams."}},
                    {"name": "Elasticsearch", "level": 75, "years": 3, "i18n": {"en": "Full-text search, analyzers, relevance tuning.", "id": "Full-text search, analyzer, tuning relevansi."}},
                ],
            },
            {
                "name": "DevOps & Network",
                "icon": "Cloud",
                "summary": {
                    "en": "Infrastructure as code, observability, CI/CD, and network engineering.",
                    "id": "Infrastructure as code, observabilitas, CI/CD, dan rekayasa jaringan.",
                },
                "items": [
                    {"name": "Docker", "level": 90, "years": 6, "i18n": {"en": "Multi-stage builds, compose, lightweight images.", "id": "Multi-stage build, compose, image ringan."}},
                    {"name": "Kubernetes", "level": 82, "years": 4, "i18n": {"en": "Deployments, helm charts, ingress, autoscaling.", "id": "Deployment, helm chart, ingress, autoscaling."}},
                    {"name": "AWS", "level": 85, "years": 5, "i18n": {"en": "EC2, S3, Lambda, CloudFront, IAM, VPC.", "id": "EC2, S3, Lambda, CloudFront, IAM, VPC."}},
                    {"name": "Terraform", "level": 78, "years": 3, "i18n": {"en": "Modules, remote state, multi-environment workflows.", "id": "Module, remote state, workflow multi-environment."}},
                    {"name": "Networking", "level": 80, "years": 5, "i18n": {"en": "TCP/IP, DNS, TLS, load balancing, CDN edge routing.", "id": "TCP/IP, DNS, TLS, load balancing, CDN edge routing."}},
                ],
            },
        ]
    },
    "experience": {
        "items": [
            _exp_item(
                "Senior Full-Stack Engineer", "Nebula Labs", "2023 — Present",
                "Leading architecture for a real-time collaboration platform. Reduced latency by 60% through edge-cached websocket infrastructure.",
                "Memimpin arsitektur platform kolaborasi real-time. Mengurangi latensi 60% melalui infrastruktur websocket terdistribusi.",
                stack=["React", "TypeScript", "Node.js", "Redis", "AWS", "WebSocket"],
                location="San Francisco, CA (Hybrid)",
                highlights_en=[
                    "Architected a CRDT-based realtime engine handling 200k concurrent users.",
                    "Reduced p99 latency by 60% via edge-cached websocket gateways.",
                    "Mentored 4 engineers and ran weekly architecture reviews.",
                    "Owned migration to event-driven microservices on Kubernetes.",
                ],
                highlights_id=[
                    "Merancang engine realtime berbasis CRDT untuk 200rb pengguna konkuren.",
                    "Mengurangi latensi p99 sebesar 60% via gateway websocket edge-cached.",
                    "Mentoring 4 engineer dan memimpin review arsitektur mingguan.",
                    "Memimpin migrasi ke microservices event-driven di Kubernetes.",
                ],
            ),
            _exp_item(
                "Software Engineer", "Quantum Forge", "2020 — 2023",
                "Built fintech APIs handling 1M+ requests/day. Migrated legacy stack to event-driven microservices.",
                "Membangun API fintech yang menangani 1JT+ request/hari. Migrasi stack lama ke microservices event-driven.",
                stack=["Python", "FastAPI", "PostgreSQL", "Kafka", "Docker"],
                location="New York, NY",
                highlights_en=[
                    "Designed payment ledger handling 1M+ transactions/day with strong consistency.",
                    "Introduced Kafka-based event bus reducing inter-service coupling.",
                    "Improved test coverage from 42% to 89% across core services.",
                ],
                highlights_id=[
                    "Mendesain payment ledger menangani 1JT+ transaksi/hari dengan konsistensi kuat.",
                    "Memperkenalkan event bus berbasis Kafka, mengurangi coupling antar service.",
                    "Meningkatkan coverage test dari 42% ke 89% di core services.",
                ],
            ),
            _exp_item(
                "Junior Developer", "Pixel Studio", "2018 — 2020",
                "Crafted client-facing web apps with React and shipped 20+ production releases.",
                "Membuat aplikasi web client-facing dengan React dan merilis 20+ release production.",
                stack=["React", "Redux", "SCSS", "Node.js"],
                location="Remote",
                highlights_en=[
                    "Shipped 20+ React-based production releases for 12 clients.",
                    "Built reusable component library used across 6 projects.",
                    "Won internal hackathon with a realtime dashboard prototype.",
                ],
                highlights_id=[
                    "Merilis 20+ release production berbasis React untuk 12 klien.",
                    "Membangun komponen library reusable yang dipakai di 6 proyek.",
                    "Memenangkan hackathon internal dengan prototype dashboard realtime.",
                ],
            ),
        ]
    },
    "portfolio": {
        "items": [
            _proj_item(
                "Realtime Collab Editor",
                ["WebSocket", "React", "CRDT"],
                "https://images.pexels.com/photos/10325707/pexels-photo-10325707.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "https://github.com",
                "Multi-user collaborative editor with CRDT.",
                "Editor kolaboratif multi-user dengan CRDT.",
                en_details="A multi-user collaborative text editor built on Conflict-free Replicated Data Types (CRDT). Handles offline editing, automatic conflict resolution, and seamless realtime sync over websocket. Used by 5+ teams in production to coordinate documentation, design briefs, and engineering specs without merge conflicts.",
                id_details="Editor teks kolaboratif multi-user yang dibangun di atas CRDT (Conflict-free Replicated Data Types). Mendukung editing offline, resolusi konflik otomatis, dan sinkronisasi realtime via websocket. Digunakan oleh 5+ tim di production untuk kolaborasi dokumentasi, brief desain, dan spec engineering tanpa konflik merge.",
                year="2024", role="Lead Engineer",
            ),
            _proj_item(
                "EdgeCache CDN",
                ["Go", "Distributed", "Redis"],
                "https://images.unsplash.com/photo-1759661881353-5b9cc55e1cf4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBkZXZlbG9wZXIlMjB3b3Jrc3BhY2V8ZW58MHx8fHwxNzgxMTg1MjAyfDA&ixlib=rb-4.1.0&q=85",
                "https://github.com",
                "Lightweight edge CDN with intelligent geo-routing.",
                "CDN edge ringan dengan geo-routing cerdas.",
                en_details="A lightweight, programmable edge CDN written in Go. Features intelligent geo-routing based on RTT measurements, Redis-backed cache invalidation, and a plugin system for custom transformations. Deployed across 12 regions and serves 50M+ requests/day with p95 latency under 40ms.",
                id_details="CDN edge yang ringan dan programmable, ditulis dalam Go. Fitur geo-routing cerdas berbasis pengukuran RTT, invalidasi cache via Redis, dan sistem plugin untuk transformasi custom. Di-deploy di 12 region dan melayani 50JT+ request/hari dengan latensi p95 di bawah 40ms.",
                year="2023", role="Architect",
            ),
            _proj_item(
                "DataViz Dashboard",
                ["D3.js", "React", "WebGL"],
                "https://images.pexels.com/photos/34212896/pexels-photo-34212896.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "https://github.com",
                "Interactive analytics dashboard rendering 1M+ datapoints.",
                "Dashboard analitik interaktif merender 1JT+ datapoint.",
                en_details="A high-performance analytics dashboard that renders 1M+ datapoints smoothly using a hybrid D3.js + WebGL pipeline. Supports realtime updates, custom dashboards via drag-and-drop, and embeddable widgets. Powered the data ops team of a unicorn fintech for 18 months.",
                id_details="Dashboard analitik berperforma tinggi yang merender 1JT+ datapoint dengan lancar menggunakan pipeline hybrid D3.js + WebGL. Mendukung update realtime, dashboard custom via drag-and-drop, dan widget yang bisa di-embed. Memberdayakan tim data ops unicorn fintech selama 18 bulan.",
                year="2022", role="Frontend Lead",
            ),
        ]
    },
    "education": {
        "items": [
            _edu_item("M.Sc. Computer Science", "Stanford University", "2016 — 2018",
                      "Specialized in distributed systems and human-computer interaction.",
                      "Spesialisasi sistem terdistribusi dan interaksi manusia-komputer."),
            _edu_item("B.Sc. Software Engineering", "UC Berkeley", "2012 — 2016",
                      "Graduated with honors. Capstone: real-time multiplayer game engine.",
                      "Lulus dengan pujian. Capstone: engine game multiplayer real-time."),
        ]
    },
    "contact": {
        "email": "hello@alexrivera.dev",
        "github": "https://github.com/alexrivera",
        "linkedin": "https://linkedin.com/in/alexrivera",
        "twitter": "https://twitter.com/alexrivera",
    },
}


@api_router.get("/content/{section}")
async def get_content(section: str):
    if section not in SECTIONS:
        raise HTTPException(status_code=404, detail="Section not found")
    doc = await db.content.find_one({"section": section}, {"_id": 0})
    if not doc:
        data = DEFAULT_CONTENT.get(section, {})
        await db.content.insert_one({"section": section, "data": data})
        return {"section": section, "data": data}
    return doc


@api_router.get("/content")
async def get_all_content():
    docs = await db.content.find({}, {"_id": 0}).to_list(100)
    result = {d["section"]: d["data"] for d in docs}
    for s in SECTIONS:
        if s not in result:
            data = DEFAULT_CONTENT.get(s, {})
            await db.content.insert_one({"section": s, "data": data})
            result[s] = data
    return result


@api_router.put("/content/{section}")
async def update_content(
    section: str, payload: ContentUpdate, _user: Dict = Depends(require_admin)
):
    if section not in SECTIONS:
        raise HTTPException(status_code=404, detail="Section not found")
    await db.content.update_one(
        {"section": section},
        {"$set": {"section": section, "data": payload.data}},
        upsert=True,
    )
    return {"section": section, "data": payload.data}


# ---------- FORUM ROUTES ----------
class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, message: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


@api_router.get("/forum/messages")
async def get_messages(limit: int = 50):
    docs = await db.forum_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return list(reversed(docs))


@api_router.post("/forum/messages")
async def post_message(payload: ForumMessageIn):
    msg = {
        "id": str(uuid.uuid4()),
        "nickname": payload.nickname.strip()[:40],
        "message": payload.message.strip()[:500],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.forum_messages.insert_one(dict(msg))
    await manager.broadcast({"type": "message", "data": msg})
    return msg


@api_router.delete("/forum/messages/{msg_id}")
async def delete_message(msg_id: str, _user: Dict = Depends(require_admin)):
    await db.forum_messages.delete_one({"id": msg_id})
    await manager.broadcast({"type": "delete", "id": msg_id})
    return {"ok": True}


@app.websocket("/api/ws/forum")
async def ws_forum(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception:
        manager.disconnect(ws)


# ---------- OBJECT STORAGE (Emergent) ----------
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = os.environ.get("APP_NAME", "portfolio-cv")
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
_storage_key: Optional[str] = None

ALLOWED_MIME = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
    "image/gif": "gif", "image/svg+xml": "svg",
}
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB


def init_storage() -> str:
    global _storage_key
    if _storage_key:
        return _storage_key
    if not EMERGENT_KEY:
        raise HTTPException(status_code=500, detail="Storage not configured")
    r = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    r.raise_for_status()
    _storage_key = r.json()["storage_key"]
    return _storage_key


def storage_put(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    r = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    if r.status_code == 403:
        # refresh key and retry once
        globals()["_storage_key"] = None
        key = init_storage()
        r = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120,
        )
    r.raise_for_status()
    return r.json()


def storage_get(path: str) -> tuple[bytes, str]:
    key = init_storage()
    r = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60,
    )
    if r.status_code == 403:
        globals()["_storage_key"] = None
        key = init_storage()
        r = requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key}, timeout=60,
        )
    r.raise_for_status()
    return r.content, r.headers.get("Content-Type", "application/octet-stream")


@api_router.post("/admin/files/upload")
async def admin_upload(file: UploadFile = File(...), _user: Dict = Depends(require_admin)):
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(status_code=400, detail=f"Unsupported type: {file.content_type}")
    data = await file.read()
    if len(data) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 5MB limit")
    ext = ALLOWED_MIME[file.content_type]
    file_id = str(uuid.uuid4())
    path = f"{APP_NAME}/uploads/{file_id}.{ext}"
    try:
        result = storage_put(path, data, file.content_type)
    except requests.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Storage upload failed: {e}")
    doc = {
        "id": file_id,
        "storage_path": result.get("path", path),
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.files.insert_one(dict(doc))
    return {
        "id": file_id,
        "url": f"/api/files/{file_id}",
        "filename": file.filename,
        "content_type": file.content_type,
        "size": doc["size"],
        "created_at": doc["created_at"],
    }


@api_router.get("/admin/files")
async def admin_list_files(_user: Dict = Depends(require_admin)):
    docs = await db.files.find({"is_deleted": False}, {"_id": 0}).sort("created_at", -1).to_list(500)
    for d in docs:
        d["url"] = f"/api/files/{d['id']}"
    return docs


@api_router.delete("/admin/files/{file_id}")
async def admin_delete_file(file_id: str, _user: Dict = Depends(require_admin)):
    res = await db.files.update_one({"id": file_id}, {"$set": {"is_deleted": True}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="File not found")
    return {"ok": True}


@api_router.get("/files/{file_id}")
async def public_file(file_id: str):
    doc = await db.files.find_one({"id": file_id, "is_deleted": False}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, content_type = storage_get(doc["storage_path"])
    except requests.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Storage fetch failed: {e}")
    return Response(content=data, media_type=doc.get("content_type", content_type), headers={
        "Cache-Control": "public, max-age=86400",
    })


# ---------- Health ----------
@api_router.get("/")
async def root():
    return {"message": "Portfolio API up"}


# ---------- Startup ----------
@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.content.create_index("section", unique=True)
    await db.forum_messages.create_index("created_at")
    await db.files.create_index("id", unique=True)
    await db.files.create_index("created_at")

    # Init storage (best-effort)
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.warning(f"Storage init failed (will retry on first upload): {e}")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@portfolio.dev").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin seeded: {admin_email}")
    else:
        if not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": hash_password(admin_password)}},
            )
            logger.info(f"Admin password updated for: {admin_email}")


@app.on_event("shutdown")
async def shutdown():
    client.close()


# ---------- Register router & middleware ----------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
