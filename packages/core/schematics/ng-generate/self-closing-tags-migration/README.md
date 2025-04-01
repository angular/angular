# Self-closing tags migration
This schematic helps developers to convert component selectors in the templates to self-closing tags.
This is a purely aesthetic change and does not affect the behavior of the application.

## How to run this migration?
The migration can be run using the following command:

```bash
ng generate @angular/core:self-closing-tag
```

By default, the migration will go over the entire application. If you want to apply this migration to a subset of the files, you can pass the path argument as shown below:

```bash
ng generate @angular/core:self-closing-tag --path src/app/sub-component
```

### How does it work?
The schematic will attempt to find all the places in the templates where the component selectors are used. And check if they can be converted to self-closing tags.

Example:

```html
<!-- Before -->
<app-home hello="world"></app-home>

<!-- After -->
<app-home hello="world" /> 
```

