This is a prototype of an alternate version of `MatChip` built on top of
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

3. Import the experimental `MatChipsModule` and add it to the module that declares your component:

   ```ts
   import {MatChipsModule} from '@angular/material-experimental/mdc-chips';

   @NgModule({
     declarations: [MyComponent],
     imports: [MatChipsModule],
   })
   export class MyModule {}
   ```

4. Use the chips in your component's template:

   ```html
   <mat-chip-set>
     <mat-chip> Chip 1 </mat-chip>
     <mat-chip> Chip 2 </mat-chip>
   </mat-chip-set>
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


   @include mat-experimental.mdc-chips-theme($candy-app-theme);
   ```

## API differences

The API for the MDC-based chips are mostly the same as the current chips implementation, but
one notable difference is that the names of the container and chips have been changed to clarify
when and how they should be used.

The most basic container that you can use for the chips is with the `<mat-chip-set>` containing a
list of `<mat-chip>`:

```html
  <mat-chip-set>
    <mat-chip> John </mat-chip>
    <mat-chip> Paul </mat-chip>
    <mat-chip> James </mat-chip>
  </mat-chip-set>
```

To use chips as a selection list, use the `<mat-chip-listbox>` with `<mat-chip-option>`:

```html
  <mat-chip-listbox>
    <mat-chip-option> Extra Small </mat-chip-option>
    <mat-chip-option> Small </mat-chip-option>
    <mat-chip-option> Medium </mat-chip-option>
    <mat-chip-option> Large </mat-chip-option>
  </mat-chip-listbox>
```

To use chips with an input, use the `<mat-chip-grid>` with `<mat-chip-row>`:

```html
  <mat-form-field>
    <mat-chip-grid #myChipGrid [(ngModel)]="mySelection">
      <mat-chip-row *ngFor="let person of people"
                   (removed)="remove(person)">
        {{person.name}}
        <button matChipRemove>
          <mat-icon>cancel</mat-icon>
        </button>
      </mat-chip-row>
      <input [matChipInputFor]="myChipGrid"
             [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
             (matChipInputTokenEnd)="add($event)" />
    </mat-chip-grid>
  </mat-form-field>
```
