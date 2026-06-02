# Rollback Demo

The rollback demo is local and safe. It uses a dedicated Compose file and port `8091`.

## Run

```bash
./scripts/rollback-demo.sh v1.0.0
```

The script:

1. Cleans old rollback demo containers.
2. Builds `devops-control-center-api:rollback-previous`.
3. Builds `devops-control-center-api:rollback-current`.
4. Deploys the current image and verifies `/health` and `/version`.
5. Recreates the service with the selected rollback target and verifies `/health` and `/version`.

If no version is provided, the script defaults to `1.0.0` as the rollback target.

## Clean

```bash
./scripts/rollback-demo.sh --clean
```

This removes only the rollback demo Compose resources.

## Manual Verification

```bash
curl -fsS http://localhost:8091/health
curl -fsS http://localhost:8091/version
```
