# Monorepo setup

This repository is a monorepo. All build outputs are created in the `bazel-bin` directory.

The `dependencies` in root [`package.json`](package.json) must include all production dependencies
of the client **and** and the server.

The dependencies of the `server` need to be duplicated in the root [`package.json`](package.json).
Therefore, if a new prod dependency is added to the server, it needs to be
added to both [`package.json`](package.json) and [`server/package.json`](server/package.json).

## Building the extension .vsix

If you'd like build the extension .vsix, run

```shell
pnpm --filter=ng-template run package`
```

The built vsix can be found in `./dist/bin/vscode-ng-language-service/ng-template.vsix`

## Test Local Changes in VSCode

Any changes made to the code in this repository tested out in a
development version of VSCode. The instructions below explain how to bring up
a local instance and then install a local version of `@angular/language-service`.

### Launch VSCode in Extension Development Host

The scripts in `.vscode` directory are setup to automatically compile the code,
then launch a new instance of VSCode with the Angular extension installed.
To do so, either

1. Press F5, or
2. Go to Run on the sidebar, select `VSCE: Launch Dev Client` from the task list

After the client is launched, you can optionally choose to attach a debugger to
the local instance. To do so,

1. Go to Run on the sidebar, select `VSCE: Attach to Server` from the task list

As a shortcut, there's also a task setup to automatically launch the client and
attach the debugger in a single step. To do so,

1. Go to Run on the sidebar, select `VSCE: Dev Client + Attach to Server` from the task list
