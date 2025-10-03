FROM node:18-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    python3-setuptools \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verify Python installation and create symlink if needed
RUN which python3 && python3 --version || \
    (which python && ln -s $(which python) /usr/bin/python3)

# Set Python path environment variable
ENV PYTHON_CMD=/usr/bin/python3

# Create app directory
WORKDIR /app

# Copy Python requirements and install
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy package files for Node
COPY transcript-api/package*.json ./transcript-api/

# Install Node dependencies
WORKDIR /app/transcript-api
RUN npm ci --only=production

# Copy rest of the application
WORKDIR /app
COPY . .

# Set working directory to transcript-api
WORKDIR /app/transcript-api

# Expose port
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
