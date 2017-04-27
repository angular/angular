import {NgModule, ModuleWithProviders} from '@angular/core';
import {HttpModule} from '@angular/http';
import {MdCommonModule} from '../core';
import {MdIcon, ICON_REGISTRY_PROVIDER} from './icon';


@NgModule({
  imports: [HttpModule, MdCommonModule],
  exports: [MdIcon, MdCommonModule],
  declarations: [MdIcon],
  providers: [ICON_REGISTRY_PROVIDER],
})
export class MdIconModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdIconModule,
      providers: [],
    };
  }
}


export * from './icon';
export {MdIconRegistry} from './icon-registry';
