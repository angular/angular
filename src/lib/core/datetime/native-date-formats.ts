import {MdDateFormats} from './date-formats';


export const MD_NATIVE_DATE_FORMATS: MdDateFormats = {
  parse: {
    dateInput: null,
  },
  display: {
    dateInput: {year: 'numeric', month: 'numeric', day: 'numeric'},
    monthYearLabel: {year: 'numeric', month: 'short'},
    dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
    monthYearA11yLabel: {year: 'numeric', month: 'long'},
  }
};
