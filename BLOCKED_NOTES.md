# Blocked Notes

## GitHub Pages Online Demo Deployment

- What is blocked: automatic deployment of the static GitHub Pages UI preview at `https://itkrivoshei.github.io/production-app-infrastructure/`.
- Why: the `GitHub Pages Demo` workflow can build the static UI, but `actions/configure-pages` cannot create or enable the Pages site with the repository `GITHUB_TOKEN`. GitHub returned `Resource not accessible by integration`.
- What is already done: the static preview mode, mock data, GitHub Pages workflow, build artifact path, and README/docs links are implemented. The workflow now builds the preview and skips deployment cleanly until Pages is enabled.
- What needs to be done manually: in GitHub repository settings, enable Pages for the repository and set the source to GitHub Actions. If the setting is unavailable, confirm the repository/account allows Pages for this repo.
- How to verify later: rerun the `GitHub Pages Demo` workflow from `main`, confirm the deploy job succeeds, then open `https://itkrivoshei.github.io/production-app-infrastructure/` and verify the static preview banner is visible.
