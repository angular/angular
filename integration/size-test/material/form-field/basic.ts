import {Component, NgModule} from '@angular/core';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';

/**
 * Basic component using `MatFormField` and `MatInput`. Other parts of the form-field
 * module such as `MatError`, `MatHint`, `MatPrefix` or `MatSuffix` are not used
 * and should be tree-shaken away.
 */
@Component({
  template: `
    <mat-form-field>
      <input matInput>
    </mat-form-field>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [MatLegacyInputModule, MatLegacyFormFieldModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
