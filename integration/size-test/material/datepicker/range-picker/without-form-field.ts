import {Component, NgModule} from '@angular/core';
import {MatDatepickerModule} from '@angular/material/datepicker';

/**
 * Basic component using `MatDateRangePicker` with `MatDatepickerToggle`. Form fields
 * are optionally used in combination with the date-range input, so we expect that to
 * be tree-shaken away in this example. Similarly the standard datepicker input directive
 * should be omitted.
 */
@Component({
  template: `
    <mat-date-range-input [rangePicker]="picker">
      <input matStartDate>
      <input matEndDate>
    </mat-date-range-input>
    <mat-datepicker-toggle [for]="picker" matSuffix></mat-datepicker-toggle>
    <mat-date-range-picker #picker></mat-date-range-picker>
  `,
})
export class TestComponent {}

@NgModule({
  imports: [MatDatepickerModule],
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class AppModule {}
