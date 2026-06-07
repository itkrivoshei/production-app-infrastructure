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
./scripts/rollback-demo.sh
```

By default, the current image is built from `HEAD`. The previous image uses
`origin/main` when it resolves to a different commit; on a synchronized
`main`, the script safely falls back to the first parent of `HEAD`. Override
the rollback ref with the positional argument:

```bash
./scripts/rollback-demo.sh HEAD^
```

The `/version` values are derived from the actual source commits with
`git describe --tags --always`. Display versions can still be overridden
explicitly when demonstrating release metadata:

```bash
CURRENT_VERSION=current \
PREVIOUS_VERSION=previous \
./scripts/rollback-demo.sh HEAD^
```

Verify ref selection without building images or changing containers:

```bash
./scripts/rollback-demo.sh --dry-run
PREVIOUS_REF=HEAD^ ./scripts/rollback-demo.sh --dry-run
```

## Workflow

The script:

1. Resolves and verifies two different git refs.
2. Removes old rollback demo containers and resources.
3. Builds current and previous images from isolated git archives.
4. Deletes temporary build archives even when the build fails.
5. Deploys the current image.
6. Verifies `/health` and `/version`.
7. Recreates the service with the selected rollback target.
8. Verifies `/health` and `/version` again.

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
