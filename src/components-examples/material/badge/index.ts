import {NgModule} from '@angular/core';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {BadgeOverviewExample} from './badge-overview/badge-overview-example';
import {BadgeHarnessExample} from './badge-harness/badge-harness-example';

export {BadgeOverviewExample, BadgeHarnessExample};

const EXAMPLES = [
  BadgeOverviewExample,
  BadgeHarnessExample
];

@NgModule({
  imports: [
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class BadgeExamplesModule {
}
