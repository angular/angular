This is a prototype of an alternate version of `MatDialog` built on top of
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

3. Import the experimental `MatDialogModule` and add it to the module that declares your
   component:

   ```ts
   import {MatDialogModule} from '@angular/material-experimental/mdc-dialog';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatDialogModule],
   })
   export class MyModule {}
   ```

4. Use the `MatDialog` service in your components by injecting the service, just like you would
   use the normal dialog.

5. Ensure color and typography styles for `@angular/material-experimental` are set up. Either
   use a custom theme and use the `mat-mdc-dialog-theme` mixin, or use a prebuilt theme
   from `@angular/material/core/theming/prebuilt`.

## API differences

The runtime API for the `MatDialog` service is fully compatible and no changes are needed. Visually
the dialog has changed a little bit with the MDC-based implementation. In concrete, the dialog no
longer has outer padding by default.

If content elements such as `matDialogContent` or `matDialogTitle` are used though, the MDC dialog
will display as with the current non-experimental dialog. The padding change will only surface if
you have custom content within the dialog that is not wrapped with `matDialogContent`,
`matDialogActions` or `matDialogTitle`.

We provide a backwards compatibility mixin that re-adds the outer padding. The use of this mixin
is generally not recommended as it results in inefficient CSS for the dialog because padding from
the content elements would need to be off set (to not have stacked padding). Ideally, if you have
custom content outside of the provided dialog sections, add the necessary padding to the element
directly through CSS, or move them into one of the defined sections the Angular Material dialog
provides.

```scss
@use '@angular/material-experimental' as experimental;

@include experimental.mdc-dialog-legacy-padding();
```
