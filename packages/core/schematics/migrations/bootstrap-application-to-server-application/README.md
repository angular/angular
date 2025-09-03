# Bootstrap Application to Server Application Migration

This schematic migrates `bootstrapApplication` from `@angular/platform-browser` to `bootstrapServerApplication` from `@angular/platform-server` within `main.server.ts` files.

## How it works

The migration performs the following transformations:

1.  **Identifies `bootstrapApplication` calls:** It specifically targets `main.server.ts` files to find calls to `bootstrapApplication`.

2.  **Handles arrow function wrappers:**
    *   If the `bootstrapApplication` call is a simple arrow function (`() => bootstrapApplication(...)`), it replaces the entire arrow function with a direct call to `bootstrapServerApplication(...)`.
    *   If the arrow function has a more complex body, it only replaces the `bootstrapApplication` function name, preserving the surrounding logic.

3.  **Updates imports:**
    *   It adds an import for `bootstrapServerApplication` from `@angular/platform-server`.
    *   It removes the `bootstrapApplication` import from `@angular/platform-browser`. If `bootstrapApplication` is the only symbol imported from that module, the entire import declaration is removed.
