FROM denoland/deno:alpine-1.42.0

# Set the working directory
WORKDIR /app

# Cache the dependencies as a separate step
COPY deno.json deno.lock ./
RUN deno cache --lock=deno.lock || true

# Copy the rest of the source code
COPY . .

# Cache the main application
RUN deno cache src/main.ts

# Run the app (using your deno.json start task)
CMD ["deno", "task", "start"]