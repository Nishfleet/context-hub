---
name: verify-chub
description: Launch, health-check, drive, and prove the chub CLI (Context Hub) locally from a deterministic fixture. Use before claiming any context-hub change works end-to-end.
---

Context Hub (repo `context-hub`) ships the `chub` CLI — a Node.js ESM tool that searches and
fetches LLM-optimized docs/skills from a built registry. The CLI lives in `cli/` (`cli/bin/chub`,
`cli/src/`), content lives in `content/`, and tests in `cli/tests/` + `cli/test/`. Node >= 18
(`cli/package.json` `engines`); the VPS has Node 22.

Agents doing E2E verification MUST use this harness instead of improvising a launch, and
whoever ships a feature updates the matching file in `features/` in the same PR.

## LAUNCH

### Primary — deterministic fixture registry (use this)

The CLI has no long-running server. "Launching" it means building the small checked-in fixture
content into a registry and pointing an isolated `CHUB_DIR` at it. This is fully offline,
deterministic, and fast (< 2s), and it is what `cli/test/e2e.test.js` does.

```bash
npm --prefix cli install               # first run only; deps are gitignored
VERIFY_CHUB_DIR=$(mktemp -d -t verify-chub.XXXXXX)
mkdir -p "$VERIFY_CHUB_DIR"
node cli/bin/chub build cli/test/fixtures -o "$VERIFY_CHUB_DIR/dist"
cat > "$VERIFY_CHUB_DIR/config.yaml" <<'YAML'
sources:
  - name: test
    path: <ABSOLUTE_PATH_TO_$VERIFY_CHUB_DIR>/dist
source: official,maintainer,community
telemetry: false
feedback: true
YAML
```

The `config.yaml` `sources[].path` MUST be absolute — a relative path resolves against the
process cwd, not `CHUB_DIR`, and breaks when a drive runs from elsewhere. Replace
`<ABSOLUTE_PATH_TO_$VERIFY_CHUB_DIR>` with the real expanded path (the heredoc above is a
template; write the expanded value).

`cli/test/fixtures` ships three deterministic sources:
- `acme` — `acme/widgets` (javascript, v2.0.0, has `references/advanced.md`),
  `acme/versioned-api` (javascript, v1.0.0 + v2.0.0).
- `multilang` — `multilang/client` (go + javascript + python; needs `--lang`).
- `testskills` — `testskills/deploy` (a skill, no language).

Build prints `Built: 3 docs, 1 skills → <dist>`. The two `Warning: skills/ade/...` lines come
from the full `content/` build, NOT from the fixture build — if you see them on a fixture build,
the wrong content dir was used.

Run every command with `CHUB_DIR="$VERIFY_CHUB_DIR"`, `CHUB_TELEMETRY=0`, and `NO_COLOR=1` so
output is stable and nothing phones home:

```bash
export CHUB_DIR="$VERIFY_CHUB_DIR" CHUB_TELEMETRY=0 NO_COLOR=1
```

### Secondary — full content/ build (only when the change is content-indexing)

```bash
node cli/bin/chub build content/ -o "$VERIFY_CHUB_DIR/dist-full"
```

This builds ~1597 docs + 9 skills and takes longer. Use it only to prove a change that affects
how `content/` is indexed (frontmatter parsing, multi-language resolution, the build command
itself). For CLI behavior changes, the fixture build is enough.

### Never

- `npm install -g @aisuite/chub` and use the global binary — that is a different version than
  the checkout under test. Always run `node cli/bin/chub`.
- Run without `CHUB_DIR` set — the CLI falls back to `~/.chub` and pollutes the developer's
  real config/cache.
- Run without `CHUB_TELEMETRY=0` — the CLI posts analytics to `api.aichub.org` on every
  command. The harness must be offline.

## DOCTOR

Two checks; both must pass.

```bash
# 1. Help loads and exits 0. Source line varies (remote vs local fallback); do not assert it.
node cli/bin/chub --help >/dev/null && echo "help-ok"

# 2. search --json returns valid JSON with a numeric total and a results array.
node cli/bin/chub search --json | jq -e '.total | type == "number" and . >= 0' >/dev/null \
  && echo "search-json-ok"
```

Expected on the fixture build: `help-ok` and `search-json-ok`, and `search --json` `total` is
`4` (3 docs + 1 skill). If `total` is `0`, the `config.yaml` path is wrong or the build failed.

## DRIVE

Per-feature steps live in `features/`:

| Feature | File |
| --- | --- |
| Search (list, fuzzy, exact id, tags) | `features/search.md` |
| Get a doc (by id + lang, -o, --file) | `features/get-doc.md` |
| Get a skill | `features/get-skill.md` |
| Annotate (save / list / clear) | `features/annotate.md` |
| Feedback (rate a doc) | `features/feedback.md` |
| Build a registry from content | `features/build.md` |
| Cache (status / clear) | `features/cache.md` |

Drive style is HTTP-free: every drive is `node cli/bin/chub <args>` against the fixture
registry, asserting on stdout / `--json` / exit code. Add `--json` for machine-parseable
assertions; otherwise grep stdout.

### Deterministic inputs on the fixture registry

- `search` (no query) → `total: 4`, ids include `acme/widgets`, `acme/versioned-api`,
  `multilang/client`, `testskills/deploy`.
- `search acme` → `total: 2` (`acme/widgets`, `acme/versioned-api`).
- `search acme/widgets` (exact id) → full detail record, `name: "widgets"`.
- `get acme/widgets --lang js` → frontmatter + `# Acme Widgets API` body.
- `get multilang/client` (no `--lang`) → exit 1, error naming `go, javascript, python`.
- `get testskills/deploy` → skill body, no `--lang` needed.
- `annotate acme/widgets "note"` → `Annotation saved for acme/widgets.`
- `feedback acme/widgets up --label accurate "reason"` (with `feedback: true`) →
  `Feedback recorded for acme/widgets ...`.

### Test-only surfaces — never drive these in a feature proof

- `cli/test/fixtures/dist/_test_output.md` — written by an e2e test's `-o` assertion; do not
  treat its presence as proof of anything.
- The `CHUB_FEEDBACK=0` env var and `feedback: false` config — these disable feedback and are
  the negative-path test fixture, not a feature drive.

## EVIDENCE

**stdout / JSON.** Capture every drive's stdout to a file under `/tmp/verify-chub/` (or the
caller's evidence dir). For `--json` drives, pipe through `jq -e` and record both the raw JSON
and the assertion result.

**Exit codes.** `chub` exits non-zero on a missing id, a missing `--lang` on a multi-language
doc, an unknown command, or a build failure. Record `echo "rc=$?"` after each drive.

**What counts as proof:** doctor pass + the feature's observable state from its `features/`
file, captured to files. A claim in a transcript is not proof.

Store evidence OUTSIDE the repo tree — a run directory under `/tmp`, or the caller's evidence
directory. Never commit evidence into this repo.

## CLEANUP

Remove the isolated `CHUB_DIR`. Never `rm -rf ~/.chub` — that is the developer's real config.

```bash
rm -rf "$VERIFY_CHUB_DIR"
```

- `node_modules/` under `cli/` may be left in place; `npm install` is idempotent and
  `cli/node_modules` is gitignored.
- Do NOT run `npm --prefix ci install` or `npm ci` as part of cleanup — it can rewrite
  `cli/package-lock.json`.
- Cleanup preserves evidence. Teardown never deletes the captured stdout/JSON files.
