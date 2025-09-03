# Migration from NgClass to class bindings

This schematic migrates NgClass directive usages to class bindings in your application.
It will only migrate usages that are considered safe to migrate.

Run the schematic using the following command:

```bash
ng generate @angular/core:ngclass-to-class
```


#### Before

```html
<div [ngClass]="{admin: isAdmin, dense: density === 'high'}">
```


#### After

```html
<div [class]="{admin: isAdmin, dense: density === 'high'}">
```

## Configuration options

The migration supports a few options for fine tuning the migration to your specific needs.

### `--migrate-space-separated-key`

By default, the migration avoids migrating usages of `NgClass` in which object literal keys contain space-separated class names.
When the --migrate-space-separated-key flag is enabled, a binding is created for each individual key.


```html
<div [ngClass]="{'class1 class2': condition}"></div>
```

to

```html
<div [class.class1]="condition" [class.class2]="condition"></div>
```