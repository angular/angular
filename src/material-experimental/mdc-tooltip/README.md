This is prototype of an alternate version of `MatTooltip` built on top of
[MDC Web](https://github.com/material-components/material-components-web). It demonstrates how
Angular Material could use MDC Web under the hood while still exposing the same API Angular users as
the existing `MatTooltip`. This component is experimental and should not be used in production.

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

3. Import the experimental `MatTooltipModule` and add it to the module that declares your
   component:

   ```ts
   import {MatTooltipModule} from '@angular/material-experimental/mdc-tooltip';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatTooltipModule],
   })
   export class MyModule {}
   ```

4. Use `matTooltip` in your component's template, just like you would the normal
   `matTooltip`:

   ```html
   <button matTooltip="Tooltip text">I have a tooltip</button>
   ```

5. Add the theme and typography mixins to your Sass. (There is currently no pre-built CSS option for
   the experimental `matTooltip`):

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

   @include mat-experimental.mdc-tooltip-theme($my-theme);
   @include mat-experimental.mdc-tooltip-typography($my-theme);
   ```

## API differences
There are no API differences between the experimental and standard `matTooltip`.

## Replacing the standard tooltip in an existing app
Because the experimental API mirrors the API for the standard tooltip, it can easily be swapped in
by just changing the import paths. There is currently no schematic for this, but you can run the
following string replace across your TypeScript files:

```bash
grep -lr --include="*.ts" --exclude-dir="node_modules" \
  --exclude="*.d.ts" "['\"]@angular/material/tooltip['\"]" | xargs sed -i \
  "s/['\"]@angular\/material\/tooltip['\"]/'@angular\/material-experimental\/mdc-tooltip'/g"
```

CSS styles and tests that depend on implementation details of `matTooltip` (such as getting
elements from the template by class name) will need to be manually updated.
