/* tslint:disable:member-ordering no-unused-variable */
 // #docregion whole-core-module
import {
  ModuleWithProviders, NgModule,
  Optional, SkipSelf }       from '@angular/core';

import { CommonModule }      from '@angular/common';

import { TitleComponent }    from './title.component';
import { UserService }       from './user.service';
import { UserServiceConfig } from './user.service';

@NgModule({
  imports:      [ CommonModule ],
  declarations: [ TitleComponent ],
  exports:      [ TitleComponent ],
  providers:    [ UserService ]
})
export class CoreModule {
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
}

// #enddocregion whole-core-module

