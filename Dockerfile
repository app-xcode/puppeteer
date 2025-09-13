# Gunakan Node.js versi LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Salin package.json dan package-lock.json dulu (buat caching)
COPY package*.json ./

# Install dependencies (kosong, tapi tetap jalankan)
RUN npm install

# Salin semua file proyek
COPY . .

# Expose port default Vercel / Node
EXPOSE 3000

# Jalankan API dengan vercel dev saat development
# atau bisa diganti "node api/komentar.js" jika standalone server
CMD ["npx", "vercel", "dev", "--listen", "3000"]
