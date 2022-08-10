import {Component, NgModule} from '@angular/core';
import {MatLegacyMenuModule} from '@angular/material/legacy-menu';

/**
 * Basic component using `MatMenu` and `MatMenuTrigger`. No lazy `MatMenuContent` is
 * specified, so it should be tree-shaken away.
 */
@Component({
  template: `
    <button [matMenuTriggerFor]="menu">Open</button>
    <mat-menu #menu="matMenu"></mat-menu>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [MatLegacyMenuModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
