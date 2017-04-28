import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  OverlayModule,
  PortalModule,
  A11yModule,
  MdCommonModule,
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
    CommonModule,
    OverlayModule,
    PortalModule,
    A11yModule,
    MdCommonModule,
  ],
  exports: [
    MdDialogContainer,
    MdDialogClose,
    MdDialogTitle,
    MdDialogContent,
    MdDialogActions,
    MdCommonModule,
  ],
  declarations: [
    MdDialogContainer,
    MdDialogClose,
    MdDialogTitle,
    MdDialogActions,
    MdDialogContent,
  ],
  providers: [
    MdDialog,
  ],
  entryComponents: [MdDialogContainer],
})
export class MdDialogModule {}

export * from './dialog';
export * from './dialog-container';
export * from './dialog-content-directives';
export * from './dialog-config';
export * from './dialog-ref';
export {MD_DIALOG_DATA} from './dialog-injector';
