#!/usr/bin/env bash
# One-command setup script for Portfolio CV
# Usage: ./setup.sh
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Portfolio CV — Auto Setup               ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"

# 1. Check Docker
if ! command -v docker &> /dev/null; then
  echo -e "${RED}✗ Docker not found.${NC} Install from https://docs.docker.com/get-docker/"
  exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
  echo -e "${RED}✗ Docker Compose not found.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Docker Compose found${NC}"

# 2. Create .env if missing
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠  No .env found — generating from template…${NC}"
  cp .env.example .env

  # Auto-generate JWT_SECRET
  if command -v python3 &> /dev/null; then
    JWT_VALUE=$(python3 -c "import secrets; print(secrets.token_hex(32))")
  elif command -v openssl &> /dev/null; then
    JWT_VALUE=$(openssl rand -hex 32)
  else
    JWT_VALUE="please-generate-a-random-64-char-hex-and-replace"
  fi

  # Cross-platform sed
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=${JWT_VALUE}|" .env
  else
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_VALUE}|" .env
  fi

  echo -e "${GREEN}✓ .env created with random JWT_SECRET${NC}"
  echo -e "${YELLOW}  → Edit .env to change ADMIN_EMAIL / ADMIN_PASSWORD before deploying publicly${NC}"
fi

# 3. Build and run
echo -e "\n${CYAN}🚀 Building & starting all services…${NC}\n"

if docker compose version &> /dev/null; then
  docker compose up -d --build
else
  docker-compose up -d --build
fi

echo -e "\n${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ All services are up                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo -e "${CYAN}Frontend:${NC}   http://localhost:3000"
echo -e "${CYAN}Backend:${NC}    http://localhost:8001/api/"
echo -e "${CYAN}MongoDB:${NC}    mongodb://localhost:27017"
echo -e "${CYAN}Admin login:${NC} http://localhost:3000/admin/login"
echo -e ""
echo -e "Stop with:   ${YELLOW}docker compose down${NC}"
echo -e "View logs:   ${YELLOW}docker compose logs -f${NC}"
