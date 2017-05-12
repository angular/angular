import {NgModule} from '@angular/core';

import {
  MdRippleModule,
  RtlModule,
  ObserveContentModule,
  PortalModule,
  OverlayModule,
  A11yModule,
  MdCommonModule,
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
import {MdChipsModule} from './chips/index';
import {MdIconModule} from './icon/index';
import {MdProgressSpinnerModule} from './progress-spinner/index';
import {MdProgressBarModule} from './progress-bar/index';
import {MdInputModule} from './input/index';
import {MdSnackBarModule} from './snack-bar/index';
import {MdTabsModule} from './tabs/index';
import {MdToolbarModule} from './toolbar/index';
import {MdTooltipModule} from './tooltip/index';
import {MdMenuModule} from './menu/index';
import {MdDialogModule} from './dialog/index';
import {PlatformModule} from './core/platform/index';
import {MdAutocompleteModule} from './autocomplete/index';
import {StyleModule} from './core/style/index';
import {MdDatepickerModule} from './datepicker/index';

const MATERIAL_MODULES = [
  MdAutocompleteModule,
  MdButtonModule,
  MdButtonToggleModule,
  MdCardModule,
  MdChipsModule,
  MdCheckboxModule,
  MdDatepickerModule,
  MdDialogModule,
  MdGridListModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdMenuModule,
  MdProgressBarModule,
  MdProgressSpinnerModule,
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
  StyleModule,
  A11yModule,
  PlatformModule,
  MdCommonModule,
  ObserveContentModule,
];

/** @deprecated */
@NgModule({
  imports: MATERIAL_MODULES,
  exports: MATERIAL_MODULES,
})
export class MaterialModule {}
