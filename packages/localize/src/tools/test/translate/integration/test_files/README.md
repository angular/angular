# Integration test files

The files in this folder are used as input files to do integration testing of the compile time inliner.

## Generating the source files

The `.ts` files are the starting point, and the `.js` and `.js.map` files are generated from those.
The `tsconfig.json` is setup for this purpose.

To regenerate the `.js` and `.js.map` files, invoke the typescript compiler in this folder:

```
tsc -p tsconfig.json
```

## Additional assets

The `.txt` files represent static assets that the inliner will just copy into the new translation folders.
