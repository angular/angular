import {Component, NgModule} from '@angular/core';
import {MatMenuModule} from '@angular/material/menu';

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
  imports: [MatMenuModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
