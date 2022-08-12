import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MdcCardFancyExample} from './mdc-card-fancy/mdc-card-fancy-example';

export {MdcCardFancyExample};

const EXAMPLES = [MdcCardFancyExample];

@NgModule({
  imports: [MatButtonModule, MatCardModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class MdcCardExamplesModule {}
