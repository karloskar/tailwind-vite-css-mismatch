# Tailwind CSS v4 + Vite Environment API — CSS Hash Mismatch

Minimal reproduction: `@tailwindcss/vite` produces different CSS content for client and SSR bundles when using Vite's Environment API (as used by TanStack Start).

## The Bug

The SSR environment build scans a different set of files than the client environment build. The SSR pass picks up words like `hidden`, `static`, `blur`, `start`, `end` from files only visible to the server environment, and Tailwind emits them as utility classes. This produces **different CSS content** between client and SSR, with different hashes as a consequence.

**Concrete diff** (Docker build):

|                      | Client   | SSR                                                                                                                                                                                                                                                 |
| -------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSS size             | 51.72 kB | 53.07 kB                                                                                                                                                                                                                                            |
| Utility classes      | 446      | 451                                                                                                                                                                                                                                                 |
| CSS custom vars      | 67       | 80                                                                                                                                                                                                                                                  |
| Extra classes in SSR | —        | `.blur`, `.end`, `.hidden`, `.start`, `.static`                                                                                                                                                                                                     |
| Extra vars in SSR    | —        | `--tw-blur`, `--tw-brightness`, `--tw-contrast`, `--tw-grayscale`, `--tw-hue-rotate`, `--tw-invert`, `--tw-opacity`, `--tw-saturate`, `--tw-sepia`, `--tw-drop-shadow`, `--tw-drop-shadow-color`, `--tw-drop-shadow-alpha`, `--tw-drop-shadow-size` |

The SSR bundle then references a CSS file that doesn't exist in the client
output, so styles fail to load.

## Stack

| Package                 | Version                            |
| ----------------------- | ---------------------------------- |
| `@tailwindcss/vite`     | 4.2.x                              |
| `tailwindcss`           | 4.2.x                              |
| `vite`                  | 8.0.3                              |
| `@tanstack/react-start` | 1.166+ (uses Vite Environment API) |
| `nitro`                 | 3.x                                |
| `bun`                   | 1.3                                |
| `node`                  | 22                                 |

## Reproduce

```bash
bun install

# Local build — always passes (both environments see the same files)
bun run build
bash check-hashes.sh .output

# Docker build (Bun) — fails consistently
docker build --no-cache -t tw-repro .
# Look for PASS/FAIL in build output

# Docker build (Node) — same failure, confirms this is not Bun-specific
docker build --no-cache -f Dockerfile.node -t tw-repro-node .
```

The `@source` directive in `src/styles.css` points to `packages/ui/` which contains ~80 generated component files using diverse Tailwind utility classes. This creates enough CSS surface area for the environment divergence to produce a measurably different hash.

## Root Cause

Vite's Environment API builds client and SSR as separate environments. The `@tailwindcss/vite` plugin's file-system scanner runs independently in each environment and produces different candidate sets. The SSR environment appears to scan additional files (likely server-only modules in node_modules) that contain common English words matching Tailwind utility names.

This is the same class of bug as [#16389](https://github.com/tailwindlabs/tailwindcss/issues/16389) (fixed in [#16631](https://github.com/tailwindlabs/tailwindcss/pull/16631) for classic `build.ssr`), but manifesting through the Vite Environment API code path.

## Related Issues

- [tailwindlabs/tailwindcss#19853](https://github.com/tailwindlabs/tailwindcss/issues/19853) — Duplicate unlayered preflight with Vite Environment API
- [tailwindlabs/tailwindcss#16389](https://github.com/tailwindlabs/tailwindcss/issues/16389) — Original SSR hash mismatch (fixed for classic `build.ssr`)
- [tailwindlabs/tailwindcss#18002](https://github.com/tailwindlabs/tailwindcss/issues/18002) — `@tailwindcss/vite` + Environment API compatibility

## Workaround

Post-build sed in the Dockerfile to patch SSR bundles:

```dockerfile
RUN CLIENT_CSS=$(ls .output/public/assets/styles-*.css | head -1) && \
    CLIENT_HASH=$(basename "$CLIENT_CSS") && \
    find .output/server -name '*.mjs' -exec \
      sed -i "s|/assets/styles-[^\"]*\.css|/assets/${CLIENT_HASH}|g" {} +
```
