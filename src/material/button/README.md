This is a prototype of an alternate version of `MatButton` built on top of
[MDC Web](https://github.com/material-components/material-components-web). This component is
experimental and should not be used in production.

## How to use
Assuming your application is already up and running using Angular Material, you can add this
component by following these steps:

1. Install `@angular/material-experimental` and MDC Web:

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

3. Import the experimental `MatButtonModule` and add it to the module that declares your component:

   ```ts
   import {MatButtonModule} from '@angular/material-experimental/mdc-button';
   @NgModule({
     declarations: [MyComponent],
     imports: [MatButtonModule],
   })
   export class MyModule {}
   ```

4. Use the buttons in your component's template:

   ```html
   <button mat-button> Basic </button>
   <button mat-raised-button> Raised </button>
   <button mat-stroked-button> Stroked </button>
   <button mat-flat-button> Flat </button>
   <button mat-icon-button>
     <mat-icon>save</mat-icon>
   </button>
   <button mat-fab>
     <mat-icon>add</mat-icon>
   </button>
   ```

5. Add the theme and typography mixins to your Sass. Note that there are three separate mixins for
the button variants: standard buttons, icon buttons, and floating action buttons. Include only the mixins of the
button variants you are using:

   ```scss
   @use '@angular/material' as mat;
   @use '@angular/material-experimental' as mat-experimental;
   $candy-app-primary: mat.define-palette(mat.$indigo-palette);
   $candy-app-accent:  mat.define-palette(mat.$pink-palette, A200, A100, A400);
   $candy-app-theme:   mat.define-light-theme((
     color: (
       primary: $candy-app-primary,
       accent: $candy-app-accent,
     )
   ));
   @include mat-experimental.mdc-button-theme($candy-app-theme);
   @include mat-experimental.mdc-fab-theme($candy-app-theme);
   @include mat-experimental.mdc-icon-button-theme($candy-app-theme);
   ```

## API differences

The API of the buttons matches the one from `@angular/material/button`. Simply replace imports to
`@angular/material/button` with imports to `@angular/material-experimental/mdc-button`.
