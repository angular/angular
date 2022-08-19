This is prototype of an alternate version of `<mat-progress-spinner>` built on top of
[MDC Web](https://github.com/material-components/material-components-web). It demonstrates how
Angular Material could use MDC Web under the hood while still exposing the same API Angular users as
the existing `<mat-progress-spinner>`. This component is experimental and should not be used in
production.

## How to use
Assuming your application is already up and running using Angular Material, you can add this
component by following these steps:

1. Install Angular Material Experimental & MDC WEB:

   ```bash
   npm i material-components-web @angular/material
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

3. Import the experimental `MatProgressSpinnerModule` and add it to the module that declares your
   component:

   ```ts
   import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatProgressSpinnerModule],
   })
   export class MyModule {}
   ```

4. Add use `<mat-progress-spinner>` in your component's template, just like you would the normal
   `<mat-progress-spinner>`:

   ```html
   <mat-progress-spinner [value]="42"></mat-progress-spinner>
   ```

5. Add the theme and typography mixins to your Sass. (There is currently no pre-built CSS option for
   the experimental `<mat-progress-spinner>`):

   ```scss
   @use '@angular/material' as mat;

   $my-primary: mat.define-palette(mat.$indigo-palette);
   $my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
   $my-theme: mat.define-light-theme((
     color: (
       primary: $my-primary,
       accent: $my-accent
     )
   ));

   @include mat.progress-spinner-theme($my-theme);
   @include mat.progress-spinner-typography($my-theme);
   ```

## Replacing the standard progress spinner in an existing app
Because the experimental API mirrors the API for the standard progress spinner, it can easily be swapped
in by just changing the import paths. There is currently no schematic for this, but you can run the
following string replace across your TypeScript files:

```bash
grep -lr --include="*.ts" --exclude-dir="node_modules" \
  --exclude="*.d.ts" "['\"]@angular/material/legacy-progress-spinner['\"]" | xargs sed -i \
  "s/['\"]@angular\/material\/legacy-progress-spinner['\"]/'@angular\/material\/progress-spinner'/g"
```

CSS styles and tests that depend on implementation details of mat-progress-spinner (such as getting
elements from the template by class name) will need to be manually updated.

There are some small visual differences between this progress and the standard `mat-progress-spinner`.
This progress spinner has slightly different animation timings and easing curves.
