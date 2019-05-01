# Angular Material Experimental

This package contains prototypes and experiments in development for Angular Material. Nothing in
this package is considered stable or production ready. While the package releases with Angular
Material, breaking changes may occur with any release.

## Using the experimental components based on MDC Web
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
   
3. Import the `NgModule` for the component you want to use. For example, the checkbox:
```ts
  import {MatCheckboxModule} from '@angular/material-experimental/mdc-checkbox';

  @NgModule({
    declarations: [MyComponent],
    imports: [MatCheckboxModule],
  })
  export class MyModule {}
```

4. Add use the components just as you would the normal Angular Material components. For example,
the checkbox: 
```html
  <mat-checkbox [checked]="isChecked">Check me</mat-checkbox>
```

5. Add the theme and typography mixins to your Sass. These align with the normal Angular Material
mixins except that they are suffixed with `-mdc`. There is currently no pre-built CSS option for
the experimental components. For example, using the checkbox:

```scss
  @import '~@angular/material/theming';
  @import '~@angular/material-experimental/mdc-checkbox';
  
  $my-primary: mat-palette($mat-indigo);
  $my-accent:  mat-palette($mat-pink, A200, A100, A400);
  $my-theme:   mat-light-theme($my-primary, $my-accent);
  
  @include mat-checkbox-theme-mdc($my-theme);
  @include mat-checkbox-typography-mdc();
```
