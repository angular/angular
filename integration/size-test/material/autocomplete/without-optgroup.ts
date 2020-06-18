import {Component, NgModule} from '@angular/core';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

/**
 * Basic component using `MatAutocomplete` and `MatOption`. Other supported parts of the
 * autocomplete like `MatOptgroup` are not used and should be tree-shaken away.
 */
@Component({
  template: `
    <input [matAutocomplete]="myAutocomplete">
    <mat-autocomplete #myAutocomplete>
      <mat-option value="First">First</mat-option>
    </mat-autocomplete>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [MatAutocompleteModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
