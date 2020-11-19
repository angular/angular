import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
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
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatTreeModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class TreeExamplesModule {
}
