import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdCommonModule} from '../core';
import {MdToolbar, MdToolbarRow} from './toolbar';


@NgModule({
  imports: [MdCommonModule],
  exports: [MdToolbar, MdToolbarRow, MdCommonModule],
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
