import {NgModule} from '@angular/core';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCardModule} from '@angular/material/legacy-card';
import {MatDividerModule} from '@angular/material/divider';
import {MatLegacyProgressBarModule} from '@angular/material/legacy-progress-bar';
import {CardFancyExample} from './card-fancy/card-fancy-example';
import {CardOverviewExample} from './card-overview/card-overview-example';
import {CardHarnessExample} from './card-harness/card-harness-example';
import {CardActionsExample} from './card-actions/card-actions-example';
import {CardMediaSizeExample} from './card-media-size/card-media-size-example';
import {CardSubtitleExample} from './card-subtitle/card-subtitle-example';
import {CardFooterExample} from './card-footer/card-footer-example';

export {
  CardFancyExample,
  CardOverviewExample,
  CardHarnessExample,
  CardActionsExample,
  CardMediaSizeExample,
  CardSubtitleExample,
  CardFooterExample,
};

const EXAMPLES = [
  CardFancyExample,
  CardOverviewExample,
  CardHarnessExample,
  CardActionsExample,
  CardMediaSizeExample,
  CardSubtitleExample,
  CardFooterExample,
];

@NgModule({
  imports: [
    MatLegacyButtonModule,
    MatLegacyCardModule,
    MatDividerModule,
    MatLegacyProgressBarModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CardExamplesModule {}
