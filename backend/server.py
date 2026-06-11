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
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr


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

DEFAULT_CONTENT = {
    "summary": {
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
    },
    "skills": {
        "categories": [
            {"name": "Frontend", "items": ["React", "TypeScript", "Next.js", "TailwindCSS", "Framer Motion"]},
            {"name": "Backend", "items": ["Python", "FastAPI", "Node.js", "GraphQL", "WebSocket"]},
            {"name": "Database", "items": ["MongoDB", "PostgreSQL", "Redis", "Elasticsearch"]},
            {"name": "DevOps", "items": ["Docker", "Kubernetes", "AWS", "Terraform", "CI/CD"]},
        ]
    },
    "experience": {
        "items": [
            {
                "id": str(uuid.uuid4()),
                "role": "Senior Full-Stack Engineer",
                "company": "Nebula Labs",
                "period": "2023 — Present",
                "en": "Leading architecture for a real-time collaboration platform. Reduced latency by 60% through edge-cached websocket infrastructure.",
                "id": "Memimpin arsitektur platform kolaborasi real-time. Mengurangi latensi 60% melalui infrastruktur websocket terdistribusi.",
            },
            {
                "id": str(uuid.uuid4()),
                "role": "Software Engineer",
                "company": "Quantum Forge",
                "period": "2020 — 2023",
                "en": "Built fintech APIs handling 1M+ requests/day. Migrated legacy stack to event-driven microservices.",
                "id": "Membangun API fintech yang menangani 1JT+ request/hari. Migrasi stack lama ke microservices event-driven.",
            },
            {
                "id": str(uuid.uuid4()),
                "role": "Junior Developer",
                "company": "Pixel Studio",
                "period": "2018 — 2020",
                "en": "Crafted client-facing web apps with React and shipped 20+ production releases.",
                "id": "Membuat aplikasi web client-facing dengan React dan merilis 20+ release production.",
            },
        ]
    },
    "portfolio": {
        "items": [
            {
                "id": str(uuid.uuid4()),
                "title": "Realtime Collab Editor",
                "tags": ["WebSocket", "React", "CRDT"],
                "image": "https://images.pexels.com/photos/10325707/pexels-photo-10325707.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "url": "#",
                "en": "Multi-user collaborative editor with conflict-free replicated data types.",
                "id": "Editor kolaboratif multi-user dengan CRDT bebas konflik.",
            },
            {
                "id": str(uuid.uuid4()),
                "title": "EdgeCache CDN",
                "tags": ["Go", "Distributed", "Redis"],
                "image": "https://images.unsplash.com/photo-1759661881353-5b9cc55e1cf4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBkZXZlbG9wZXIlMjB3b3Jrc3BhY2V8ZW58MHx8fHwxNzgxMTg1MjAyfDA&ixlib=rb-4.1.0&q=85",
                "url": "#",
                "en": "Lightweight edge CDN with intelligent geo-routing.",
                "id": "CDN edge ringan dengan geo-routing cerdas.",
            },
            {
                "id": str(uuid.uuid4()),
                "title": "DataViz Dashboard",
                "tags": ["D3.js", "React", "WebGL"],
                "image": "https://images.pexels.com/photos/34212896/pexels-photo-34212896.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
                "url": "#",
                "en": "Interactive analytics dashboard rendering 1M+ datapoints.",
                "id": "Dashboard analitik interaktif merender 1JT+ datapoint.",
            },
        ]
    },
    "education": {
        "items": [
            {
                "id": str(uuid.uuid4()),
                "degree": "M.Sc. Computer Science",
                "school": "Stanford University",
                "period": "2016 — 2018",
                "en": "Specialized in distributed systems and human-computer interaction.",
                "id": "Spesialisasi sistem terdistribusi dan interaksi manusia-komputer.",
            },
            {
                "id": str(uuid.uuid4()),
                "degree": "B.Sc. Software Engineering",
                "school": "UC Berkeley",
                "period": "2012 — 2016",
                "en": "Graduated with honors. Capstone: real-time multiplayer game engine.",
                "id": "Lulus dengan pujian. Capstone: engine game multiplayer real-time.",
            },
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
            # Keep alive; we only broadcast from POST endpoint
            await ws.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception:
        manager.disconnect(ws)


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
