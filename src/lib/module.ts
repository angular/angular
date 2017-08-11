/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';

import {OverlayModule} from '@angular/cdk/overlay';
import {A11yModule} from '@angular/cdk/a11y';
import {BidiModule} from '@angular/cdk/bidi';
import {ObserversModule} from '@angular/cdk/observers';
import {PortalModule} from '@angular/cdk/portal';

import {MdCommonModule, MdRippleModule} from './core';
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
import {MdExpansionModule} from './expansion/index';
import {MdTableModule} from './table/index';
import {MdSortModule} from './sort/index';
import {MdPaginatorModule} from './paginator/index';
import {MdFormFieldModule} from './form-field/index';

const MATERIAL_MODULES = [
  MdAutocompleteModule,
  MdButtonModule,
  MdButtonToggleModule,
  MdCardModule,
  MdChipsModule,
  MdCheckboxModule,
  MdDatepickerModule,
  MdTableModule,
  MdDialogModule,
  MdExpansionModule,
  MdFormFieldModule,
  MdGridListModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdMenuModule,
  MdPaginatorModule,
  MdProgressBarModule,
  MdProgressSpinnerModule,
  MdRadioModule,
  MdRippleModule,
  MdSelectModule,
  MdSidenavModule,
  MdSliderModule,
  MdSlideToggleModule,
  MdSnackBarModule,
  MdSortModule,
  MdTabsModule,
  MdToolbarModule,
  MdTooltipModule,
  OverlayModule,
  PortalModule,
  BidiModule,
  StyleModule,
  A11yModule,
  PlatformModule,
  MdCommonModule,
  ObserversModule
];

/** @deprecated */
@NgModule({
  imports: MATERIAL_MODULES,
  exports: MATERIAL_MODULES,
})
export class MaterialModule {}
