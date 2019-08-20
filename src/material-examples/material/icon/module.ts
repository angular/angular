import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {IconOverviewExample} from './icon-overview/icon-overview-example';
import {IconSvgExample} from './icon-svg/icon-svg-example';

const EXAMPLES = [
  IconOverviewExample,
  IconSvgExample,
];

@NgModule({
  imports: [
    MatIconModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class IconExamplesModule {
}
