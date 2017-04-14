## What is compatibility mode?
Compatibility mode for `@angular/material` allows the components to exist side-by-side with AngularJS Material components without any CSS collisions.

## What does compatibility mode do?
When enabled, compatibility mode enforces that all template APIs use the prefix `mat-` instead of `md-`. This will prevent any CSS from AngularJS Material from affecting the components in `@angular/material`.

## How is compatibility mode enabled?
Import `NoConflictStyleCompatibilityMode` into your application's root `NgModule`.


## Example

```html
<!-- Regular mode -->
<button md-button mdTooltip="With a tooltip">Regular button</button>

<!-- In compatibility mode -->
<button mat-button matTooltip="With a compatibility mode tooltip">Compatibility Mode button</button>
```
