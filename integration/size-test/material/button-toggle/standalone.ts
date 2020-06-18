import {Component, NgModule} from '@angular/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

/**
 * Basic component using a standalone `MatButtonToggle`. Other parts of the button-toggle
 * module such as `MatButtonToggleGroup` are not used and should be tree-shaken away.
 */
@Component({
  template: `
    <mat-button-toggle>Center text</mat-button-toggle>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [MatButtonToggleModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
