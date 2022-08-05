import {Component, NgModule} from '@angular/core';
import {MatLegacyChipsModule} from '@angular/material/legacy-chips';

/**
 * Basic component using `MatChipList` and `MatChip`. Other supported parts of the
 * chip module such as `MatChipRemove` are not used and should be tree-shaken away.
 */
@Component({
  template: `
    <mat-chip-list>
      <mat-chip>First</mat-chip>
    </mat-chip-list>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [MatLegacyChipsModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
