import {Component, NgModule} from '@angular/core';
import {MatLegacyRadioModule} from '@angular/material/legacy-radio';

/**
 * Basic component using `MatRadioButton`. Doesn't use a `MatRadioGroup`, so the class
 * should be tree-shaken away properly.
 */
@Component({
  template: `
    <mat-radio-button value="hello"></mat-radio-button>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [MatLegacyRadioModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
