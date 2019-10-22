# Migration to `ngcc` npm `postinstall` script

## What does this schematic do?

This schematic adds an [Angular compatibility compiler](guide/ngcc), or `ngcc`, invocation to npm/yarn's `postinstall` script in the `package.json` of an Angular CLI workspace.
This script is invoked after each execution of `npm install` and modifies `node_modules` by converting any found Angular libraries to a format that is compatible with Angular version 9.

An example diff might look like the following:

**Before:**

```json
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e"
  },
```

**After:**

```json
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e",
    "postinstall": "ngcc --properties es2015 browser module main --first-only --create-ivy-entry-points"
  },
```

If the `package.json` already contains a `postinstall` script, then the `ngcc` invocation will be prepended to the current command:

**Before:**
```json
  "scripts": {
    ...
    "postinstall": "some-command"
  },
```

**After:**
```json
  "scripts": {
    ...
    "postinstall": "ngcc --properties es2015 browser module main --first-only --create-ivy-entry-points && some-command"
  },
```


## Why is this migration necessary?

This migration is a build performance optimization that enables `ngcc` to parallelize the compilation of npm libraries.
An application build performed via CLI's `ng build` should succeed regardless of this `postinstall` script being installed, because the CLI has `ngcc` built-in.
However, this built-in `ngcc` can't parallelize the compilation of multiple libraries, and therefore often takes considerably longer to run.


## Can I customize the `ngcc` options in the `postinstall` script?

By default the `postinstall` script invokes `ngcc` with options to compile only the most commonly needed library formats.
For some projects, especially those that depend on the CommonJS distribution of Angular (for example, Angular Universal apps), it might be beneficial to modify the `postinstall` script to also compile the CommonJS distribution of the library:

```json
  "scripts": {
    ...
    "postinstall": "ngcc --properties es2015 browser module main --first-only --create-ivy-entry-points && ngcc --properties main --create-ivy-entry-points"
  },
```

For the full set of options run `npx ngcc --help` or `yarn ngcc --help`.

## Will libraries compiled with `ngcc` still be compatible with Angular version 8?

Yes, the migration causes `ngcc` to be invoked with the `--create-ivy-entry-points` flag, which ensures that the `ngcc` compilation is non-destructive, so the same `node_modules` can be used with Angular version 8 and version 9.
