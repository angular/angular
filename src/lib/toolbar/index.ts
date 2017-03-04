import {NgModule, ModuleWithProviders} from '@angular/core';
import {CompatibilityModule} from '../core';
import {MdToolbar, MdToolbarRow} from './toolbar';


@NgModule({
  imports: [CompatibilityModule],
  exports: [MdToolbar, MdToolbarRow, CompatibilityModule],
  declarations: [MdToolbar, MdToolbarRow],
})
export class MdToolbarModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdToolbarModule,
      providers: []
    };
  }
}


export * from './toolbar';
