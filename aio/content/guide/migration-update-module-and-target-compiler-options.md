# Update module and target compiler options migration

## What does this migration do?

This migration will adjust the [`target`](https://www.typescriptlang.org/v2/en/tsconfig#target) and [`module`](https://www.typescriptlang.org/v2/en/tsconfig#module) settings within the [TypeScript configuration files](guide/typescript-configuration) for the workspace.
The changes to each option vary based on the builder/command that uses the TypeScript configuration file.
Unless otherwise noted, changes are only made if the existing value was not changed from the value previously used by a new project.
This ensures that intentional changes to the options are kept in place.

TypeScript Configuration File(s) | Changed Property | Existing Value | New Value
------------- | ------------- | ------------- | ------------- | -------------
Workspace base [`tsconfig.base.json`] | `"module"` | `"esnext"` | `"es2020"`
Used in `browser` builder options (`ng build` for applications) | `"module"` | `"esnext"` | `"es2020"`
Used in `ng-packgr` builder options (`ng build` for libraries) | `"module"` | `"esnext"` | `"es2020"`
Used in `karma` builder options (`ng test` for applications) | `"module"` | `"esnext"` | `"es2020"`
Used in `server` builder options (universal) | `"module"` | `"commonjs"` | _removed_
&nbsp; | `"target"` | _any_ | `"es2016"`
Used in `protractor` builder options (`ng e2e` for applications) | `"target"` | `"es5"` | `"es2018"`

## Why is this migration necessary?

This provides improvements to supportability and the long-term sustainment of projects.

For the functionality that executes on Node.js, such as universal and protractor, the new settings
provide performance and debug/troubleshooting benefits as well.
The minimum Node.js version for the Angular CLI (v10.13) supports features present up to ES2018.
By targetting later ES versions, less code is transformed which allows newer features to be used directly.
Since zone.js does not support native async/await, the universal builds must still target ES2016.

## Why `"es2020"` instead of `"esnext"`?

In TypeScript 3.9 the behavior of the TypeScript compiler controlled by `module` is the same with both `"esnext"` and `"es2020"` values.
This can however change in the future where the `"esnext"` option could evolve in a backwards incompatible ways resulting in build-time or run-time errors during TypeScript update.
This could result in undesirable instability which can be avoided by using the `"es2020"` option whose behavior is not going to change any more.
