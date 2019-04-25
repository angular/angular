This is prototype of an alternate version of `<mat-menu>` built on top of
[MDC Web](https://github.com/material-components/material-components-web). It demonstrates how
Angular Material could use MDC Web under the hood while still exposing the same API Angular users as
the existing `<mat-menu>`. This component is experimental and should not be used in production.

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

3. Import the experimental `MatMenuModule` and add it to the module that declares your
   component:

   ```ts
   import {MatMenuModule} from '@angular/material-experimental/mdc-menu';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatMenuModule],
   })
   export class MyModule {}
   ```

4. Add use `<mat-menu>` in your component's template, just like you would the normal
   `<mat-menu>`:

   ```html
    <button [matMenuTriggerFor]="menu">Menu</button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item>Item 1</button>
      <button mat-menu-item>Item 2</button>
    </mat-menu>
   ```

5. Add the theme and typography mixins to your Sass. (There is currently no pre-built CSS option for
   the experimental `<mat-menu>`):

   ```scss
   @import '~@angular/material/theming';
   @import '~@angular/material-experimental/mdc-menu';

   $my-primary: mat-palette($mat-indigo);
   $my-accent:  mat-palette($mat-pink, A200, A100, A400);
   $my-theme:   mat-light-theme($my-primary, $my-accent);

   @include mat-menu-theme-mdc($my-theme);
   @include mat-menu-typography-mdc();
   ```

## API differences
The experimental menu API closely matches the
[API of the standard menu](https://material.angular.io/components/menu/api).
`@angular/material-experimental/mdc-menu` exports symbols with the same name and public interface
as all of the symbols found under `@angular/material/menu`, except for the following
differences:

* The experimental `MatMenu` does not support increasing the elevation of a sub-menu, based on its depth.

## Replacing the standard menu in an existing app
Because the experimental API mirrors the API for the standard menu, it can easily be swapped in
by just changing the import paths. There is currently no schematic for this, but you can run the
following string replace across your TypeScript files:

```bash
grep -lr --include="*.ts" --exclude-dir="node_modules" \
  --exclude="*.d.ts" "['\"]@angular/material/menu['\"]" | xargs sed -i \
  "s/['\"]@angular\/material\/menu['\"]/'@angular\/material-experimental\/mdc-menu'/g"
```

CSS styles and tests that depend on implementation details of mat-menu (such as getting elements
from the template by class name) will need to be manually updated.

There are some small visual differences between this menu and the standard mat-menu. This
menu has a different font size and elevation `box-shadow`.
