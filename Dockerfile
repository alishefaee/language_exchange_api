FROM denoland/deno:alpine

WORKDIR /app

# Pre-create the avatars directory so the volume mount has proper path & permissions
RUN mkdir -p /app/uploads/avatars && chown -R deno:deno /app

# 1. Copy dependency manifests first for Docker layer caching
COPY deno.json deno.lock ./

# 2. Install all npm and JSR dependencies defined in deno.json / deno.lock
RUN deno install

# 3. Copy application source (make sure node_modules is in .dockerignore!)
COPY . .

# 4. Cache and type-check the main entrypoint using installed dependencies
RUN deno cache src/main.ts

# Declare the volume mount point for avatars
VOLUME ["/app/uploads/avatars"]

EXPOSE 8000

CMD ["deno", "task", "start"]