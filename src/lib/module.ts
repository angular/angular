import {NgModule, ModuleWithProviders} from '@angular/core';

import {
  MdRippleModule,
  RtlModule,
  PortalModule,
  OverlayModule,
  A11yModule,
  StyleCompatibilityModule,
} from './core/index';

import {MdButtonToggleModule} from './button-toggle/index';
import {MdButtonModule} from './button/index';
import {MdCheckboxModule} from './checkbox/index';
import {MdRadioModule} from './radio/index';
import {MdSelectModule} from './select/index';
import {MdSlideToggleModule} from './slide-toggle/index';
import {MdSliderModule} from './slider/index';
import {MdSidenavModule} from './sidenav/index';
import {MdListModule} from './list/index';
import {MdGridListModule} from './grid-list/index';
import {MdCardModule} from './card/index';
import {MdIconModule} from './icon/index';
import {MdProgressCircleModule} from './progress-circle/index';
import {MdProgressBarModule} from './progress-bar/index';
import {MdInputModule} from './input/index';
import {MdSnackBarModule} from './snack-bar/snack-bar';
import {MdTabsModule} from './tabs/index';
import {MdToolbarModule} from './toolbar/index';
import {MdTooltipModule} from './tooltip/index';
import {MdMenuModule} from './menu/index';
import {MdDialogModule} from './dialog/index';


const MATERIAL_MODULES = [
  MdButtonModule,
  MdButtonToggleModule,
  MdCardModule,
  MdCheckboxModule,
  MdDialogModule,
  MdGridListModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdMenuModule,
  MdProgressBarModule,
  MdProgressCircleModule,
  MdRadioModule,
  MdRippleModule,
  MdSelectModule,
  MdSidenavModule,
  MdSliderModule,
  MdSlideToggleModule,
  MdSnackBarModule,
  MdTabsModule,
  MdToolbarModule,
  MdTooltipModule,
  OverlayModule,
  PortalModule,
  RtlModule,
  A11yModule,
  StyleCompatibilityModule,
];

@NgModule({
  imports: [
    MdButtonModule.forRoot(),
    MdCardModule.forRoot(),
    MdCheckboxModule.forRoot(),
    MdGridListModule.forRoot(),
    MdInputModule.forRoot(),
    MdListModule.forRoot(),
    MdProgressBarModule.forRoot(),
    MdProgressCircleModule.forRoot(),
    MdRippleModule.forRoot(),
    MdSelectModule.forRoot(),
    MdSidenavModule.forRoot(),
    MdTabsModule.forRoot(),
    MdToolbarModule.forRoot(),
    PortalModule.forRoot(),
    RtlModule.forRoot(),

    // These modules include providers.
    A11yModule.forRoot(),
    MdButtonToggleModule.forRoot(),
    MdDialogModule.forRoot(),
    MdIconModule.forRoot(),
    MdMenuModule.forRoot(),
    MdRadioModule.forRoot(),
    MdSliderModule.forRoot(),
    MdSlideToggleModule.forRoot(),
    MdSnackBarModule.forRoot(),
    MdTooltipModule.forRoot(),
    OverlayModule.forRoot(),
    StyleCompatibilityModule.forRoot(),
  ],
  exports: MATERIAL_MODULES,
})
export class MaterialRootModule { }


@NgModule({
  imports: MATERIAL_MODULES,
  exports: MATERIAL_MODULES,
})
export class MaterialModule {
  static forRoot(): ModuleWithProviders {
    return {ngModule: MaterialRootModule};
  }
}
