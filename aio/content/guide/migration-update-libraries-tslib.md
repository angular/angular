# tslib Direct Dependency Migration

## What does this migration do?

If you have any libraries within your workspace, this migration will convert `tslib` peer dependencies to direct dependencies for the libraries.
TypeScript uses the `tslib` package to provide common helper functions used in compiled TypeScript code.
The `tslib` version is also updated to `2.0.0` to support TypeScript 3.9.

Before:
```json
{
  "name": "my-lib",
  "version": "0.0.1",
  "peerDependencies": {
    "@angular/common": "^9.0.0",
    "@angular/core": "^9.0.0",
    "tslib": "^1.12.0"
  }
}
```

After:
```json
{
  "name": "my-lib",
  "version": "0.0.1",
  "peerDependencies": {
    "@angular/common": "^9.0.0",
    "@angular/core": "^9.0.0"
  },
  "dependencies": {
    "tslib": "^2.0.0"
  }
}
```

## Why is this migration necessary?

The `tslib` version is bound to the TypeScript version used to compile a library.
Peer dependencies do not accurately represent this relationship.
A peer dependency can be altered by the installed project and can lead to misalignment of the versions.  This can result in potential runtime errors within the application.

All projects that use Angular v10 will be compiled with TypeScript 3.9.
This version requires a minimum `tslib` version of 2.0.  However, newer versions of TypeScript may require different versions of `tslib` that may be incompatible with 2.0.
If `tslib` remained as a peer dependency, some workspaces or projects could get into a state where there would be no way to satisfy `tslib` peer dependency for multiple libraries, resulting in build-time or run-time errors.

## Do I still need `tslib` as a dependency in my workspace `package.json`?

Yes.
The workspace-level `tslib` package is used to build applications within the workspace, as well as run unit tests for workspace libraries.
