FROM node:18-slim

# Install Python and yt-dlp
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install --no-cache-dir yt-dlp && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Expose port
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
