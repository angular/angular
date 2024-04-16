// #docregion whole-greeting-module
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';

import { CommonModule } from '@angular/common';

import { GreetingComponent } from './greeting.component';
import { UserServiceConfig } from './user.service';


@NgModule({
  imports:      [ CommonModule ],
  declarations: [ GreetingComponent ],
  exports:      [ GreetingComponent ]
})
export class GreetingModule {
  // #docregion ctor
  constructor(@Optional() @SkipSelf() parentModule?: GreetingModule) {
    if (parentModule) {
      throw new Error(
        'GreetingModule is already loaded. Import it in the AppModule only');
    }
  }
  // #enddocregion ctor

  // #docregion for-root
  static forRoot(config: UserServiceConfig): ModuleWithProviders<GreetingModule> {
    return {
      ngModule: GreetingModule,
      providers: [
        {provide: UserServiceConfig, useValue: config }
      ]
    };
  }
  // #enddocregion for-root
}
// #enddocregion whole-greeting-module
