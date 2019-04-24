This is prototype of an alternate version of `<mat-checkbox>` built on top of
[MDC Web](https://github.com/material-components/material-components-web). It demonstrates how
Angular Material could use MDC Web under the hood while still exposing the same API Angular users as
the existing `<mat-checkbox>`. This component is experimental and should not be used in production.

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

3. Import the experimental `MatCheckboxModule` and add it to the module that declares your
   component:

   ```ts
   import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';
   
   @NgModule({
     declarations: [MyComponent],
     imports: [MatCheckboxModule],
   })
   export class MyModule {}
   ```
   
4. Add use `<mat-checkbox>` in your component's template, just like you would the normal
   `<mat-checkbox>`:

   ```html
   <mat-checkbox [checked]="isChecked">Check me</mat-checkbox>
   ```
   
5. Add the theme and typography mixins to your Sass. (There is currently no pre-built CSS option for
   the experimental `<mat-checkbox>`):
   
   ```scss
   @import '~@angular/material/theming';
   @import '~@angular/material-experimental/mdc-checkbox';

   $my-primary: mat-palette($mat-indigo);
   $my-accent:  mat-palette($mat-pink, A200, A100, A400);
   $my-theme:   mat-light-theme($my-primary, $my-accent);

   @include mat-checkbox-theme-mdc($my-theme);
   @include mat-checkbox-typography-mdc();
   ```

## API differences
The experimental checkbox API closely matches the
[API of the standard checkbox](https://material.angular.io/components/checkbox/api).
`@angular/material-experimental/mdc-checkbox` exports symbols with the same name and public interface
as all of the symbols found under `@angular/material/checkbox`, except for the following
differences:

* The experimental `MatCheckbox` does not have a public `ripple` property.

## Replacing the standard checkbox in an existing app
Because the experimental API mirrors the API for the standard checkbox, it can easily be swapped in
by just changing the import paths. There is currently no schematic for this, but you can run the
following string replace across your TypeScript files:

```bash
grep -lr --include="*.ts" --exclude-dir="node_modules" \
  --exclude="*.d.ts" "['\"]@angular/material/checkbox['\"]" | xargs sed -i \
  "s/['\"]@angular\/material\/checkbox['\"]/'@angular\/material-experimental\/mdc-checkbox'/g"
```

CSS styles and tests that depend on implementation details of mat-checkbox (such as getting elements
from the template by class name) will need to be manually updated.

There are some small visual differences between this checkbox and the standard mat-checkbox. This
checkbox has more built-in padding around it and is slightly larger.
