# Update Module and Target Compiler Options Migration

## What does this migration do?

This migration will adjust the `target` and `module` within the `tsconfig` files for the workspace.
The changes to each option vary based on the builder/command that uses the tsconfig.
Unless otherwise noted, changes are only made if the existing value matches an expected value.

For the browser builder (`ng build` for applications), `module` is changed to `es2020` from `esnext`.

For the ng-packgr builder (`ng build` for libraries), `module` is changed to `es2020` from `esnext`.

For the karma builder (`ng test` for applications), `module` is changed to `es2020` from `esnext`.

For the server builder (universal builds), `module` is removed if originally `commonjs`.
`target` is also changed to `es2016` regardless of the previous value.

For the protractor builder (`ng e2e` for applications), `target` is changed to `es2018` from `es5`.

## Why is this migration necessary?

These changes synchronize the values of these options with new projects.
This provides improvements to supportability and the long-term sustainment of projects.

For the functionality that executes on Node.js, such as universal and protractor, the new settings
provide performance and debug/troubleshooting benefits as well.
The minimum Node.js version for the Angular CLI (v10.13), supports features present up to ES2018.
By targetting later ES versions, less code is transformed which allows newer features to be used directly.
Since zone.js does not support native async/await, the universal builds must still target ES2016.

## Can `esnext` still be used instead of `es2020`?

Both `esnext` and `es2020` values provide support for dynamic imports which are used for lazy routing.
However, `es2020` has a fixed set of included features and behavior.
By instead using `esnext`, updates to the TypeScript compiler could cause changes in behavior or include
unsupported features during compilation.  This could result in either build-time or run-time errors.
