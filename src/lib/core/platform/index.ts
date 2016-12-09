import {NgModule, ModuleWithProviders} from '@angular/core';
import {MdPlatform} from './platform';


@NgModule({})
export class PlatformModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PlatformModule,
      providers: [MdPlatform],
    };
  }
}
