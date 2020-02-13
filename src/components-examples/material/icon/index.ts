import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {IconOverviewExample} from './icon-overview/icon-overview-example';
import {IconSvgExample} from './icon-svg/icon-svg-example';

export {
  IconOverviewExample,
  IconSvgExample,
};

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
  entryComponents: EXAMPLES,
})
export class IconExamplesModule {
}
