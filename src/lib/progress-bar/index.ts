import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CompatibilityModule} from '../core/compatibility/compatibility';
import {MdProgressBar} from './progress-bar';


@NgModule({
  imports: [CommonModule, CompatibilityModule],
  exports: [MdProgressBar, CompatibilityModule],
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
