This is prototype of an alternate version of `<mat-progress-bar>` built on top of
[MDC Web](https://github.com/material-components/material-components-web). It demonstrates how
Angular Material could use MDC Web under the hood while still exposing the same API Angular users as
the existing `<mat-progress-bar>`. This component is experimental and should not be used in
production.

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

3. Import the experimental `MatProgressBarModule` and add it to the module that declares your
   component:

   ```ts
   import {MatProgressBarModule} from '@angular/material-experimental/mdc-progress-bar';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatProgressBarModule],
   })
   export class MyModule {}
   ```

4. Add use `<mat-progress-bar>` in your component's template, just like you would the normal
   `<mat-progress-bar>`:

   ```html
   <mat-progress-bar [value]="42"></mat-progress-bar>
   ```

5. Add the theme and typography mixins to your Sass. (There is currently no pre-built CSS option for
   the experimental `<mat-progress-bar>`):

   ```scss
   @import '~@angular/material/theming';
   @import '~@angular/material-experimental/mdc-progress-bar';

   $my-primary: mat-palette($mat-indigo);
   $my-accent:  mat-palette($mat-pink, A200, A100, A400);
   $my-theme:   mat-light-theme($my-primary, $my-accent);

   @include mat-progress-bar-theme-mdc($my-theme);
   @include mat-progress-bar-typography-mdc();
   ```

## Replacing the standard progress bar in an existing app
Because the experimental API mirrors the API for the standard progress bar, it can easily be swapped
in by just changing the import paths. There is currently no schematic for this, but you can run the
following string replace across your TypeScript files:

```bash
grep -lr --include="*.ts" --exclude-dir="node_modules" \
  --exclude="*.d.ts" "['\"]@angular/material/progress-bar['\"]" | xargs sed -i \
  "s/['\"]@angular\/material\/progress-bar['\"]/'@angular\/material-experimental\/mdc-progress-bar'/g"
```

CSS styles and tests that depend on implementation details of mat-progress-bar (such as getting
elements from the template by class name) will need to be manually updated.

There are some small visual differences between this progress and the standard `mat-progress-bar`.
This progress bar has slightly different animation timings and easing curves.
