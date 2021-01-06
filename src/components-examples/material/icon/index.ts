import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {IconOverviewExample} from './icon-overview/icon-overview-example';
import {IconSvgExample} from './icon-svg/icon-svg-example';
import {IconHarnessExample} from './icon-harness/icon-harness-example';

export {
  IconHarnessExample,
  IconOverviewExample,
  IconSvgExample,
};

const EXAMPLES = [
  IconHarnessExample,
  IconOverviewExample,
  IconSvgExample,
];

@NgModule({
  imports: [
    MatIconModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class IconExamplesModule {
}
