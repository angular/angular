# Building and Testing Angular

[Full source](https://github.com/angular/angular/blob/main/contributing-docs/building-and-testing-angular.md)

## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org) (version specified in `.nvmrc`)
- [pnpm](https://pnpm.io/) (version specified in `package.json` engines field)
- On Windows: [MSYS2](https://www.msys2.org/) for Bazel, or consider using [WSL](https://learn.microsoft.com/en-us/windows/wsl/install)

## Development in a Container

You can use the provided [Dev Container](https://containers.dev/) configuration:

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop), [VS Code](https://code.visualstudio.com/), and the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).
2. Open the repo in VS Code and run **Dev Containers: Reopen in Container** from the Command Palette.

## Getting the Sources

```shell
git clone git@github.com:<github-username>/angular.git
cd angular
git remote add upstream https://github.com/angular/angular.git
```

## Installing Dependencies

```shell
pnpm install
```

## Building

```shell
pnpm build
```

Results go in `dist/packages-dist`.

## Running Tests

Bazel is the primary build and test tool. Run all package tests before submitting a PR:

```shell
pnpm test //packages/...
```

For package-specific tests, refer to Bazel targets in each package's `BUILD.bazel`.

### Testing Against a Local Project

```shell
pnpm ng-dev misc build-and-link <path-to-local-project-root>
```

Disable CLI cache when testing local changes:

```shell
ng cache disable
```

When invoking the Angular CLI locally, use the `--preserve-symlinks` flag:

```shell
node --preserve-symlinks --preserve-symlinks-main node_modules/@angular/cli/lib/init.js serve
```

PRs can only be merged if code is properly formatted and all tests pass. CI will run affected tests even if you forget to run them locally.

## Formatting Source Code

Angular uses [prettier](https://prettier.io). CI will fail if code is not properly formatted.

```shell
pnpm ng-dev format changed [shaOrRef]   # format files changed since sha/ref (default: main)
pnpm ng-dev format all                  # format all source code
pnpm ng-dev format files <files..>      # format specific files
```

## Linting

```shell
pnpm lint
```

## IDE Support (Bazel)

- **VS Code**: Install the [Bazel extension](https://marketplace.visualstudio.com/items?itemName=BazelBuild.vscode-bazel)
- **WebStorm/IntelliJ**: Install the [Bazel plugin](https://plugins.jetbrains.com/plugin/8609-bazel)
