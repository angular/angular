/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {A11yModule} from '@angular/cdk/a11y';
import {OverlayModule} from '@angular/cdk/overlay';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MdButtonModule} from '@angular/material/button';
import {MdDialogModule} from '@angular/material/dialog';
import {MdIconModule} from '@angular/material/icon';
import {MdCalendar} from './calendar';
import {MdCalendarBody} from './calendar-body';
import {
  MD_DATEPICKER_SCROLL_STRATEGY_PROVIDER,
  MdDatepicker,
  MdDatepickerContent,
} from './datepicker';
import {MdDatepickerInput} from './datepicker-input';
import {MdDatepickerIntl} from './datepicker-intl';
import {MdDatepickerToggle} from './datepicker-toggle';
import {MdMonthView} from './month-view';
import {MdYearView} from './year-view';


export * from './calendar';
export * from './calendar-body';
export * from './datepicker';
export * from './datepicker-input';
export * from './datepicker-intl';
export * from './datepicker-toggle';
export * from './month-view';
export * from './year-view';


@NgModule({
  imports: [
    CommonModule,
    MdButtonModule,
    MdDialogModule,
    MdIconModule,
    OverlayModule,
    A11yModule,
  ],
  exports: [
    MdCalendar,
    MdCalendarBody,
    MdDatepicker,
    MdDatepickerContent,
    MdDatepickerInput,
    MdDatepickerToggle,
    MdMonthView,
    MdYearView,
  ],
  declarations: [
    MdCalendar,
    MdCalendarBody,
    MdDatepicker,
    MdDatepickerContent,
    MdDatepickerInput,
    MdDatepickerToggle,
    MdMonthView,
    MdYearView,
  ],
  providers: [
    MdDatepickerIntl,
    MD_DATEPICKER_SCROLL_STRATEGY_PROVIDER,
  ],
  entryComponents: [
    MdDatepickerContent,
  ]
})
export class MdDatepickerModule {}
