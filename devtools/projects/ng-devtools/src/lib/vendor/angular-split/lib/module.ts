// tslint:disable
import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';

import {SplitComponent} from './component/split.component';
import {SplitAreaDirective} from './directive/splitArea.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [SplitComponent, SplitAreaDirective],
  exports: [SplitComponent, SplitAreaDirective],
})
export class AngularSplitModule {
  public static forRoot(): ModuleWithProviders<AngularSplitModule> {
    return {
      ngModule: AngularSplitModule,
      providers: [],
    };
  }

  public static forChild(): ModuleWithProviders<AngularSplitModule> {
    return {
      ngModule: AngularSplitModule,
      providers: [],
    };
  }
}
