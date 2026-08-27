# Build — `chub build <content-dir>`

Build a registry from a content directory. Command: `cli/src/commands/build.js`.

## How users reach it

```bash
chub build cli/test/fixtures -o dist          # build fixtures
chub build content/ -o dist                   # build full content
chub build cli/test/fixtures --validate-only  # validate, no write
chub build cli/test/fixtures --json           # machine output
```

## How to drive it

```bash
# Fixture build
node cli/bin/chub build cli/test/fixtures -o /tmp/verify-chub/build-out > /tmp/verify-chub/build.txt
grep -c 'Built: 3 docs, 1 skills' /tmp/verify-chub/build.txt
test -f /tmp/verify-chub/build-out/registry.json && echo "registry-ok"

# --validate-only (no output dir written; prints "Valid:", not "Built:")
node cli/bin/chub build cli/test/fixtures --validate-only > /tmp/verify-chub/build-validate.txt
grep -c 'Valid: 3 docs, 1 skills, 0 warnings' /tmp/verify-chub/build-validate.txt
test ! -e /tmp/verify-chub/build-validate-out && echo "no-dir-written-ok"

# --json
node cli/bin/chub build cli/test/fixtures --validate-only --json > /tmp/verify-chub/build.json
jq -e '.docs == 3 and .skills == 1 and .warnings == 0' /tmp/verify-chub/build.json
```

## What proves success

- `build cli/test/fixtures -o <dir>` prints `Built: 3 docs, 1 skills → <dir>` and writes
  `<dir>/registry.json`.
- `--validate-only` prints `Valid: 3 docs, 1 skills, 0 warnings` (NOT `Built:`) and writes no
  output dir.
- `--validate-only --json` returns `{"docs": 3, "skills": 1, "warnings": 0}`.

## Notes

- The fixture build is silent (no warnings). The full `content/` build prints two
  `Warning: skills/ade/...: missing 'metadata.source'` lines — those are content metadata
  gaps, not build failures, and only appear on the `content/` build.
- A build against a non-existent dir exits non-zero.
