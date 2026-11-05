FROM denoland/deno:alpine

WORKDIR /app

# Pre-create the avatars directory so the volume mount has proper path & permissions
RUN mkdir -p /app/uploads/avatars && chown -R deno:deno /app

# Cache dependencies
COPY deno.json deno.lock ./
RUN deno cache --lock=deno.lock || true

# Copy application source
COPY . .

# Cache the main entrypoint
RUN deno cache src/main.ts

# Declare the volume mount point for avatars
VOLUME ["/app/uploads/avatars"]

EXPOSE 8000

CMD ["deno", "task", "start"]