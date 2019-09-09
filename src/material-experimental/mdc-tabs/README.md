This is prototype of an alternate version of the Angular Material tabs built on top of
[MDC Web](https://github.com/material-components/material-components-web). It demonstrates how
Angular Material could use MDC Web under the hood while still exposing the same API Angular users as
the existing `<mat-tab-group>`. This component is experimental and should not be used in production.

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

3. Import the experimental `MatTabsModule` and add it to the module that declares your
   component:

   ```ts
   import {MatTabsModule} from '@angular/material-experimental/mdc-tabs';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatTabsModule],
   })
   export class MyModule {}
   ```

4. Use `<mat-tab-group>` in your component's template, just like you would the normal
   `<mat-tab-group>`:

   ```html
    <mat-tab-group>
      <mat-tab label="First">Content 1</mat-tab>
      <mat-tab label="Second">Content 2</mat-tab>
      <mat-tab label="Third">Content 3</mat-tab>
    </mat-tab-group>
   ```

5. Add the theme and typography mixins to your Sass. (There is currently no pre-built CSS option for
   the experimental tabs):

   ```scss
   @import '~@angular/material/theming';
   @import '~@angular/material-experimental/mdc-tabs';

   $my-primary: mat-palette($mat-indigo);
   $my-accent:  mat-palette($mat-pink, A200, A100, A400);
   $my-theme:   mat-light-theme($my-primary, $my-accent);

   @include mat-tabs-theme-mdc($my-theme);
   @include mat-tabs-typography-mdc();
   ```

## API differences
The experimental tabs API closely matches the
[API of the standard tabs](https://material.angular.io/components/tabs/api).
`@angular/material-experimental/mdc-tabs` exports symbols with the same name and public interface
as all of the symbols found under `@angular/material/tabs`, except for the following
differences:

* `MatTabLink` is defined as a `Component` in the experimental package,
  whereas in the current one it's a `Directive`.

## Replacing the standard tabs in an existing app
Because the experimental API mirrors the API for the standard tabs, it can easily be swapped in
by just changing the import paths. There is currently no schematic for this, but you can run the
following string replace across your TypeScript files:

```bash
grep -lr --include="*.ts" --exclude-dir="node_modules" \
  --exclude="*.d.ts" "['\"]@angular/material/tabs['\"]" | xargs sed -i \
  "s/['\"]@angular\/material\/tabs['\"]/'@angular\/material-experimental\/mdc-tabs'/g"
```

CSS styles and tests that depend on implementation details of the tabs (such as getting elements
from the template by class name) will need to be manually updated.

