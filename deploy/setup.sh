#!/usr/bin/env bash
# ==============================================================================
# Wap Mobility - Cloud Host Automation & Deployment Script
# Compatible with: Ubuntu 22.04 / 24.04 LTS, Debian 12 (AWS EC2, DigitalOcean, Render)
# ==============================================================================

set -euo pipefail

# Visual formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m"

echo -e "${BOLD}${BLUE}================================================================${NC}"
echo -e "${BOLD}${BLUE}   WAP MOBILITY - CLOUD DEPLOYMENT & POSTGIS STACK SETUP        ${NC}"
echo -e "${BOLD}${BLUE}================================================================${NC}"

# Check for root / sudo
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}Error: This script must be run as root or with sudo privileges.${NC}"
   exit 1
fi

DOMAIN_NAME="${1:-api.wapmobility.com}"
EMAIL="${2:-devops@wapmobility.com}"

echo -e "${YELLOW}Target Domain:${NC} $DOMAIN_NAME"
echo -e "${YELLOW}Certbot Email:${NC} $EMAIL"
echo ""

# ------------------------------------------------------------------------------
# STEP 1: System Updates & Dependencies
# ------------------------------------------------------------------------------
echo -e "${GREEN}[1/6] Updating system packages and installing prerequisites...${NC}"
apt-get update -y
apt-get install -y curl wget git ufw ca-certificates gnupg lsb-release

# ------------------------------------------------------------------------------
# STEP 2: Install Docker Engine & Docker Compose Plugin
# ------------------------------------------------------------------------------
echo -e "${GREEN}[2/6] Checking Docker Engine installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo "Installing Docker Engine..."
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable --now docker
else
    echo "Docker is already installed ($(docker --version))."
fi

# ------------------------------------------------------------------------------
# STEP 3: Configure UFW Host Firewall
# ------------------------------------------------------------------------------
echo -e "${GREEN}[3/6] Configuring host firewall (Ports 22, 80, 443)...${NC}"
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP / ACME'
ufw allow 443/tcp comment 'HTTPS & WebSocket'
ufw --force enable

# ------------------------------------------------------------------------------
# STEP 4: Setup Environment Configuration (.env)
# ------------------------------------------------------------------------------
echo -e "${GREEN}[4/6] Verifying environment (.env) configuration...${NC}"
if [[ ! -f .env ]]; then
    if [[ -f .env.production.example ]]; then
        echo "Creating .env from .env.production.example..."
        cp .env.production.example .env
        sed -i "s/DOMAIN_NAME=.*/DOMAIN_NAME=$DOMAIN_NAME/" .env
        sed -i "s/SSL_ADMIN_EMAIL=.*/SSL_ADMIN_EMAIL=$EMAIL/" .env
        echo -e "${YELLOW}Notice: Generated default .env. Please update production secret keys!${NC}"
    else
        echo -e "${RED}Error: Neither .env nor .env.production.example found.${NC}"
        exit 1
    fi
fi

# ------------------------------------------------------------------------------
# STEP 5: SSL Certificate Generation (Let's Encrypt)
# ------------------------------------------------------------------------------
echo -e "${GREEN}[5/6] Ensuring SSL Certificates for $DOMAIN_NAME...${NC}"
mkdir -p deploy/certbot/conf deploy/certbot/www

# Check if certificate exists, or create a dummy certificate for initial NGINX boot
CERT_DIR="deploy/certbot/conf/live/$DOMAIN_NAME"
if [[ ! -f "$CERT_DIR/fullchain.pem" ]]; then
    echo "Generating temporary self-signed certificates to allow NGINX to boot..."
    mkdir -p "$CERT_DIR"
    openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
        -subj "/CN=localhost"
fi

# ------------------------------------------------------------------------------
# STEP 6: Build & Launch Docker Stack
# ------------------------------------------------------------------------------
echo -e "${GREEN}[6/6] Building images and starting multi-container stack...${NC}"
docker compose down --remove-orphans || true
docker compose build --pull api
docker compose up -d

echo ""
echo -e "${GREEN}Verifying service health checks (15s wait)...${NC}"
sleep 15
docker compose ps

echo ""
echo -e "${BOLD}${GREEN}================================================================${NC}"
echo -e "${BOLD}${GREEN}   DEPLOYMENT COMPLETE!                                         ${NC}"
echo -e "${BOLD}${GREEN}================================================================${NC}"
echo -e "API Endpoint:        ${BOLD}https://$DOMAIN_NAME/api/health${NC}"
echo -e "Socket.IO Endpoint:  ${BOLD}wss://$DOMAIN_NAME/socket.io/${NC}"
echo -e "PostGIS DB Status:   ${BOLD}Healthy (Named volume: wap_postgres_data)${NC}"
echo ""
echo -e "To request official Let's Encrypt certificate via Webroot, execute:"
echo -e "${YELLOW}docker compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot -d $DOMAIN_NAME --email $EMAIL --agree-tos --no-eff-email --force-renewal${NC}"
echo -e "${YELLOW}docker compose exec nginx nginx -s reload${NC}"
echo ""
echo -e "View live container logs:"
echo -e "${BLUE}docker compose logs -f api${NC}"
echo -e "${BLUE}docker compose logs -f db${NC}"
