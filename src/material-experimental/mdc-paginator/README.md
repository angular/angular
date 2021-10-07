This is prototype of an alternate version of `<mat-paginator>` built on top of
[MDC Web](https://github.com/material-components/material-components-web). It demonstrates how
Angular Material could use MDC Web under the hood while still exposing the same API Angular users as
the existing `<mat-paginator>`. This component is experimental and should not be used in production.

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

3. Import the experimental `MatPaginatorModule` and add it to the module that declares your
   component:

   ```ts
   import {MatPaginatorModule} from '@angular/material-experimental/mdc-paginator';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatPaginatorModule],
   })
   export class MyModule {}
   ```

4. Use `<mat-paginator>` in your component's template, just like you would the normal
   `<mat-paginator>`:

   ```html
   <mat-paginator></mat-paginator>
   ```

5. Add the theme and typography mixins to your Sass. (There is currently no pre-built CSS option for
   the experimental `<mat-paginator>`):

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

   @include mat-experimental.mdc-paginator-theme($my-theme);
   @include mat-experimental.mdc-paginator-typography($my-theme);
   ```

## API differences
The experimental paginator API closely matches the
[API of the standard paginator](https://material.angular.io/components/paginator/api).
`@angular/material-experimental/mdc-paginator` exports symbols with the same name and public
interface as all of the symbols found under `@angular/material/paginator`, except for the following
differences:

* The experimental paginator module has a `MatPaginatorDefaultOptions` interface that is identical
to the one from `@angular/material/paginator`, with the exception of the `formFieldAppearance`
property whose type is narrower. It allows only the `fill` and `outline` appearances, because these
are the appearances supported by the MDC-based `MatFormField`.

## Replacing the standard paginator in an existing app
Because the experimental API mirrors the API for the standard paginator, it can easily be swapped in
by just changing the import paths. There is currently no schematic for this, but you can run the
following string replace across your TypeScript files:

```bash
grep -lr --include="*.ts" --exclude-dir="node_modules" \
  --exclude="*.d.ts" "['\"]@angular/material/paginator['\"]" | xargs sed -i \
  "s/['\"]@angular\/material\/paginator['\"]/'@angular\/material-experimental\/mdc-paginator'/g"
```

CSS styles and tests that depend on implementation details of `mat-paginator` (such as getting
elements from the template by class name) will need to be manually updated.

There are some small visual differences between this paginator and the standard `mat-paginator`.
This paginator depends on `MatFormField` and `MatButton` which are also based on MDC, putting them
closer to the Material Design specification while making them slightly wider. You may have to
account for the wider paginator in your app's layout. Furthermore, the form field inside the
paginator only supports the `outline` and `fill` appearances.
