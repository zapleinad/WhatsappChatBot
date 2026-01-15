#!/usr/bin/env bash
# Script de build para Render - Instala dependências do Chrome/Puppeteer

echo "🔧 Instalando dependências do sistema para Chrome/Puppeteer..."

# Atualizar apt
apt-get update

# Instalar dependências necessárias para o Chrome
apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libgbm1 \
    libxshmfence1

echo "✅ Dependências do sistema instaladas!"

# Instalar dependências Node.js
echo "📦 Instalando dependências Node.js..."
npm install

echo "✅ Build concluído com sucesso!"
