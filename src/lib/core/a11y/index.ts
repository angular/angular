import {NgModule, ModuleWithProviders} from '@angular/core';
import {FocusTrap} from './focus-trap';
import {MdLiveAnnouncer} from './live-announcer';
import {InteractivityChecker} from './interactivity-checker';
import {PlatformModule} from '../platform/platform';

export const A11Y_PROVIDERS = [MdLiveAnnouncer, InteractivityChecker];

@NgModule({
  imports: [PlatformModule],
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
