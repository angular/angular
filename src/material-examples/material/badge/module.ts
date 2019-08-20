import {NgModule} from '@angular/core';
import {MatBadgeModule} from '@angular/material/badge';
import {MatIconModule} from '@angular/material/icon';
import {BadgeOverviewExample} from './badge-overview/badge-overview-example';

const EXAMPLES = [
  BadgeOverviewExample,
];

@NgModule({
  imports: [
    MatBadgeModule,
    MatIconModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class BadgeExamplesModule {
}
