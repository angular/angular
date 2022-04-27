import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {SplitComponent} from './split.component.js';
import {SplitAreaDirective} from './splitArea.directive.js';

@NgModule({
  imports: [CommonModule],
  declarations: [SplitAreaDirective, SplitComponent],
  exports: [SplitAreaDirective, SplitComponent],
})
export class SplitModule {
}
