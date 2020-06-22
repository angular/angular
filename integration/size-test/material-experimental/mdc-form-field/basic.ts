import {Component, NgModule} from '@angular/core';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatInputModule} from '@angular/material-experimental/mdc-input';

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
  imports: [MatInputModule, MatFormFieldModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
