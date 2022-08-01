import {Component, NgModule} from '@angular/core';
import {MatLegacySelectModule} from '@angular/material/legacy-select';

/**
 * Basic component using `MatSelect` and `MatOption`. Other supported parts of the
 * select like `MatOptgroup` or `MatSelectTrigger` are not used and should be
 * tree-shaken away.
 */
@Component({
  template: `
    <mat-select>
      <mat-option value="First">First</mat-option>
    </mat-select>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [MatLegacySelectModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
