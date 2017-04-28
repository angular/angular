import {NgModule} from '@angular/core';
import {OverlayModule, PortalModule, MdCommonModule, LIVE_ANNOUNCER_PROVIDER} from '../core';
import {CommonModule} from '@angular/common';
import {MdSnackBar} from './snack-bar';
import {MdSnackBarContainer} from './snack-bar-container';
import {SimpleSnackBar} from './simple-snack-bar';


@NgModule({
  imports: [
    OverlayModule,
    PortalModule,
    CommonModule,
    MdCommonModule,
  ],
  exports: [MdSnackBarContainer, MdCommonModule],
  declarations: [MdSnackBarContainer, SimpleSnackBar],
  entryComponents: [MdSnackBarContainer, SimpleSnackBar],
  providers: [MdSnackBar, LIVE_ANNOUNCER_PROVIDER]
})
export class MdSnackBarModule {}


export * from './snack-bar';
export * from './snack-bar-container';
export * from './snack-bar-config';
export * from './snack-bar-ref';
export * from './simple-snack-bar';
