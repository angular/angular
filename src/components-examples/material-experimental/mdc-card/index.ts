import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material-experimental/mdc-button';
import {MatCardModule} from '@angular/material-experimental/mdc-card';
import {MdcCardFancyExample} from './mdc-card-fancy/mdc-card-fancy-example';

export {
  MdcCardFancyExample,
};

const EXAMPLES = [
  MdcCardFancyExample,
];

@NgModule({
  imports: [
    MatButtonModule,
    MatCardModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class MdcCardExamplesModule {
}
