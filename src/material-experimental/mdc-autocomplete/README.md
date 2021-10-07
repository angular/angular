This is prototype of an alternate version of `<mat-autocomplete>` built on top of
[MDC Web](https://github.com/material-components/material-components-web). It demonstrates how
Angular Material could use MDC Web under the hood while still exposing the same API Angular users as
the existing `<mat-autocomplete>`. This component is experimental and should not be used in production.

## How to use
Assuming your application is already up and running using Angular Material, you can add this
component by following these steps:

1. Install Angular Material Experimental & MDC WEB:

   ```bash
   npm i material-components-web @angular/material-experimental
   ```

2. In your `angular.json`, make sure `node_modules/` is listed as a Sass include path. This is
   needed for the Sass compiler to be able to find the MDC Web Sass files.

   ```json
   ...
   "styles": [
     "src/styles.scss"
   ],
   "stylePreprocessorOptions": {
     "includePaths": [
       "node_modules/"
     ]
   },
   ...
   ```

3. Import the experimental `MatAutocompleteModule` and add it to the module that declares your
   component:

   ```ts
   import {MatAutocompleteModule} from '@angular/material-experimental/mdc-autocomplete';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatAutocompleteModule],
   })
   export class MyModule {}
   ```

4. Add use `<mat-autocomplete>` in your component's template, just like you would the normal
   `<mat-autocomplete>`:

   ```html
    <input [matAutocomplete]="autocomplete">
    <mat-autocomplete #autocomplete="matAutocomplete">
      <mat-option value="1">Option 1</mat-option>
      <mat-option value="2">Option 2</mat-option>
    </mat-autocomplete>
   ```

5. Add the theme and typography mixins to your Sass. (There is currently no pre-built CSS option for
   the experimental `<mat-autocomplete>`):

   ```scss
   @use '@angular/material' as mat;
   @use '@angular/material-experimental' as mat-experimental;

   $my-primary: mat.define-palette(mat.$indigo-palette);
   $my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
   $my-theme: mat.define-light-theme((
     color: (
       primary: $my-primary,
       accent: $my-accent
     )
   ));

   @include mat-experimental.mdc-autocomplete-theme($my-theme);
   @include mat-experimental.mdc-autocomplete-typography($my-theme);
   ```

## API differences
The experimental autocomplete API closely matches the
[API of the standard autocomplete](https://material.angular.io/components/autocomplete/api).
`@angular/material-experimental/mdc-autocomplete` exports symbols with the same name and public
interface as all of the symbols found under `@angular/material/autocomplete`

## Replacing the standard autocomplete in an existing app
Because the experimental API mirrors the API for the standard autocomplete, it can easily be swapped
in by just changing the import paths. There is currently no schematic for this, but you can run the
following string replace across your TypeScript files:

```bash
grep -lr --include="*.ts" --exclude-dir="node_modules" \
  --exclude="*.d.ts" "['\"]@angular/material/autocomplete['\"]" | xargs sed -i \
  "s/['\"]@angular\/material\/autocomplete['\"]/'@angular\/material-experimental\/mdc-autocomplete'/g"
```

CSS styles and tests that depend on implementation details of `mat-autocomplete` (such as getting
elements from the template by class name) will need to be manually updated.

There are some small visual differences between this autocomplete and the standard one. This
autocomplete has a different font size and elevation `box-shadow`, as well as padding at the top
and bottom of the list.
