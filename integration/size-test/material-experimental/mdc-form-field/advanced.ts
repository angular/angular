import {Component, NgModule} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

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
  imports: [MatInputModule, MatFormFieldModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
