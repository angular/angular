import {NgModule, ModuleWithProviders} from '@angular/core';
import {FocusTrap} from './focus-trap';
import {MdLiveAnnouncer} from './live-announcer';
import {InteractivityChecker} from './interactivity-checker';

export const A11Y_PROVIDERS = [MdLiveAnnouncer, InteractivityChecker];

@NgModule({
  declarations: [FocusTrap],
  exports: [FocusTrap],
})
export class A11yModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: A11yModule,
      providers: A11Y_PROVIDERS,
    };
  }
}
