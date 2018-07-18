import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Host,
  Inject,
  OnDestroy
} from '@angular/core';
import {MatCalendar} from '@angular/material';
import {DateAdapter, MAT_DATE_FORMATS, MatDateFormats} from '@angular/material/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/** @title Datepicker with custom calendar header */
@Component({
  selector: 'datepicker-custom-header-example',
  templateUrl: 'datepicker-custom-header-example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerCustomHeaderExample {
  exampleHeader = ExampleHeader;
}

/** Custom header component for datepicker. */
@Component({
  selector: 'example-header',
  styles: [`
    .example-header {
      display: flex;
      align-items: center;
      padding: 0.5em;
    }

    .example-header-label {
      flex: 1;
      height: 1em;
      font-weight: 500;
      text-align: center;
    }

    .example-double-arrow .mat-icon {
      margin: -22%;
    }
  `],
  template: `
    <div class="example-header">
      <button mat-icon-button class="example-double-arrow" (click)="previousClicked('year')">
        <mat-icon>keyboard_arrow_left</mat-icon>
        <mat-icon>keyboard_arrow_left</mat-icon>
      </button>
      <button mat-icon-button (click)="previousClicked('month')">
        <mat-icon>keyboard_arrow_left</mat-icon>
      </button>
      <span class="example-header-label">{{periodLabel}}</span>
      <button mat-icon-button (click)="nextClicked('month')">
        <mat-icon>keyboard_arrow_right</mat-icon>
      </button>
      <button mat-icon-button class="example-double-arrow" (click)="nextClicked('year')">
        <mat-icon>keyboard_arrow_right</mat-icon>
        <mat-icon>keyboard_arrow_right</mat-icon>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleHeader<D> implements OnDestroy {
  private destroyed = new Subject<void>();

  constructor(@Host() private calendar: MatCalendar<D>,
              private dateAdapter: DateAdapter<D>,
              @Inject(MAT_DATE_FORMATS) private dateFormats: MatDateFormats,
              cdr: ChangeDetectorRef) {
    calendar.stateChanges
        .pipe(takeUntil(this.destroyed))
        .subscribe(() => cdr.markForCheck());
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  get periodLabel() {
    return this.dateAdapter
        .format(this.calendar.activeDate, this.dateFormats.display.monthYearLabel)
        .toLocaleUpperCase();
  }

  previousClicked(mode: 'month' | 'year') {
    this.calendar.activeDate = mode === 'month' ?
        this.dateAdapter.addCalendarMonths(this.calendar.activeDate, -1) :
        this.dateAdapter.addCalendarYears(this.calendar.activeDate, -1);
  }

  nextClicked(mode: 'month' | 'year') {
    this.calendar.activeDate = mode === 'month' ?
        this.dateAdapter.addCalendarMonths(this.calendar.activeDate, 1) :
        this.dateAdapter.addCalendarYears(this.calendar.activeDate, 1);
  }
}
