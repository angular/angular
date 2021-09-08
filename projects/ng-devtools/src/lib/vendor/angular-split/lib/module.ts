// tslint:disable
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SplitModule } from './component/split.module';

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
