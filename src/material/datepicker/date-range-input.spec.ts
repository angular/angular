import {Type, Component, ViewChild, ElementRef} from '@angular/core';
import {ComponentFixture, TestBed, inject, fakeAsync, tick} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule, FormGroup, FormControl} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {OverlayContainer} from '@angular/cdk/overlay';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from './datepicker-module';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {dispatchFakeEvent, dispatchKeyboardEvent} from '@angular/cdk/testing/private';
import {FocusMonitor} from '@angular/cdk/a11y';
import {BACKSPACE} from '@angular/cdk/keycodes';
import {MatDateRangeInput} from './date-range-input';
import {MatDateRangePicker} from './date-range-picker';

describe('MatDateRangeInput', () => {
  function createComponent<T>(component: Type<T>): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatNativeDateModule,
      ],
      declarations: [component],
    });

    return TestBed.createComponent(component);
  }

  afterEach(inject([OverlayContainer], (container: OverlayContainer) => {
    container.ngOnDestroy();
  }));

  it('should mirror the input value from the start into the mirror element', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const mirror = fixture.nativeElement.querySelector('.mat-date-range-input-mirror');
    const startInput = fixture.componentInstance.start.nativeElement;

    expect(mirror.textContent).toBe('Start date');

    startInput.value = 'hello';
    dispatchFakeEvent(startInput, 'input');
    fixture.detectChanges();
    expect(mirror.textContent).toBe('hello');

    startInput.value = 'h';
    dispatchFakeEvent(startInput, 'input');
    fixture.detectChanges();
    expect(mirror.textContent).toBe('h');

    startInput.value = '';
    dispatchFakeEvent(startInput, 'input');
    fixture.detectChanges();

    expect(mirror.textContent).toBe('Start date');
  });

  it('should hide the mirror value from assistive technology', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const mirror = fixture.nativeElement.querySelector('.mat-date-range-input-mirror');

    expect(mirror.getAttribute('aria-hidden')).toBe('true');
  });

  it('should be able to customize the separator', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const separator = fixture.nativeElement.querySelector('.mat-date-range-input-separator');

    expect(separator.textContent).toBe('–');

    fixture.componentInstance.separator = '/';
    fixture.detectChanges();

    expect(separator.textContent).toBe('/');
  });

  it('should set the proper type on the input elements', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();

    expect(fixture.componentInstance.start.nativeElement.getAttribute('type')).toBe('text');
    expect(fixture.componentInstance.end.nativeElement.getAttribute('type')).toBe('text');
  });

  it('should mark the entire range input as disabled if both inputs are disabled', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const {rangeInput, range, start, end} = fixture.componentInstance;

    expect(rangeInput.disabled).toBe(false);
    expect(start.nativeElement.disabled).toBe(false);
    expect(end.nativeElement.disabled).toBe(false);

    range.controls.start.disable();
    fixture.detectChanges();
    expect(rangeInput.disabled).toBe(false);
    expect(start.nativeElement.disabled).toBe(true);
    expect(end.nativeElement.disabled).toBe(false);

    range.controls.end.disable();
    fixture.detectChanges();
    expect(rangeInput.disabled).toBe(true);
    expect(start.nativeElement.disabled).toBe(true);
    expect(end.nativeElement.disabled).toBe(true);
  });

  it('should disable both inputs if the range is disabled', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const {start, end} = fixture.componentInstance;

    expect(start.nativeElement.disabled).toBe(false);
    expect(end.nativeElement.disabled).toBe(false);

    fixture.componentInstance.rangeDisabled = true;
    fixture.detectChanges();
    expect(start.nativeElement.disabled).toBe(true);
    expect(end.nativeElement.disabled).toBe(true);
  });

  it('should hide the placeholders once the start input has a value', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const hideClass = 'mat-date-range-input-hide-placeholders';
    const rangeInput = fixture.nativeElement.querySelector('.mat-date-range-input');
    const startInput = fixture.componentInstance.start.nativeElement;

    expect(rangeInput.classList).not.toContain(hideClass);

    startInput.value = 'hello';
    dispatchFakeEvent(startInput, 'input');
    fixture.detectChanges();

    expect(rangeInput.classList).toContain(hideClass);
  });

  it('should point the label aria-owns to the id of the start input', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('label');
    const start = fixture.componentInstance.start.nativeElement;

    expect(start.id).toBeTruthy();
    expect(label.getAttribute('aria-owns')).toBe(start.id);
  });

  it('should point the input aria-labelledby to the form field label', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const labelId = fixture.nativeElement.querySelector('label').id;
    const {start, end} = fixture.componentInstance;

    expect(labelId).toBeTruthy();
    expect(start.nativeElement.getAttribute('aria-labelledby')).toBe(labelId);
    expect(end.nativeElement.getAttribute('aria-labelledby')).toBe(labelId);
  });

  it('should point the input aria-labelledby to the form field hint element', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const labelId = fixture.nativeElement.querySelector('.mat-hint').id;
    const {start, end} = fixture.componentInstance;

    expect(labelId).toBeTruthy();
    expect(start.nativeElement.getAttribute('aria-describedby')).toBe(labelId);
    expect(end.nativeElement.getAttribute('aria-describedby')).toBe(labelId);
  });

  it('should float the form field label when either input is focused', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const {rangeInput, end} = fixture.componentInstance;
    let focusMonitor: FocusMonitor;

    inject([FocusMonitor], (fm: FocusMonitor) => {
      focusMonitor = fm;
    })();

    expect(rangeInput.shouldLabelFloat).toBe(false);

    focusMonitor!.focusVia(end, 'keyboard');
    fixture.detectChanges();

    expect(rangeInput.shouldLabelFloat).toBe(true);
  });

  it('should float the form field label when either input has a value', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const {rangeInput, end} = fixture.componentInstance;

    expect(rangeInput.shouldLabelFloat).toBe(false);

    end.nativeElement.value = 'hello';
    dispatchFakeEvent(end.nativeElement, 'input');
    fixture.detectChanges();

    expect(rangeInput.shouldLabelFloat).toBe(true);
  });

  it('should consider the entire input as empty if both inputs are empty', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const {rangeInput, end} = fixture.componentInstance;

    expect(rangeInput.empty).toBe(true);

    end.nativeElement.value = 'hello';
    dispatchFakeEvent(end.nativeElement, 'input');
    fixture.detectChanges();

    expect(rangeInput.empty).toBe(false);
  });

  it('should mark the range controls as invalid if the start value is after the end value',
    fakeAsync(() => {
      const fixture = createComponent(StandardRangePicker);
      fixture.detectChanges();
      tick();
      const {start, end} = fixture.componentInstance.range.controls;

      expect(fixture.componentInstance.rangeInput.errorState).toBe(false);
      expect(start.errors?.matStartDateInvalid).toBeFalsy();
      expect(end.errors?.matEndDateInvalid).toBeFalsy();

      start.setValue(new Date(2020, 2, 2));
      end.setValue(new Date(2020, 1, 2));
      fixture.detectChanges();

      expect(fixture.componentInstance.rangeInput.errorState).toBe(true);
      expect(start.errors?.matStartDateInvalid).toBeTruthy();
      expect(end.errors?.matEndDateInvalid).toBeTruthy();
    }));

  it('should pass the minimum date from the range input to the inner inputs', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.componentInstance.minDate = new Date(2020, 3, 2);
    fixture.detectChanges();
    const {start, end} = fixture.componentInstance.range.controls;

    expect(start.errors?.matDatepickerMin).toBeFalsy();
    expect(end.errors?.matDatepickerMin).toBeFalsy();

    const date = new Date(2020, 2, 2);
    start.setValue(date);
    end.setValue(date);
    fixture.detectChanges();

    expect(start.errors?.matDatepickerMin).toBeTruthy();
    expect(end.errors?.matDatepickerMin).toBeTruthy();
  });

  it('should pass the maximum date from the range input to the inner inputs', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.componentInstance.maxDate = new Date(2020, 1, 2);
    fixture.detectChanges();
    const {start, end} = fixture.componentInstance.range.controls;

    expect(start.errors?.matDatepickerMax).toBeFalsy();
    expect(end.errors?.matDatepickerMax).toBeFalsy();

    const date = new Date(2020, 2, 2);
    start.setValue(date);
    end.setValue(date);
    fixture.detectChanges();

    expect(start.errors?.matDatepickerMax).toBeTruthy();
    expect(end.errors?.matDatepickerMax).toBeTruthy();
  });

  it('should pass the date filter function from the range input to the inner inputs', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.componentInstance.dateFilter = () => false;
    fixture.detectChanges();
    const {start, end} = fixture.componentInstance.range.controls;

    expect(start.errors?.matDatepickerFilter).toBeFalsy();
    expect(end.errors?.matDatepickerFilter).toBeFalsy();

    const date = new Date(2020, 2, 2);
    start.setValue(date);
    end.setValue(date);
    fixture.detectChanges();

    expect(start.errors?.matDatepickerFilter).toBeTruthy();
    expect(end.errors?.matDatepickerFilter).toBeTruthy();
  });

  it('should throw if there is no start input', () => {
    expect(() => {
      const fixture = createComponent(RangePickerNoStart);
      fixture.detectChanges();
    }).toThrowError('mat-date-range-input must contain a matStartDate input');
  });

  it('should throw if there is no end input', () => {
    expect(() => {
      const fixture = createComponent(RangePickerNoEnd);
      fixture.detectChanges();
    }).toThrowError('mat-date-range-input must contain a matEndDate input');
  });

  it('should focus the start input when clicking on the form field', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const startInput = fixture.componentInstance.start.nativeElement;
    const formFieldContainer = fixture.nativeElement.querySelector('.mat-form-field-flex');

    spyOn(startInput, 'focus').and.callThrough();

    formFieldContainer.click();
    fixture.detectChanges();

    expect(startInput.focus).toHaveBeenCalled();
  });

  it('should focus the end input when clicking on the form field when start has a value',
    fakeAsync(() => {
      const fixture = createComponent(StandardRangePicker);
      fixture.detectChanges();
      tick();
      const endInput = fixture.componentInstance.end.nativeElement;
      const formFieldContainer = fixture.nativeElement.querySelector('.mat-form-field-flex');

      spyOn(endInput, 'focus').and.callThrough();

      fixture.componentInstance.range.controls.start.setValue(new Date());
      fixture.detectChanges();

      formFieldContainer.click();
      fixture.detectChanges();
      tick();

      expect(endInput.focus).toHaveBeenCalled();
    }));

  it('should revalidate if a validation field changes', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.componentInstance.minDate = new Date(2020, 3, 2);
    fixture.detectChanges();
    const {start, end} = fixture.componentInstance.range.controls;

    const date = new Date(2020, 2, 2);
    start.setValue(date);
    end.setValue(date);
    fixture.detectChanges();

    expect(start.errors?.matDatepickerMin).toBeTruthy();
    expect(end.errors?.matDatepickerMin).toBeTruthy();

    fixture.componentInstance.minDate = new Date(2019, 3, 2);
    fixture.detectChanges();

    expect(start.errors?.matDatepickerMin).toBeFalsy();
    expect(end.errors?.matDatepickerMin).toBeFalsy();
  });

  it('should set the formatted date value as the input value', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.componentInstance.minDate = new Date(2020, 3, 2);
    fixture.detectChanges();
    const date = new Date(2020, 1, 2);
    const {start, end, range} = fixture.componentInstance;

    range.controls.start.setValue(date);
    range.controls.end.setValue(date);
    fixture.detectChanges();

    expect(start.nativeElement.value).toBe('2/2/2020');
    expect(end.nativeElement.value).toBe('2/2/2020');
  });

  it('should parse the value typed into an input to a date', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const expectedDate = new Date(2020, 1, 2);
    const {start, end, range} = fixture.componentInstance;

    start.nativeElement.value = '2/2/2020';
    dispatchFakeEvent(start.nativeElement, 'input');
    fixture.detectChanges();
    expect(range.controls.start.value).toEqual(expectedDate);

    end.nativeElement.value = '2/2/2020';
    dispatchFakeEvent(end.nativeElement, 'input');
    fixture.detectChanges();
    expect(range.controls.end.value).toEqual(expectedDate);
  });

  it('should set the min and max attributes on inputs based on the values from the wrapper', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.componentInstance.minDate = new Date(2020, 1, 2);
    fixture.componentInstance.maxDate = new Date(2020, 1, 2);
    fixture.detectChanges();
    const {start, end} = fixture.componentInstance;

    // Use `toContain` for the asserts here, because different browsers format the value
    // differently and we only care that some kind of date value made it to the attribute.
    expect(start.nativeElement.getAttribute('min')).toContain('2020');
    expect(start.nativeElement.getAttribute('max')).toContain('2020');

    expect(end.nativeElement.getAttribute('min')).toContain('2020');
    expect(end.nativeElement.getAttribute('max')).toContain('2020');
  });

  it('should pass the range input value through to the calendar', fakeAsync(() => {
    const fixture = createComponent(StandardRangePicker);
    const {start, end} = fixture.componentInstance.range.controls;
    let overlayContainerElement: HTMLElement;
    start.setValue(new Date(2020, 1, 2));
    end.setValue(new Date(2020, 1, 5));
    inject([OverlayContainer], (overlayContainer: OverlayContainer) => {
      overlayContainerElement = overlayContainer.getContainerElement();
    })();
    fixture.detectChanges();
    tick();

    fixture.componentInstance.rangePicker.open();
    fixture.detectChanges();
    tick();

    const rangeTexts = Array.from(overlayContainerElement!.querySelectorAll([
      '.mat-calendar-body-range-start',
      '.mat-calendar-body-in-range',
      '.mat-calendar-body-range-end'
    ].join(','))).map(cell => cell.textContent!.trim());

    expect(rangeTexts).toEqual(['2', '3', '4', '5']);
  }));

  it('should pass the comparison range through to the calendar', fakeAsync(() => {
    const fixture = createComponent(StandardRangePicker);
    let overlayContainerElement: HTMLElement;

    // Set startAt to guarantee that the calendar opens on the proper month.
    fixture.componentInstance.comparisonStart =
        fixture.componentInstance.startAt = new Date(2020, 1, 2);
    fixture.componentInstance.comparisonEnd = new Date(2020, 1, 5);
    inject([OverlayContainer], (overlayContainer: OverlayContainer) => {
      overlayContainerElement = overlayContainer.getContainerElement();
    })();
    fixture.detectChanges();

    fixture.componentInstance.rangePicker.open();
    fixture.detectChanges();
    tick();

    const rangeTexts = Array.from(overlayContainerElement!.querySelectorAll([
      '.mat-calendar-body-comparison-start',
      '.mat-calendar-body-in-comparison-range',
      '.mat-calendar-body-comparison-end'
    ].join(','))).map(cell => cell.textContent!.trim());

    expect(rangeTexts).toEqual(['2', '3', '4', '5']);
  }));

  it('should preserve the preselected values when assigning through ngModel', fakeAsync(() => {
    const start = new Date(2020, 1, 2);
    const end = new Date(2020, 1, 2);
    const fixture = createComponent(RangePickerNgModel);
    fixture.componentInstance.start = start;
    fixture.componentInstance.end = end;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(fixture.componentInstance.start).toBe(start);
    expect(fixture.componentInstance.end).toBe(end);
  }));

  it('should preserve the values when assigning both together through ngModel', fakeAsync(() => {
    const assignAndAssert = (start: Date, end: Date) => {
      fixture.componentInstance.start = start;
      fixture.componentInstance.end = end;
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      expect(fixture.componentInstance.start).toBe(start);
      expect(fixture.componentInstance.end).toBe(end);
    };

    const fixture = createComponent(RangePickerNgModel);
    fixture.detectChanges();

    assignAndAssert(new Date(2020, 1, 2), new Date(2020, 1, 5));
    assignAndAssert(new Date(2020, 2, 2), new Date(2020, 2, 5));
  }));

  it('should move focus to the start input when pressing backspace on an empty end input', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const {start, end} = fixture.componentInstance;

    spyOn(start.nativeElement, 'focus').and.callThrough();

    end.nativeElement.value = '';
    dispatchKeyboardEvent(end.nativeElement, 'keydown', BACKSPACE);
    fixture.detectChanges();

    expect(start.nativeElement.focus).toHaveBeenCalled();
  });

  it('should move not move focus when pressing backspace if the end input has a value', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const {start, end} = fixture.componentInstance;

    spyOn(start.nativeElement, 'focus').and.callThrough();

    end.nativeElement.value = '10/10/2020';
    dispatchKeyboardEvent(end.nativeElement, 'keydown', BACKSPACE);
    fixture.detectChanges();

    expect(start.nativeElement.focus).not.toHaveBeenCalled();
  });

  it('should be able to get the input placeholder', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    expect(fixture.componentInstance.rangeInput.placeholder).toBe('Start date – End date');
  });

});

@Component({
  template: `
    <mat-form-field hintLabel="Pick between a start and an end">
      <mat-label>Enter a date</mat-label>
      <mat-date-range-input
        [rangePicker]="rangePicker"
        [formGroup]="range"
        [disabled]="rangeDisabled"
        [separator]="separator"
        [min]="minDate"
        [max]="maxDate"
        [dateFilter]="dateFilter"
        [comparisonStart]="comparisonStart"
        [comparisonEnd]="comparisonEnd">
        <input #start formControlName="start" matStartDate placeholder="Start date"/>
        <input #end formControlName="end" matEndDate placeholder="End date"/>
      </mat-date-range-input>

      <mat-date-range-picker
        [startAt]="startAt"
        #rangePicker></mat-date-range-picker>
    </mat-form-field>
  `
})
class StandardRangePicker {
  @ViewChild('start') start: ElementRef<HTMLInputElement>;
  @ViewChild('end') end: ElementRef<HTMLInputElement>;
  @ViewChild(MatDateRangeInput) rangeInput: MatDateRangeInput<Date>;
  @ViewChild(MatDateRangePicker) rangePicker: MatDateRangePicker<Date>;
  separator = '–';
  rangeDisabled = false;
  minDate: Date | null = null;
  maxDate: Date | null = null;
  comparisonStart: Date | null = null;
  comparisonEnd: Date | null = null;
  startAt: Date | null = null;
  dateFilter = () => true;

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
}

@Component({
  template: `
    <mat-form-field>
      <mat-date-range-input [rangePicker]="rangePicker">
        <input matEndDate/>
      </mat-date-range-input>

      <mat-date-range-picker #rangePicker></mat-date-range-picker>
    </mat-form-field>
  `
})
class RangePickerNoStart {}

@Component({
  template: `
    <mat-form-field>
      <mat-date-range-input [rangePicker]="rangePicker">
        <input matStartDate/>
      </mat-date-range-input>

      <mat-date-range-picker #rangePicker></mat-date-range-picker>
    </mat-form-field>
  `
})
class RangePickerNoEnd {}


@Component({
  template: `
    <mat-form-field>
      <mat-date-range-input [rangePicker]="rangePicker">
        <input matStartDate [(ngModel)]="start"/>
        <input matEndDate [(ngModel)]="end"/>
      </mat-date-range-input>

      <mat-date-range-picker #rangePicker></mat-date-range-picker>
    </mat-form-field>
  `
})
class RangePickerNgModel {
  start: Date | null = null;
  end: Date | null = null;
}

