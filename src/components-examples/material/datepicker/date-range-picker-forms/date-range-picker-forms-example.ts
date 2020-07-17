import {Component} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';

/** @title Date range picker forms integration */
@Component({
  selector: 'date-range-picker-forms-example',
  templateUrl: 'date-range-picker-forms-example.html',
})
export class DateRangePickerFormsExample {
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
}
