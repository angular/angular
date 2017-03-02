import {NgModule, ModuleWithProviders} from '@angular/core';
import {FocusTrapDirective, FocusTrapDeprecatedDirective, FocusTrapFactory} from './focus-trap';
import {LIVE_ANNOUNCER_PROVIDER} from './live-announcer';
import {InteractivityChecker} from './interactivity-checker';
import {CommonModule} from '@angular/common';
import {PlatformModule} from '../platform/index';

@NgModule({
  imports: [CommonModule, PlatformModule],
  declarations: [FocusTrapDirective, FocusTrapDeprecatedDirective],
  exports: [FocusTrapDirective, FocusTrapDeprecatedDirective],
  providers: [InteractivityChecker, FocusTrapFactory, LIVE_ANNOUNCER_PROVIDER]
})
export class A11yModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: A11yModule,
      providers: [],
    };
  }
}
