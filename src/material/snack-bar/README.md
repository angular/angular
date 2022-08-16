This is a prototype of an alternate version of `MatSnackBar` built on top of
[MDC Web](https://github.com/material-components/material-components-web). This component is experimental and should not be used in production.

## How to use
Assuming your application is already up and running using Angular Material, you can add this component by following these steps:

1. Install `@angular/material` and MDC Web:

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

3. Import the `MatSnackBarModule` and add it to the module that declares your component:

   ```ts
   import {MatSnackBarModule} from '@angular/material/snack-bar';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatSnackBarModule],
   })
   export class MyModule {}
   ```

4. Open the snack bar from your component:

   ```ts
     import {MatSnackBar} from '@angular/material/snack-bar';

     @Component({ ... })
     export class MySnackBarDemo {
       constructor(public snackBar: MatSnackBar) {
         this.snackBar.open('Hello, world');
       }
     }
   ```

5. Add the theme mixins to your Sass:

   ```scss
   @use '@angular/material' as mat;

   $candy-app-primary: mat.define-palette(mat.$indigo-palette);
   $candy-app-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);
   $candy-app-theme: mat.define-light-theme((
     color: (
       primary: $candy-app-primary,
       accent: $candy-app-accent,
     )
   ));


   @include mat.snack-bar-theme($candy-app-theme);
   ```

## API differences

The API of the snack bar matches the one from `@angular/material/legacy-snack-bar`. Simply replace imports to
`@angular/material/legacy-snack-bar` with imports to `@angular/material/snack-bar`.
