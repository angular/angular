This is prototype of an alternate version of `<mat-select>` built on top of
[MDC Web](https://github.com/material-components/material-components-web). It demonstrates how
Angular Material could use MDC Web under the hood while still exposing the same API Angular users as
the existing `<mat-select>`. This component is experimental and should not be used in production.

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

3. Import the experimental `MatSelectModule` and add it to the module that declares your
   component:

   ```ts
   import {MatSelectModule} from '@angular/material-experimental/mdc-select';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatSelectModule],
   })
   export class MyModule {}
   ```

4. Add use `<mat-select>` in your component's template, just like you would the normal
   `<mat-select>`:

   ```html
    <mat-form-field>
      <mat-label>Pick a drink</mat-label>

      <mat-select>
        <mat-option>Water</mat-option>
        <mat-option>Soda</mat-option>
        <mat-option>Coffee</mat-option>
      </mat-select>
    </mat-form-field>
   ```

5. Add the theme and typography mixins to your Sass. (There is currently no pre-built CSS option for
   the experimental `<mat-select>`):

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

   @include mat-experimental.mdc-select-theme($my-theme);
   @include mat-experimental.mdc-select-typography($my-theme);
   ```

## API differences
The experimental select API closely matches the
[API of the standard select](https://material.angular.io/components/select/api).
`@angular/material-experimental/mdc-select` exports symbols with the same name and public interface
as all of the symbols found under `@angular/material/select`, except for the following
differences:

* The experimental `MatSelect` doesn't implement the logic from the standard select where it
tries to align the selected option on top of the trigger text. Instead, the panel is positioned
either above or below the trigger, depending on how much space is available. As a result, the
`disableOptionCentering` input is essentially a no-op which will be deprecated eventually.

## Replacing the standard select in an existing app
Because the experimental API mirrors the API for the standard select, it can easily be swapped in
by just changing the import paths. There is currently no schematic for this, but you can run the
following string replace across your TypeScript files:

```bash
grep -lr --include="*.ts" --exclude-dir="node_modules" \
  --exclude="*.d.ts" "['\"]@angular/material/select['\"]" | xargs sed -i \
  "s/['\"]@angular\/material\/select['\"]/'@angular\/material-experimental\/mdc-select'/g"
```

CSS styles and tests that depend on implementation details of `mat-select` (such as getting elements
from the template by class name) will need to be manually updated.

There are some small visual differences between this select and the standard `mat-select`. This
select matches the Material Design spec closer which makes it slightly taller. Furthermore, the
experimental `mat-select` allows the text inside of `mat-option` to wrap to multiple lines, whereas
previously it was limited to one line.
