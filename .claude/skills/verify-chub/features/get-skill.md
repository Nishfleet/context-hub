# Get a skill — `chub get <skill-id>`

Fetch a skill (no `--lang` needed). Skills live under `*/skills/` in the source tree and are
indexed flat. Command: `cli/src/commands/get.js`.

## How users reach it

```bash
chub get testskills/deploy
```

## How to drive it

```bash
node cli/bin/chub get testskills/deploy > /tmp/verify-chub/get-skill.md
head -1 /tmp/verify-chub/get-skill.md          # --- (frontmatter)
grep -c 'name: deploy' /tmp/verify-chub/get-skill.md
grep -c '# Deploy Skill' /tmp/verify-chub/get-skill.md
```

## What proves success

- Output starts with `---` (frontmatter) and includes `name: deploy`.
- Body contains `# Deploy Skill`.
- No `--lang` flag is required or accepted for skills (passing it does not error, but is
  meaningless).

## Notes

- A skill id is `<source-dir>/<skill-name>` — here `testskills/deploy`, derived from
  `cli/test/fixtures/testskills/skills/deploy/SKILL.md`.
- `search deploy --json` returns `total: 1` with id `testskills/deploy`, which is the
  discovery path into this get.
