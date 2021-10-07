This is a prototype of an alternate version of `MatRadio` built on top of
[MDC Web](https://github.com/material-components/material-components-web). This component is experimental and should not be used in production.

## How to use
Assuming your application is already up and running using Angular Material, you can add this component by following these steps:

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

3. Import the experimental `MatRadioModule` and add it to the module that declares your component:

   ```ts
   import {MatRadioModule} from '@angular/material-experimental/mdc-radio';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatRadioModule],
   })
   export class MyModule {}
   ```

4. Use the radio in your component's template:

   ```html
     <mat-radio-group>
       <mat-radio-button value="1">Option 1</mat-radio-button>
       <mat-radio-button value="2">Option 2</mat-radio-button>
       <mat-radio-button value="3">Option 3</mat-radio-button>
     </mat-radio-group>
   ```

5. Add the theme mixins to your Sass:

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


   @include mat-experimental.mdc-radio-theme($candy-app-theme);
   ```

## API differences

The API of the radio matches the one from `@angular/material/radio`. Simply replace imports to
`@angular/material/radio` with imports to `@angular/material-experimental/mdc-radio`.
