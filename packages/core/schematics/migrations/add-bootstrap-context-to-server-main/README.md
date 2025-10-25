# Add Bootstrap Context to Server Main Migration

This schematic updates `main.server.ts` files to correctly handle server-side rendering with `bootstrapApplication`.

## How it works

The migration performs the following transformations:

1.  **Identifies `bootstrapApplication` calls:** It specifically targets `main.server.ts` files to find calls to `bootstrapApplication` that are missing a third `context` argument.

2.  **Updates the function signature:** It adds a `(context: BootstrapContext)` parameter to the arrow function that typically wraps the `bootstrapApplication` call in a server entry file.

3.  **Passes the context:** It adds `, context` to the `bootstrapApplication` call, passing the newly added parameter.

4.  **Updates imports:** It ensures that `BootstrapContext` is imported from `@angular/platform-browser`.