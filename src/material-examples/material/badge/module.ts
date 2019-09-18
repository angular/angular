import {NgModule} from '@angular/core';
import {MatBadgeModule} from '@angular/material/badge';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {BadgeOverviewExample} from './badge-overview/badge-overview-example';

export {BadgeOverviewExample};

const EXAMPLES = [
  BadgeOverviewExample,
];

@NgModule({
  imports: [
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class BadgeExamplesModule {
}
