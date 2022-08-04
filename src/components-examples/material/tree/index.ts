import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacyProgressBarModule} from '@angular/material/legacy-progress-bar';
import {MatTreeModule} from '@angular/material/tree';
import {TreeChecklistExample} from './tree-checklist/tree-checklist-example';
import {TreeDynamicExample} from './tree-dynamic/tree-dynamic-example';
import {TreeFlatOverviewExample} from './tree-flat-overview/tree-flat-overview-example';
import {TreeHarnessExample} from './tree-harness/tree-harness-example';
import {TreeLoadmoreExample} from './tree-loadmore/tree-loadmore-example';
import {TreeNestedOverviewExample} from './tree-nested-overview/tree-nested-overview-example';

export {
  TreeChecklistExample,
  TreeDynamicExample,
  TreeFlatOverviewExample,
  TreeHarnessExample,
  TreeLoadmoreExample,
  TreeNestedOverviewExample,
};

const EXAMPLES = [
  TreeChecklistExample,
  TreeDynamicExample,
  TreeFlatOverviewExample,
  TreeHarnessExample,
  TreeLoadmoreExample,
  TreeNestedOverviewExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatLegacyCheckboxModule,
    MatIconModule,
    MatLegacyInputModule,
    MatLegacyProgressBarModule,
    MatTreeModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class TreeExamplesModule {}
