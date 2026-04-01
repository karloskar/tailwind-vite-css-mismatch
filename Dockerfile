# Reproduction: @tailwindcss/vite produces different CSS for client vs SSR
# when node_modules and source files live in different Docker layers.
#
# This is the standard Docker idiom (install deps, then copy source).
# Build: docker build --no-cache -t tw-repro .

ARG BUN_VERSION=1.3

# --- Build ---
FROM oven/bun:${BUN_VERSION} AS build
WORKDIR /app

# Layer 1: install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile 2>/dev/null || bun install

# Layer 2: copy source (separate layer from node_modules — triggers the bug)
COPY packages/ packages/
COPY src/ src/
COPY vite.config.ts tsconfig.json ./

RUN bun run build

# Verify CSS hashes
COPY check-hashes.sh .
RUN bash check-hashes.sh .output || true

# --- Runtime ---
FROM oven/bun:${BUN_VERSION}-slim
WORKDIR /app
COPY --from=build /app/.output .output
COPY --from=build /app/check-hashes.sh .
EXPOSE 3000
CMD ["bun", ".output/server/index.mjs"]
