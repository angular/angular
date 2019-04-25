This is prototype of an alternate version of `<mat-slide-toggle>` built on top of
[MDC Web](https://github.com/material-components/material-components-web). It demonstrates how
Angular Material could use MDC Web under the hood while still exposing the same API Angular users as
the existing `<mat-slide-toggle>`. This component is experimental and should not be used in production.

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

3. Import the experimental `MatSlideToggleModule` and add it to the module that declares your
   component:

   ```ts
   import {MatSlideToggleModule} from '@angular/material-experimental/mdc-slide-toggle';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatSlideToggleModule],
   })
   export class MyModule {}
   ```

4. Add use `<mat-slide-toggle>` in your component's template, just like you would the normal
   `<mat-slide-toggle>`:

   ```html
   <mat-slide-toggle [checked]="isChecked">Toggle me</mat-slide-toggle>
   ```

5. Add the theme and typography mixins to your Sass. (There is currently no pre-built CSS option for
   the experimental `<mat-slide-toggle>`):

   ```scss
   @import '~@angular/material/theming';
   @import '~@angular/material-experimental/mdc-slide-toggle';

   $my-primary: mat-palette($mat-indigo);
   $my-accent:  mat-palette($mat-pink, A200, A100, A400);
   $my-theme:   mat-light-theme($my-primary, $my-accent);

   @include mat-slide-toggle-theme-mdc($my-theme);
   @include mat-slide-toggle-typography-mdc();
   ```

## API differences
The experimental slide toggle API closely matches the
[API of the standard slide toggle](https://material.angular.io/components/slide-toggle/api).
`@angular/material-experimental/mdc-slide-toggle` exports symbols with the same name and public
interface as all of the symbols found under `@angular/material/slide-toggle`, except for the
following differences:

* The MDC-based `mat-slide-toggle` drops the dependency on Hammer.js and as a result doesn't support
dragging gestures.
* As a result of dragging gestures not being supported, the `dragChange` event won't emit.

## Replacing the standard slide toggle in an existing app
Because the experimental API mirrors the API for the standard slide toggle, it can easily be swapped
in by just changing the import paths. There is currently no schematic for this, but you can run the
following string replace across your TypeScript files:

```bash
grep -lr --include="*.ts" --exclude-dir="node_modules" \
  --exclude="*.d.ts" "['\"]@angular/material/slide-toggle['\"]" | xargs sed -i \
  "s/['\"]@angular\/material\/slide-toggle['\"]/'@angular\/material-experimental\/mdc-slide-toggle'/g"
```

CSS styles and tests that depend on implementation details of mat-slide-toggle (such as getting
elements from the template by class name) will need to be manually updated.

There are some small visual differences between this slide and the standard mat-slide. This
slide has a slightly larger ripple and different spacing between the label and the toggle.
