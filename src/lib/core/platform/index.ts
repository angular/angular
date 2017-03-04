import {NgModule, ModuleWithProviders} from '@angular/core';
import {Platform} from './platform';


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


export * from './platform';
export * from './features';
