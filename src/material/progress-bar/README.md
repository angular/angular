This version of `<mat-progress-bar>` is built on top of
[MDC Web](https://github.com/material-components/material-components-web).

## How to use
Assuming your application is already up and running using Angular Material, you can add this
component by following these steps:

1. Install Angular Material & MDC WEB:

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

3. Import the `MatProgressBarModule` and add it to the module that declares your component:

   ```ts
   import {MatProgressBarModule} from '@angular/material/progress-bar';

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

5. Add the theme and typography mixins to your Sass:

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

   @include mat.progress-bar-theme($my-theme);
   @include mat.progress-bar-typography($my-theme);
   ```
