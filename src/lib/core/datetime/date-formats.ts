import {InjectionToken} from '@angular/core';


export type MdDateFormats = {
  parse: {
    dateInput: any
  },
  display: {
    dateInput: any,
    monthYearLabel: any,
    dateA11yLabel: any,
    monthYearA11yLabel: any,
  }
};


export const MD_DATE_FORMATS = new InjectionToken<MdDateFormats>('md-date-formats');
