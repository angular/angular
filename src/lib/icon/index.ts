import {NgModule, ModuleWithProviders} from '@angular/core';
import {HttpModule} from '@angular/http';
import {CompatibilityModule} from '../core';
import {MdIcon, ICON_REGISTRY_PROVIDER} from './icon';


@NgModule({
  imports: [HttpModule, CompatibilityModule],
  exports: [MdIcon, CompatibilityModule],
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
