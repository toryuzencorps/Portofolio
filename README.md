# 🚀 Portfolio CV — Interactive Developer Portfolio

Portfolio website CV interaktif dengan **realtime forum chat**, **admin CMS**, **bilingual (EN/ID)**, **dark/light mode toggle**, **animated tech background**, dan **integrated file manager** untuk upload asset.

Built with: **React 19** · **FastAPI** · **MongoDB** · **TailwindCSS** · **Framer Motion** · **WebSocket**

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 🎨 **Interactive UI** | Glass liquid iOS-style navbar, decorative shapes per section, animated particle background |
| 🌗 **Dark / Light Mode** | Toggle theme dengan persistent storage |
| 🌐 **Bilingual (EN/ID)** | Semua konten support 2 bahasa, switch real-time |
| 💬 **Realtime Forum** | Visitor anonim bisa chat langsung via WebSocket |
| 🔐 **Admin CMS** | JWT auth, edit semua section content via JSON editor |
| 📂 **File Manager** | cPanel-style upload, drag & drop, URL copy, gallery view (single `/assets` folder) |
| 📱 **Fully Responsive** | Mobile-first, optimized untuk semua ukuran layar |

Section yang ada: **Summary · Skills · Experience · Portfolio · Education · Forum · Contact**

---

## ⚡ Quick Start — 1 Command Deploy (Docker)

**Cara tercepat: clone → run → buka browser.** Tanpa setup Python, Node, MongoDB, atau env var apapun (auto-generate).

### Syarat
- **Docker Desktop** terinstall — https://docs.docker.com/get-docker/

### Langkah

```bash
# 1. Clone repository
git clone <your-repo-url>
cd portfolio-cv

# 2. Jalankan setup script (otomatis bikin .env, build, start semua service)
./setup.sh
```

**Selesai!** Buka:
- 🌐 Frontend:    http://localhost:3000
- 🔧 Backend API: http://localhost:8001/api/
- 🔐 Admin login: http://localhost:3000/admin/login

Login admin default:
- Email: `admin@portfolio.dev`
- Password: `admin123`

> ⚠️ **Untuk production**: edit file `.env` dulu sebelum jalanin `./setup.sh` — ubah `ADMIN_EMAIL`, `ADMIN_PASSWORD`, dan tambahkan `EMERGENT_LLM_KEY` jika butuh file upload.

### Manual Docker Compose (tanpa script)

```bash
git clone <your-repo-url>
cd portfolio-cv
cp .env.example .env
# Edit .env, ganti JWT_SECRET dengan: openssl rand -hex 32
docker compose up -d --build
```

### Command Berguna

```bash
# Stop semua service
docker compose down

# Stop + hapus data MongoDB (full reset)
docker compose down -v

# Lihat logs realtime
docker compose logs -f

# Restart backend saja
docker compose restart backend

# Rebuild setelah update code
docker compose up -d --build
```

### One-Click Deploy ke Cloud

| Provider | Caranya |
|----------|---------|
| **Emergent** | Klik tombol "Deploy" di interface Emergent → done (paling mudah) |
| **Railway** | `railway up` (Railway auto-detect `docker-compose.yml`) |
| **Render** | Connect repo → buat 3 services dari `docker-compose.yml` |
| **Fly.io** | `flyctl launch` di tiap folder (`backend`, `frontend`) |
| **DigitalOcean App Platform** | Import GitHub repo → auto-detect Docker compose |

---

## 🛠 Tech Stack

### Backend
- **FastAPI** 0.110 (Python 3.11)
- **MongoDB** (via Motor async driver)
- **PyJWT** + **bcrypt** untuk auth
- **WebSocket** native untuk realtime forum
- **Emergent Object Storage** untuk file upload

### Frontend
- **React** 19 + **React Router** 7
- **TailwindCSS** 3.4 + **shadcn/ui**
- **Framer Motion** untuk animasi
- **TanStack Query** untuk data fetching
- **Sonner** untuk toast notifications
- **Lucide React** untuk icons

---

## 📋 Prasyarat

Pastikan sudah terinstal di sistem:

```bash
# Cek versi
node --version      # >= 18.x
python3 --version   # >= 3.10
mongod --version    # MongoDB 6.x+
yarn --version      # 1.22+
```

Install yang belum ada:
- **Node.js** 18+: https://nodejs.org/
- **Python** 3.10+: https://www.python.org/
- **MongoDB**: https://www.mongodb.com/docs/manual/installation/
- **Yarn**: `npm install -g yarn`

---

## 🚀 Instalasi Manual (tanpa Docker)

> Skip section ini kalau sudah pakai **Quick Start (Docker)** di atas. Cocok untuk development atau kalau tidak mau pakai Docker.

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd portfolio-cv
```

### 2. Setup Backend

```bash
cd backend

# Buat virtual env (opsional tapi disarankan)
python3 -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt
```

**Buat file `backend/.env`:**

```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="portfolio_db"
CORS_ORIGINS="*"
JWT_SECRET="GANTI_DENGAN_RANDOM_HEX_64_KARAKTER"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="GANTI_PASSWORD_KUAT"
EMERGENT_LLM_KEY="sk-emergent-XXXXXXX"
APP_NAME="portfolio-cv"
```

> **Generate JWT_SECRET** dengan: `python3 -c "import secrets; print(secrets.token_hex(32))"`

> **EMERGENT_LLM_KEY** dapat dari dashboard Emergent (untuk fitur upload). Hilangkan kalau tidak butuh file manager.

### 3. Setup Frontend

```bash
cd ../frontend
yarn install
```

**Buat file `frontend/.env`:**

```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=443
```

> Saat deploy production, ganti `REACT_APP_BACKEND_URL` dengan URL backend publik.

### 4. Jalankan MongoDB

```bash
# Pastikan MongoDB sudah jalan
mongod --dbpath /path/to/your/db

# Atau via brew (Mac)
brew services start mongodb-community

# Atau via Docker
docker run -d -p 27017:27017 --name portfolio-mongo mongo:7
```

### 5. Jalankan Backend (dev mode)

```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Backend akan otomatis:
- Buat indexes MongoDB
- Seed admin user dari ENV
- Inisialisasi koneksi object storage

Test: buka http://localhost:8001/api/ → harus muncul `{"message": "Portfolio API up"}`

### 6. Jalankan Frontend (dev mode)

Di terminal baru:

```bash
cd frontend
yarn start
```

Otomatis terbuka di http://localhost:3000

---

## 🔑 Login Admin

Setelah backend pertama kali jalan, admin user otomatis ter-seed dengan kredensial dari `.env`.

```
URL:      http://localhost:3000/admin/login
Email:    [ADMIN_EMAIL dari .env]
Password: [ADMIN_PASSWORD dari .env]
```

Setelah login, Anda bisa:
- **Tab CONTENT** → edit JSON tiap section (Summary, Skills, Experience, Portfolio, Education, Contact)
- **Tab FILES** → upload gambar / asset (folder `/assets`)

### Cara Edit Konten

1. Login `/admin/login`
2. Pilih section dari sidebar (Summary, Skills, dll)
3. Edit JSON sesuai struktur (bilingual `i18n: {en, id}`)
4. Klik **Format** untuk auto-indent
5. Klik **Save** → toast hijau muncul jika sukses

### Cara Upload Gambar

1. Buka tab **FILES**
2. Drag & drop atau klik **UPLOAD** (max 5MB, PNG/JPG/WEBP/GIF/SVG)
3. Hover di file → klik **Copy URL**
4. Paste URL ke field `image` di JSON portfolio/section

---

## 🏗 Build untuk Production

### Backend
Backend langsung jalan via `uvicorn` (production) atau di-wrap dengan gunicorn/supervisor.

```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
```

### Frontend

```bash
cd frontend
yarn build
```

Output: folder `frontend/build/` — serve via nginx/CDN/static host.

---

## ☁️ Deploy ke Emergent (Cara Paling Mudah)

1. **Klik tombol "Preview"** di interface Emergent → cek aplikasi jalan dengan baik
2. **Klik tombol "Deploy"** → klik "Deploy Now"
3. Tunggu ~10–15 menit
4. Dapatkan URL publik live 24/7

**Biaya**: 50 credits/bulan per app deployed. Bisa setting custom domain, manage env vars, redeploy kapan saja.

---

## 🌐 Deploy ke Hosting Eksternal

### Frontend (Vercel / Netlify)

```bash
# Vercel
npm install -g vercel
cd frontend
vercel --prod

# Netlify
npm install -g netlify-cli
cd frontend
yarn build
netlify deploy --prod --dir=build
```

**Set env var** di dashboard hosting: `REACT_APP_BACKEND_URL` → URL backend production.

### Backend (Railway / Render / Fly.io)

**Railway example:**

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Set environment variables di dashboard Railway:
```
MONGO_URL, DB_NAME, JWT_SECRET, ADMIN_EMAIL,
ADMIN_PASSWORD, EMERGENT_LLM_KEY, APP_NAME, CORS_ORIGINS
```

### MongoDB (Production)

Pakai **MongoDB Atlas** (free tier):
1. Daftar di https://www.mongodb.com/cloud/atlas
2. Buat cluster gratis
3. Whitelist IP backend
4. Copy connection string → set sebagai `MONGO_URL`

---

## 🔧 Customization

### Ganti Tema / Warna

Edit `frontend/src/index.css`:
- `:root { --primary: ... }` → warna utama dark mode
- `.light { --primary: ... }` → warna utama light mode

### Tambah Section Baru

1. Buat component baru di `frontend/src/components/sections/`
2. Tambahkan section ID ke `SECTIONS` di `backend/server.py`
3. Tambahkan default content ke `DEFAULT_CONTENT`
4. Import & render di `frontend/src/pages/PortfolioPage.jsx`

### Ganti Admin Password

Edit `backend/.env` → ubah `ADMIN_PASSWORD` → restart backend.  
Backend otomatis update hash password admin di MongoDB.

---

## 📁 Struktur Folder

```
/app
├── backend/
│   ├── server.py              # Main FastAPI app
│   ├── requirements.txt
│   └── .env                   # Backend env vars
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/
│   │   │   ├── PortfolioPage.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── TechBackground.jsx
│   │   │   ├── SectionShape.jsx
│   │   │   ├── sections/      # Summary, Skills, ...
│   │   │   ├── admin/         # FileManager
│   │   │   └── ui/            # shadcn components
│   │   ├── contexts/          # Auth, Theme, Language
│   │   ├── hooks/             # useContent, useActiveSection
│   │   ├── i18n/              # translations.js
│   │   └── lib/               # api.js
│   ├── package.json
│   └── .env                   # Frontend env vars
├── memory/
│   └── test_credentials.md    # Test credentials
└── README.md
```

---

## 🐛 Troubleshooting

| Issue | Solusi |
|-------|--------|
| Backend tidak start | Cek `backend/.env` lengkap, MongoDB jalan, port 8001 tidak dipakai |
| `MONGO_URL` error | Cek format: `mongodb://localhost:27017` atau Atlas connection string |
| Admin login gagal | Cek `ADMIN_EMAIL` & `ADMIN_PASSWORD` di `.env`, restart backend |
| Upload file gagal | Pastikan `EMERGENT_LLM_KEY` valid & ter-set di `.env` |
| Frontend white screen | Cek `REACT_APP_BACKEND_URL`, browser console untuk error CORS |
| WebSocket forum tidak konek | Pastikan backend support WS, cek nginx/ingress route `/api/ws/forum` |

---

## 📜 Lisensi & Kredit

Made by **Ryuzen** · `MY CV`  
Built with ❤️ & ☕ · powered by [Emergent](https://emergent.sh)

---

## 🤝 Kontribusi

Pull requests welcome! Untuk perubahan besar, buka issue dulu untuk diskusi.

---

> 💡 **Tip**: Sebelum deploy, ubah password admin default & generate JWT_SECRET baru!
