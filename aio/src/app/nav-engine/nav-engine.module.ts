import { NgModule } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy, APP_BASE_HREF } from '@angular/common';
import { NavLinkDirective } from './nav-link.directive';
import { NavEngine } from './nav-engine.service';
import { NavMapService } from './nav-map.service';

@NgModule({
  imports: [],
  declarations: [
    NavLinkDirective
  ],
  exports: [
    NavLinkDirective
  ]
})
export class AioNavEngineModule {
  constructor(){

  }

  static withConfig(envConfig:any){
    return {
      ngModule: AioNavEngineModule,
      providers: [
        NavEngine,
        NavMapService,
        Location,
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        { provide: APP_BASE_HREF, useValue: envConfig.baseUrl },

      ]
    }
  }
}
