import {NgModule, ModuleWithProviders} from '@angular/core';
import {OverlayModule, PortalModule, CompatibilityModule, LIVE_ANNOUNCER_PROVIDER} from '../core';
import {CommonModule} from '@angular/common';
import {MdSnackBar} from './snack-bar';
import {MdSnackBarContainer} from './snack-bar-container';
import {SimpleSnackBar} from './simple-snack-bar';


@NgModule({
  imports: [OverlayModule, PortalModule, CommonModule, CompatibilityModule],
  exports: [MdSnackBarContainer, CompatibilityModule],
  declarations: [MdSnackBarContainer, SimpleSnackBar],
  entryComponents: [MdSnackBarContainer, SimpleSnackBar],
  providers: [MdSnackBar, LIVE_ANNOUNCER_PROVIDER]
})
export class MdSnackBarModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdSnackBarModule,
      providers: []
    };
  }
}


export * from './snack-bar';
export * from './snack-bar-container';
export * from './snack-bar-config';
export * from './snack-bar-ref';
export * from './simple-snack-bar';
