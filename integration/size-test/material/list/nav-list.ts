import {Component, NgModule} from '@angular/core';
import {MatLegacyListModule} from '@angular/material/legacy-list';

/**
 * Basic component using `MatNavList` and `MatListItem`. Other parts of the list
 * module such as `MatList`, `MatSelectionList` or `MatListOption` are not used
 * and should be tree-shaken away.
 */
@Component({
  template: `
    <mat-nav-list>
      <mat-list-item>
        hello
      </mat-list-item>
    </mat-nav-list>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [MatLegacyListModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
