# Cache — `chub cache status|clear`

Inspect and clear the local source cache. With a local `path:` source (the harness config),
the cache is the built dist dir itself. Command: `cli/src/commands/cache.js`.

## How users reach it

```bash
chub cache status
chub cache clear
```

## How to drive it

```bash
# status lists each source and its path
node cli/bin/chub cache status > /tmp/verify-chub/cache-status.txt
grep -c 'test (local)' /tmp/verify-chub/cache-status.txt
grep -c "$VERIFY_CHUB_DIR/dist" /tmp/verify-chub/cache-status.txt

# clear removes the cached registry/index for each source
node cli/bin/chub cache clear > /tmp/verify-chub/cache-clear.txt
grep -c 'Cache cleared' /tmp/verify-chub/cache-clear.txt
```

## What proves success

- `cache status` prints a `test (local)` section and a `Path:` line pointing at
  `$VERIFY_CHUB_DIR/dist`.
- `cache clear` prints `Cache cleared.` and exits 0.

## Notes

- After `cache clear`, a subsequent `chub search` re-reads the source `path:` directly (local
  sources do not require a re-fetch), so `search --json` still returns `total: 4`. Do NOT
  assert that clear breaks search — for a local `path:` source it does not.
- `cache clear` does NOT delete the built `dist/` directory; it removes the per-source
  registry/search-index cache files under `CHUB_DIR/sources/<name>/`. The `path:` source is
  rebuilt from `dist/` on the next read.
