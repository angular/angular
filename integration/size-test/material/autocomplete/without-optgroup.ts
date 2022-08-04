import {Component, NgModule} from '@angular/core';
import {MatLegacyAutocompleteModule} from '@angular/material/legacy-autocomplete';

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
  imports: [MatLegacyAutocompleteModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
