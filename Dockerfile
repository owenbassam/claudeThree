FROM node:18-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-setuptools \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy everything from context (Railway will set context to repo root)
COPY . .

# Change to transcript-api directory
WORKDIR /app/transcript-api

# Install Node dependencies
RUN npm ci --only=production

# Install Python dependencies
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Expose port
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
