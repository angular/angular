# ngStyle to style migration

This schematic helps developers to convert ngStyle directive usages to style bindings where possible.

## How to run this migration?

The migration can be run using the following command:

```bash
ng generate @angular/core:ngstyle-to-style
```

By default, the migration will go over the entire application. If you want to apply this migration to a subset of the files, you can pass the path argument as shown below:

```bash
ng generate @angular/core:ngstyle-to-style --path src/app/sub-component
```

### How does it work?

The schematic will attempt to find all the places in the templates where the directive is used and check if it can be converted to [style].

An object with a single key becomes a binding to that one style property:

```html
<!-- Before -->
<div [ngStyle]="{'background-color': 'red'}"></div>

<!-- After -->
<div [style.background-color]="'red'"></div>
```

An object with more than one key becomes a single `[style]` binding:

```html
<!-- Before -->
<div [ngStyle]="{'color': 'blue', 'font-weight': 'bold'}"></div>

<!-- After -->
<div [style]="{'color': 'blue', 'font-weight': 'bold'}"></div>
```
