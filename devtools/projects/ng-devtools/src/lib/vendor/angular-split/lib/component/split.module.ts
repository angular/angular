import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {SplitComponent} from './split.component';
import {SplitAreaDirective} from './splitArea.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [SplitAreaDirective, SplitComponent],
  exports: [SplitAreaDirective, SplitComponent],
})
export class SplitModule {
}
