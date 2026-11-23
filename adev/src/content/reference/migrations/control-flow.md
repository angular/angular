# Migration to Control Flow syntax

[Control flow syntax](guide/templates/control-flow) is available from Angular v17. The new syntax is baked into the template, so you don't need to import `CommonModule` anymore.

This schematic migrates all existing code in your application to use new Control Flow Syntax.

Run the schematic using the following command:

```shell
ng generate @angular/core:control-flow
```

## Configuration options

The migration supports a few options for fine tuning the migration to your specific needs.

### `--path`

By default, the migration will update your whole Angular CLI workspace.
You can limit the migration to a specific sub-directory using this option.

### `--format`

By default, the migration reformats the templates it touches.
Disable this option to keep your existing template formatting.

## Breaking changes

### `@for` view reuse

If a property used in the `track` expression of a `@for` block changes but the object reference remains the same (in-place modification), Angular updates the view's bindings (including component inputs) instead of destroying and recreating the element.

This differs from `*ngFor`, which would execute a remount (destroy and recreate) of the element in a similar scenario if the `trackBy` function returned a different value.
