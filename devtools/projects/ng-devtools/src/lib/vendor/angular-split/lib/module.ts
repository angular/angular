// tslint:disable
import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';

import {SplitModule} from './component/split.module';

@NgModule({
  imports: [CommonModule, SplitModule],
  declarations: [],
  exports: [SplitModule],
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
