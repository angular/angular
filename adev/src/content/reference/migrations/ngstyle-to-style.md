# Migration from NgStyle to style bindings

This schematic migrates NgStyle directive usages to style bindings in your application.
It will only migrate usages that are considered safe to migrate.

Run the schematic using the following command:

```bash
ng generate @angular/core:ngstyle-to-style
```


#### Before

```html
<div [ngStyle]="{'background-color': 'red'}">
```


#### After

```html
<div [style]="{'background-color': 'red'}">
```

## Configuration options

The migration supports a few options for fine tuning the migration to your specific needs.

### `--best-effort-mode`

By default, the migration avoids migrating object references usages of `NgStyle`
When the `--best-effort-mode` flag is enabled, `ngStyle` instances binded to object references are also migrated. 
This can be unsafe to migrate, for example if the binded object is mutated.


```html
<div [ngStyle]="styleObject"></div>
```

to

```html
<div [style]="styleObject"></div>
```