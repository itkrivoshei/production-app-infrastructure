# Rollback Demo

The rollback demo is a local, safe workflow for validating image rollback behavior.

It uses an isolated Compose setup and port `8091`, so it does not touch the main local stack.

## What It Demonstrates

The demo verifies that the API service can be redeployed from one git ref to a
different rollback ref and still pass basic runtime checks.

Validation covers:

- rollback demo cleanup before the run;
- previous and current API image builds;
- rejection when refs or resulting images are identical;
- current image deployment;
- rollback target deployment;
- `/health` verification;
- `/version` verification.

## Run

Run from the repository root:

```bash
./scripts/rollback-demo.sh v1.0.0
```

By default, the current image is built from `HEAD` and the previous image from
`origin/main`. Override refs and display versions explicitly when needed:

```bash
CURRENT_REF=HEAD \
PREVIOUS_REF=v1.0.0 \
CURRENT_VERSION=1.1.0 \
PREVIOUS_VERSION=1.0.0 \
./scripts/rollback-demo.sh
```

## Workflow

The script:

1. Removes old rollback demo containers and resources.
2. Resolves and verifies two different git refs.
3. Builds current and previous images from isolated git archives.
4. Deploys the current image.
5. Verifies `/health` and `/version`.
6. Recreates the service with the selected rollback target.
7. Verifies `/health` and `/version` again.

## Manual Verification

After the demo is running, verify the rollback API manually:

```bash
curl -fsS http://localhost:8091/health
curl -fsS http://localhost:8091/version
```

Expected result:

- `/health` returns a successful health response;
- `/version` shows the version metadata for the active rollback demo image.

## Clean Up

Remove rollback demo resources:

```bash
./scripts/rollback-demo.sh --clean
```

This removes only rollback demo Compose resources and does not stop the main development stack.

## Notes

- The rollback demo is local-only.
- Port `8091` is reserved for this isolated rollback workflow.
- The rollback stack always runs in safe mode.
- Use this check before changing image tags, deployment scripts, or release/rollback documentation.
