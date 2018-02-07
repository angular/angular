// #docregion whole-core-module
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';

import { CommonModule } from '@angular/common';

import { TitleComponent } from './title.component';
// #docregion user-service
import { UserService } from './user.service';
// #enddocregion user-service
import { UserServiceConfig } from './user.service';


// #docregion user-service
@NgModule({
  // #enddocregion user-service
  imports:      [ CommonModule ],
  declarations: [ TitleComponent ],
  exports:      [ TitleComponent ],
  // #docregion user-service
  providers:    [ UserService ]
})
export class CoreModule {
  // #enddocregion user-service
  // #docregion ctor
  constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
  // #enddocregion ctor

  // #docregion for-root
  static forRoot(config: UserServiceConfig): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        {provide: UserServiceConfig, useValue: config }
      ]
    };
  }
  // #enddocregion for-root
  // #docregion user-service
}
// #enddocregion user-service
// #enddocregion whole-core-module
