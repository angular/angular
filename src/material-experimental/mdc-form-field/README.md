This is a prototype of an alternate version of `<mat-form-field>` built on top of
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

3. Import the experimental `MatFormFieldModule` and add it to the module that declares your
   component:

   ```ts
   import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatFormFieldModule],
   })
   export class MyModule {}
   ```

4. Use `<mat-form-field>` in your component's template, just like you would use the normal
   form-field.
   
5. Ensure color and typography styles for `@angular/material-experimental` are set up. Either
   use a custom theme and use the `mat-mdc-form-field-theme` mixin, or use a prebuilt theme
   from `@angular/material-experimental/mdc-core/theming/prebuilt`.

## API differences

In the Material Design specification, text fields with the `standard` and `legacy` appearance
can no longer be found. These appearances will be removed for the standard
`@angular/material/form-field` in the future.

The experimental MDC-based form-field no longer has support for these appearances. The form-field
uses the `fill` appearance by default, but also supports the `outline` appearance. 

Due to the removal of the `legacy` appearance, the form-field no longer [promotes placeholders
to labels](https://material.angular.io/components/form-field/overview#form-field-appearance-variants).
This means that form-fields which use the default `legacy` need to be migrated to use the
`<mat-label>` element if they only had a `placeholder`.


```html
<mat-form-field appearance="legacy">
  <input matInput placeholder="Full name">
</mat-form-field>
```

needs to be changed to:

```html
<mat-form-field>
  <mat-label>Full name</mat-label>
  <input matInput>
</mat-form-field>
```

Other than the removal of the `legacy` and `standard` appearances, the API of form-field
matches the one from `@angular/material/from-field`. Simply replace imports to
`@angular/material/form-field` with imports to `@angular/material-experimental/mdc-form-field`.
