import {NgModule, ModuleWithProviders} from '@angular/core';
import {Platform} from './platform';

export * from './platform';
export * from './features';


@NgModule({
  providers: [Platform]
})
export class PlatformModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PlatformModule,
      providers: [],
    };
  }
}
