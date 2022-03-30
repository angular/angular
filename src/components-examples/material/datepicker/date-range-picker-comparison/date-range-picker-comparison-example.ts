import {Component} from '@angular/core';
import {UntypedFormGroup, UntypedFormControl} from '@angular/forms';

/** @title Date range picker comparison ranges */
@Component({
  selector: 'date-range-picker-comparison-example',
  templateUrl: 'date-range-picker-comparison-example.html',
  styleUrls: ['date-range-picker-comparison-example.css'],
})
export class DateRangePickerComparisonExample {
  campaignOne: UntypedFormGroup;
  campaignTwo: UntypedFormGroup;

  constructor() {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();

    this.campaignOne = new UntypedFormGroup({
      start: new UntypedFormControl(new Date(year, month, 13)),
      end: new UntypedFormControl(new Date(year, month, 16)),
    });

    this.campaignTwo = new UntypedFormGroup({
      start: new UntypedFormControl(new Date(year, month, 15)),
      end: new UntypedFormControl(new Date(year, month, 19)),
    });
  }
}
