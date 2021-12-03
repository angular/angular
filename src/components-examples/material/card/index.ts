import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatProgressBarModule} from '@angular/material/progress-bar';
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
  imports: [MatButtonModule, MatCardModule, MatDividerModule, MatProgressBarModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CardExamplesModule {}
