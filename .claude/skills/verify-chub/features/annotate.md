# Annotate — `chub annotate [id] [note]`

Save a local note that reappears on future `chub get` calls. Notes persist in `CHUB_DIR` and
are never sent upstream. Command: `cli/src/commands/annotate.js`.

## How users reach it

```bash
chub annotate acme/widgets "Webhook needs raw body"
chub annotate --list
chub annotate acme/widgets --clear
```

## How to drive it

```bash
# Save
node cli/bin/chub annotate acme/widgets "harness note" > /tmp/verify-chub/ann-save.txt
grep -c 'Annotation saved for acme/widgets' /tmp/verify-chub/ann-save.txt

# List (--json)
node cli/bin/chub annotate --list --json > /tmp/verify-chub/ann-list.json
jq -e '. | length == 1 and .[0].id == "acme/widgets" and .[0].note == "harness note"' \
  /tmp/verify-chub/ann-list.json

# get surfaces annotationAvailable (does NOT leak the note without --with-annotations)
node cli/bin/chub get acme/widgets --lang js --json > /tmp/verify-chub/ann-get.json
jq -e '.annotation == null and .annotationAvailable == true' /tmp/verify-chub/ann-get.json

# get --with-annotations includes the note
node cli/bin/chub get acme/widgets --lang js --with-annotations --json > /tmp/verify-chub/ann-get-with.json
jq -e '.annotation.note == "harness note"' /tmp/verify-chub/ann-get-with.json

# Clear
node cli/bin/chub annotate acme/widgets --clear > /tmp/verify-chub/ann-clear.txt
node cli/bin/chub annotate --list --json | jq -e 'length == 0'
```

## What proves success

- `annotate <id> "<note>"` prints `Annotation saved for <id>.`
- `annotate --list --json` returns an array with the saved `{id, note, updatedAt}`.
- `get --json` (no `--with-annotations`) sets `annotationAvailable: true` but `annotation` is
  absent/null — the note is NOT leaked by default.
- `get --with-annotations --json` includes `.annotation.note` equal to the saved note.
- `annotate <id> --clear` removes it; a subsequent `--list --json` is empty.

## Notes

- Annotations are keyed by id in `CHUB_DIR`; switching `CHUB_DIR` gives a clean slate.
- The note is treated as untrusted input — it is surfaced to the agent, not executed.
