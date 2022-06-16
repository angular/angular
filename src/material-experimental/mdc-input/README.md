This is a prototype of an alternate version of `MatInput` built on top of
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

3. Import the experimental `MatInputModule` and add it to the module that declares your
   component:

   ```ts
   import {MatInputModule} from '@angular/material-experimental/mdc-input';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatInputModule],
   })
   export class MyModule {}
   ```

4. Use `MatInput` in your component's template in combination with the MDC-based `mat-form-field`.
   Similarly to the input module from `@angular/material`, the MDC-based input module exposes
   the form-field module.
   
   ```html
   <mat-form-field>
     <mat-label>Full name</mat-label>
     <input matInput>
   </mat-form-field>
   ``` 
   
5. Ensure color and typography styles for `@angular/material-experimental` are set up. The input
   itself does not provide any styles. If an input is used inside of the MDC-based
   `mat-mdc-form-field`, either use a custom theme with the `mat-form-field-theme` mixin, or use
   a prebuilt theme from `@angular/material-experimental/mdc-core/theming/prebuilt`.

## API differences

The API of input matches the one from `@angular/material/input`. Simply replace imports to
`@angular/material/input` with imports to `@angular/material-experimental/mdc-input`.
