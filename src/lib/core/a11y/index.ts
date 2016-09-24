import {NgModule, ModuleWithProviders} from '@angular/core';
import {FocusTrap} from './focus-trap';
import {MdLiveAnnouncer} from './live-announcer';
import {InteractivityChecker} from './interactivity-checker';

export {FocusTrap} from './focus-trap';
export {MdLiveAnnouncer} from './live-announcer';
export {InteractivityChecker} from './interactivity-checker';


@NgModule({
  declarations: [FocusTrap],
  exports: [FocusTrap],
})
export class A11yModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: A11yModule,
      providers: [MdLiveAnnouncer, InteractivityChecker],
    };
  }
}
