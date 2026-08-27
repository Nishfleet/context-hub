# Feedback — `chub feedback <id> <up|down>`

Rate a doc or skill after using it. Disabled by default; the harness `config.yaml` sets
`feedback: true` to enable it. Command: `cli/src/commands/feedback.js`.

## How users reach it

```bash
chub feedback acme/widgets up --label accurate "Clear examples"
chub feedback acme/widgets down --label outdated "Missing v3"
```

Valid labels: `accurate`, `well-structured`, `helpful`, `good-examples`, `outdated`,
`inaccurate`, `incomplete`, `wrong-examples`, `wrong-version`, `poorly-structured`.

## How to drive it

```bash
# Requires feedback: true in $CHUB_DIR/config.yaml (the harness sets this).
node cli/bin/chub feedback acme/widgets up --label accurate "harness check" \
  > /tmp/verify-chub/fb-up.txt
grep -c 'Feedback recorded for acme/widgets' /tmp/verify-chub/fb-up.txt

# Disabled path (negative proof): a CHUB_DIR with feedback: false refuses.
mkdir -p /tmp/verify-chub-fb-off
cp "$VERIFY_CHUB_DIR"/config.yaml /tmp/verify-chub-fb-off/config.yaml
sed -i 's/feedback: true/feedback: false/' /tmp/verify-chub-fb-off/config.yaml
CHUB_DIR=/tmp/verify-chub-fb-off node cli/bin/chub feedback acme/widgets up --label accurate x \
  > /tmp/verify-chub/fb-disabled.txt
grep -c 'Feedback is disabled' /tmp/verify-chub/fb-disabled.txt
rm -rf /tmp/verify-chub-fb-off
```

## What proves success

- With `feedback: true`: `feedback <id> up --label <label> "<reason>"` prints
  `Feedback recorded for <id>...` and exits 0.
- With `feedback: false`: the same command prints `Feedback is disabled. Enable with:
  feedback: true in ~/.chub/config.yaml` and exits non-zero.

## Notes

- Feedback is fire-and-forget to the configured telemetry/feedback endpoint; the harness runs
  with `CHUB_TELEMETRY=0` so no network call is made, but the command still records locally
  and prints the success line.
- Do NOT include code, architecture details, or project-specific information in feedback
  text (printed in the command's own guidance).
