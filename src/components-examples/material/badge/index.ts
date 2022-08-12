import {NgModule} from '@angular/core';
import {MatBadgeModule} from '@angular/material/badge';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatIconModule} from '@angular/material/icon';
import {BadgeOverviewExample} from './badge-overview/badge-overview-example';
import {BadgeHarnessExample} from './badge-harness/badge-harness-example';

export {BadgeOverviewExample, BadgeHarnessExample};

const EXAMPLES = [BadgeOverviewExample, BadgeHarnessExample];

@NgModule({
  imports: [MatBadgeModule, MatLegacyButtonModule, MatIconModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class BadgeExamplesModule {}
