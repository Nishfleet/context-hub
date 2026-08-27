# Search — `chub search [query]`

List and find docs/skills in the built registry. Command: `cli/src/commands/search.js`.

## How users reach it

```bash
chub search                 # list all (default --limit 20)
chub search "openai"        # fuzzy match
chub search openai/chat     # exact id -> full detail
chub search --tags skill    # filter by tag
chub search --json          # machine output
```

## How to drive it

```bash
node cli/bin/chub search --json > /tmp/verify-chub/search-all.json
jq -e '.total == 4' /tmp/verify-chub/search-all.json
jq -e '.results | map(.id) | sort == ["acme/versioned-api","acme/widgets","multilang/client","testskills/deploy"]' \
  /tmp/verify-chub/search-all.json

node cli/bin/chub search acme --json > /tmp/verify-chub/search-acme.json
jq -e '.total == 2' /tmp/verify-chub/search-acme.json

# Exact id -> detail record (name field, not a results array)
node cli/bin/chub search acme/widgets --json > /tmp/verify-chub/search-exact.json
jq -e '.name == "widgets"' /tmp/verify-chub/search-exact.json

# Human output lists ids and marks skills with [skill]
node cli/bin/chub search | grep -c 'testskills/deploy'
```

## What proves success

- `search --json` `total` is `4` on the fixture build, and the four ids are exactly
  `acme/versioned-api`, `acme/widgets`, `multilang/client`, `testskills/deploy` (order
  independent).
- `search acme --json` `total` is `2`.
- `search acme/widgets --json` returns an object with `name: "widgets"` (detail, not a list).
- Human `search` output contains `testskills/deploy` and a `[skill]` marker for it.

## Notes

- Default `--limit` is `20` (`search.js`). The fixture set is smaller, so the limit never
  truncates here; do not assert on limit behavior with the fixtures.
- `--tags skill` returns `total: 0` on the fixture build because the skill's tags are
  `deploy,ci,automation`, not `skill`. Do not assert `--tags skill` returns the skill.
