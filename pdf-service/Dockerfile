FROM node:18-alpine

# Install fonts, tools and Chromium dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto \
    font-noto-cjk \
    font-noto-extra \
    fontconfig

# Skip Puppeteer download - use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create data directory for storing temporary files
RUN mkdir -p /app/data/temp && \
    chmod -R 777 /app/data

# Expose port 3001
EXPOSE 3001

# Start the app
CMD ["node", "index.js"] 