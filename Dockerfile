FROM node:18-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-setuptools \
    ffmpeg \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN pip3 install --no-cache-dir --break-system-packages yt-dlp

# Create app directory
WORKDIR /app

# Copy everything from context (Railway will set context to repo root)
COPY . .

# Change to transcript-api directory and install dependencies
WORKDIR /app/transcript-api
RUN npm ci --only=production

# Expose port
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
