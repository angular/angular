import {NgModule} from '@angular/core';
import {MdMonthView} from './month-view';
import {CommonModule} from '@angular/common';
import {MdCalendarBody} from './calendar-body';
import {MdYearView} from './year-view';
import {OverlayModule} from '../core/overlay/overlay-directives';
import {MdDatepicker, MdDatepickerContent} from './datepicker';
import {MdDatepickerInput} from './datepicker-input';
import {MdDialogModule} from '../dialog/index';
import {MdCalendar} from './calendar';
import {MdDatepickerToggle} from './datepicker-toggle';
import {StyleModule} from '../core/style/index';
import {MdButtonModule} from '../button/index';
import {MdDatepickerIntl} from './datepicker-intl';


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
    OverlayModule,
    StyleModule,
  ],
  exports: [
    MdDatepicker,
    MdDatepickerContent,
    MdDatepickerInput,
    MdDatepickerToggle,
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
  ],
  entryComponents: [
    MdDatepickerContent,
  ]
})
export class MdDatepickerModule {}
