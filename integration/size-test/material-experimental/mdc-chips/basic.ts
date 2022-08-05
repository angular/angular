import {Component, NgModule} from '@angular/core';
import {MatChipsModule} from '@angular/material/chips';

/**
 * Basic component using `MatChipSet` and `MatChip`. Other supported parts of the
 * chip module such as `MatChipRemove` are not used and should be tree-shaken away.
 */
@Component({
  template: `
    <mat-chip-set>
      <mat-chip>First</mat-chip>
    </mat-chip-set>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [MatChipsModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
