import {NgModule, ModuleWithProviders} from '@angular/core';
import {
  OverlayModule,
  PortalModule,
  A11yModule,
  DefaultStyleCompatibilityModeModule
} from '../core';
import {MdDialog} from './dialog';
import {MdDialogContainer} from './dialog-container';
import {
  MdDialogClose,
  MdDialogContent,
  MdDialogTitle,
  MdDialogActions
} from './dialog-content-directives';


@NgModule({
  imports: [
    OverlayModule,
    PortalModule,
    A11yModule,
    DefaultStyleCompatibilityModeModule
  ],
  exports: [
    MdDialogContainer,
    MdDialogClose,
    MdDialogTitle,
    MdDialogContent,
    MdDialogActions,
    DefaultStyleCompatibilityModeModule
  ],
  declarations: [
    MdDialogContainer,
    MdDialogClose,
    MdDialogTitle,
    MdDialogActions,
    MdDialogContent
  ],
  providers: [
    MdDialog,
  ],
  entryComponents: [MdDialogContainer],
})
export class MdDialogModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdDialogModule,
      providers: [],
    };
  }
}

export * from './dialog';
export * from './dialog-container';
export * from './dialog-content-directives';
export * from './dialog-config';
export * from './dialog-ref';
