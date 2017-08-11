/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdMonthView} from './month-view';
import {CommonModule} from '@angular/common';
import {OverlayModule} from '@angular/cdk/overlay';
import {A11yModule} from '@angular/cdk/a11y';
import {StyleModule} from '../core';
import {MdCalendarBody} from './calendar-body';
import {MdYearView} from './year-view';
import {
  MdDatepicker,
  MdDatepickerContent,
  MD_DATEPICKER_SCROLL_STRATEGY_PROVIDER,
} from './datepicker';
import {MdDatepickerInput} from './datepicker-input';
import {MdDialogModule} from '../dialog/index';
import {MdCalendar} from './calendar';
import {MdDatepickerToggle} from './datepicker-toggle';
import {MdButtonModule} from '../button/index';
import {MdDatepickerIntl} from './datepicker-intl';
import {MdIconModule} from '../icon/index';


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
    StyleModule,
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
