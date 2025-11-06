# Release Guide

To release, use the command: `pnpm --filter=ng-template run release`.
The release will be done from the current branch unless the `BRANCH_TO_RELEASE` environment variable is set (e.g., `BRANCH_TO_RELEASE=21.0.x`).

## Post release

After the release update release notes in GitHub

1. Go to the Releases section.
2. Click "Draft new release".
3. Copy the text added to the `CHANGELOG.md`.
4. Upload the `.vsix` file.
5. Click "Publish Release".
