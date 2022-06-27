This is a prototype of an alternate version of `MatCard` built on top of
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

3. Import the experimental `MatCardModule` and add it to the module that declares your component:

   ```ts
   import {MatCardModule} from '@angular/material/card';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatCardModule],
   })
   export class MyModule {}
   ```

4. Use the card in your component's template:

   ```html
   <mat-card>
     <mat-card-title> My Card Title </mat-card-title>
     <mat-card-content>
       Card content!
     </mat-card-content>
     <mat-card-actions>
       <button> Like </button>
       <button> Share </button>
     </mat-card-actions>
   </mat-card>
   ```

5. Add the theme and typography mixins to your Sass:

   ```scss
   @use '@angular/material' as mat;
   @use '@angular/material-experimental' as mat-experimental;

   $candy-app-primary: mat.define-palette(mat.$indigo-palette);
   $candy-app-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
   $candy-app-theme: mat.define-light-theme((
     color: (
       primary: $candy-app-primary,
       accent: $candy-app-accent,
     )
   ));


   @include mat-experimental.mdc-card-theme($candy-app-theme);
   ```

## API differences

The API of the card matches the one from `@angular/material/legacy-card`. Simply replace imports to
`@angular/material/legacy-card` with imports to `@angular/material/card`.
