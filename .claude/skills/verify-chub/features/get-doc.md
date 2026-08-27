# Get a doc — `chub get <id> --lang <lang>`

Fetch a doc by id and language. Command: `cli/src/commands/get.js`.

## How users reach it

```bash
chub get acme/widgets --lang js          # print to terminal
chub get acme/widgets --lang js -o f.md  # write to file
chub get acme/widgets --file references/advanced.md   # extra file
chub get acme/versioned-api --lang js --version 1.0.0 # pin version
```

## How to drive it

```bash
# Print path
node cli/bin/chub get acme/widgets --lang js > /tmp/verify-chub/get-widgets.md
head -1 /tmp/verify-chub/get-widgets.md   # frontmatter opening ---
grep -c '# Acme Widgets API' /tmp/verify-chub/get-widgets.md

# File output
node cli/bin/chub get acme/widgets --lang js -o /tmp/verify-chub/out.md
head -1 /tmp/verify-chub/out.md
grep -c '# Acme Widgets API' /tmp/verify-chub/out.md

# Additional file
node cli/bin/chub get acme/widgets --file references/advanced.md > /tmp/verify-chub/advanced.md
grep -c 'Advanced' /tmp/verify-chub/advanced.md

# Version pin
node cli/bin/chub get acme/versioned-api --lang js --version 1.0.0 > /tmp/verify-chub/v1.md
grep -c '1\.0\.0' /tmp/verify-chub/v1.md

# Missing --lang on a multi-language doc -> exit 1
node cli/bin/chub get multilang/client; echo "rc=$?" > /tmp/verify-chub/get-nolang.rc
grep -c 'rc=1' /tmp/verify-chub/get-nolang.rc
```

## What proves success

- `get acme/widgets --lang js` prints frontmatter (`---` first line) and a body containing
  `# Acme Widgets API`.
- `-o /tmp/.../out.md` writes the same content to the file and prints `Written to <path>`.
- `--file references/advanced.md` prints the advanced file body (contains `Advanced`).
- `--version 1.0.0` returns the v1 doc (contains `1.0.0`).
- `get multilang/client` with no `--lang` exits 1 with an error naming
  `go, javascript, python`.

## Notes

- `--lang` accepts short (`js`, `py`, `ts`, `go`, `rb`, `cs`) or full (`javascript`) names.
- An unknown id exits 1 with `Error: No doc or skill found with id "<id>".`
