import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MdCommonModule} from '../core';
import {MdProgressBar} from './progress-bar';


@NgModule({
  imports: [CommonModule, MdCommonModule],
  exports: [MdProgressBar, MdCommonModule],
  declarations: [MdProgressBar],
})
export class MdProgressBarModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdProgressBarModule,
      providers: []
    };
  }
}


export * from './progress-bar';
