import {Component, NgModule} from '@angular/core';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';

/**
 * Advanced component using `MatFormField` and `MatInput` in combination with content
 * directives such as `MatError`, `MatHint`, `MatPrefix` or `MatSuffix`.
 */
@Component({
  template: `
    <mat-form-field>
      <div matSuffix></div>
      <div matPrefix></div>
      <mat-error>Error</mat-error>
      <mat-hint>Hint</mat-hint>
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
