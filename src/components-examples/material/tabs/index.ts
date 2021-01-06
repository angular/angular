import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatTabsModule} from '@angular/material/tabs';
import {TabGroupAlignExample} from './tab-group-align/tab-group-align-example';
import {TabGroupAnimationsExample} from './tab-group-animations/tab-group-animations-example';
import {TabGroupAsyncExample} from './tab-group-async/tab-group-async-example';
import {TabGroupBasicExample} from './tab-group-basic/tab-group-basic-example';
import {TabGroupCustomLabelExample} from './tab-group-custom-label/tab-group-custom-label-example';
import {
  TabGroupDynamicHeightExample
} from './tab-group-dynamic-height/tab-group-dynamic-height-example';
import {TabGroupHarnessExample} from './tab-group-harness/tab-group-harness-example';
import {TabGroupDynamicExample} from './tab-group-dynamic/tab-group-dynamic-example';
import {TabGroupHeaderBelowExample} from './tab-group-header-below/tab-group-header-below-example';
import {TabGroupLazyLoadedExample} from './tab-group-lazy-loaded/tab-group-lazy-loaded-example';
import {TabGroupStretchedExample} from './tab-group-stretched/tab-group-stretched-example';
import {TabGroupThemeExample} from './tab-group-theme/tab-group-theme-example';
import {TabNavBarBasicExample} from './tab-nav-bar-basic/tab-nav-bar-basic-example';

export {
  TabGroupAlignExample,
  TabGroupAnimationsExample,
  TabGroupAsyncExample,
  TabGroupBasicExample,
  TabGroupCustomLabelExample,
  TabGroupDynamicExample,
  TabGroupDynamicHeightExample,
  TabGroupHarnessExample,
  TabGroupHeaderBelowExample,
  TabGroupLazyLoadedExample,
  TabGroupStretchedExample,
  TabGroupThemeExample,
  TabNavBarBasicExample,
};

const EXAMPLES = [
  TabGroupAlignExample,
  TabGroupAnimationsExample,
  TabGroupAsyncExample,
  TabGroupBasicExample,
  TabGroupCustomLabelExample,
  TabGroupDynamicExample,
  TabGroupDynamicHeightExample,
  TabGroupHarnessExample,
  TabGroupHeaderBelowExample,
  TabGroupLazyLoadedExample,
  TabGroupStretchedExample,
  TabGroupThemeExample,
  TabNavBarBasicExample,
];

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    ReactiveFormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class TabGroupExamplesModule {
}
