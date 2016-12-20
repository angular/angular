import {NgModule, ModuleWithProviders} from '@angular/core';
import {FocusTrap} from './focus-trap';
import {LiveAnnouncer} from './live-announcer';
import {InteractivityChecker} from './interactivity-checker';
import {CommonModule} from '@angular/common';
import {PlatformModule} from '../platform/index';

export const A11Y_PROVIDERS = [LiveAnnouncer, InteractivityChecker];

@NgModule({
  imports: [CommonModule, PlatformModule],
  declarations: [FocusTrap],
  exports: [FocusTrap],
})
export class A11yModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: A11yModule,
      providers: [
        PlatformModule.forRoot().providers,
        A11Y_PROVIDERS,
      ],
    };
  }
}
