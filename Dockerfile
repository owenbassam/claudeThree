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

# Copy Python requirements first
COPY transcript-api/requirements.txt ./requirements.txt

# Install Python dependencies
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy package files for Node
COPY transcript-api/package*.json ./transcript-api/

# Change to transcript-api directory
WORKDIR /app/transcript-api

# Install Node dependencies
RUN npm ci --only=production

# Copy rest of the application
WORKDIR /app
COPY . .

# Set working directory back to transcript-api
WORKDIR /app/transcript-api

# Expose port
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
