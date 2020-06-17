import {Component, NgModule} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';

/**
 * Basic component using `MatExpansionPanel` and `MatExpansionPanelHeader`. Other parts of
 * the module such as `MatAccordion` or `CdkAccordion` should be tree-shaken away.
 */
@Component({
  template: `
    <mat-expansion-panel>
      <mat-expansion-panel-header>Title</mat-expansion-panel-header>
      Content
    </mat-expansion-panel>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [MatExpansionModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
