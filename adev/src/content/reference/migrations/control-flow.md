# Migration to Control Flow syntax

[Control flow syntax](guide/templates/control-flow) is available from Angular v17. The new syntax is baked into the template, so you don't need to import `CommonModule` anymore.

This schematic migrates all existing code in your application to use new Control Flow Syntax.

Run the schematic using the following command:

```shell
ng generate @angular/core:control-flow
```

## Breaking changes

### `@for` view reuse

Using `@for` block if a property used in the `track` expression changes but the object reference remains the same (in-place modification), Angular updates the view's bindings (including component inputs) instead of destroying and recreating the element.

This differs from `*ngFor`, which would execute a remount (destroy and recreate) of the element in a similar scenario if the `trackBy` function returned a different value.
