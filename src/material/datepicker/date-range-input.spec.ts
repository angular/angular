import {Type, Component, ViewChild, ElementRef, Directive, Provider} from '@angular/core';
import {ComponentFixture, TestBed, inject, fakeAsync, tick, flush} from '@angular/core/testing';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  NG_VALIDATORS,
  Validator,
  NgModel,
} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Directionality} from '@angular/cdk/bidi';
import {OverlayContainer} from '@angular/cdk/overlay';
import {ErrorStateMatcher, MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from './datepicker-module';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {dispatchFakeEvent, dispatchKeyboardEvent} from '../../cdk/testing/private';
import {FocusMonitor} from '@angular/cdk/a11y';
import {BACKSPACE, LEFT_ARROW, RIGHT_ARROW} from '@angular/cdk/keycodes';
import {MatDateRangeInput} from './date-range-input';
import {MatDateRangePicker} from './date-range-picker';
import {MatStartDate, MatEndDate} from './date-range-input-parts';
import {Subscription} from 'rxjs';

describe('MatDateRangeInput', () => {
  function createComponent<T>(
    component: Type<T>,
    declarations: Type<any>[] = [],
    providers: Provider[] = [],
  ): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatDatepickerModule,
        MatLegacyFormFieldModule,
        MatLegacyInputModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatNativeDateModule,
      ],
      providers,
      declarations: [component, ...declarations],
    });

    return TestBed.createComponent(component);
  }

  it('should mirror the input value from the start into the mirror element', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const mirror = fixture.nativeElement.querySelector('.mat-date-range-input-mirror');
    const startInput = fixture.componentInstance.start.nativeElement;

    expect(mirror.textContent).toBe('Start Date');

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

    expect(mirror.textContent).toBe('Start Date');
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

  it('should set the correct role on the range input', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const rangeInput = fixture.nativeElement.querySelector('.mat-date-range-input');
    expect(rangeInput.getAttribute('role')).toBe('group');
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

  it('should point the label aria-owns to the <mat-date-range-input/>', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('label.mat-form-field-label');
    const rangeInput = fixture.componentInstance.rangeInput;

    expect(rangeInput.id).toBeTruthy();
    expect(label.getAttribute('aria-owns')).toBe(rangeInput.id);
  });

  it('should point the range input aria-labelledby to the form field label', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const labelId = fixture.nativeElement.querySelector('label.mat-form-field-label').id;
    const rangeInput = fixture.nativeElement.querySelector('.mat-date-range-input');

    expect(labelId).toBeTruthy();
    expect(rangeInput.getAttribute('aria-labelledby')).toBe(labelId);
  });

  it('should point the range input aria-labelledby to the form field hint element', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const labelId = fixture.nativeElement.querySelector('.mat-hint').id;
    const rangeInput = fixture.nativeElement.querySelector('.mat-date-range-input');

    expect(labelId).toBeTruthy();
    expect(rangeInput.getAttribute('aria-describedby')).toBe(labelId);
  });

  it('should not set aria-labelledby if the form field does not have a label', () => {
    const fixture = createComponent(RangePickerNoLabel);
    fixture.detectChanges();
    const {start, end} = fixture.componentInstance;

    expect(start.nativeElement.getAttribute('aria-labelledby')).toBeFalsy();
    expect(end.nativeElement.getAttribute('aria-labelledby')).toBeFalsy();
  });

  it('should set aria-labelledby of the overlay to the form field label', fakeAsync(() => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();

    const label: HTMLElement = fixture.nativeElement.querySelector('.mat-form-field-label');
    expect(label).toBeTruthy();
    expect(label.getAttribute('id')).toBeTruthy();

    fixture.componentInstance.rangePicker.open();
    fixture.detectChanges();
    tick();

    const popup = document.querySelector('.cdk-overlay-pane .mat-datepicker-content-container')!;
    expect(popup).toBeTruthy();
    expect(popup.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'));
  }));

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

  it('should mark the range controls as invalid if the start value is after the end value', fakeAsync(() => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    tick();
    const {start, end} = fixture.componentInstance.range.controls;

    // The default error state matcher only checks if the controls have been touched.
    // Set it manually here so we can assert `rangeInput.errorState` correctly.
    fixture.componentInstance.range.markAllAsTouched();
    expect(fixture.componentInstance.rangeInput.errorState).toBe(false);
    expect(start.errors?.matStartDateInvalid).toBeFalsy();
    expect(end.errors?.matEndDateInvalid).toBeFalsy();

    start.setValue(new Date(2020, 2, 2));
    end.setValue(new Date(2020, 1, 2));
    fixture.detectChanges();

    expect(fixture.componentInstance.rangeInput.errorState).toBe(true);
    expect(start.errors?.matStartDateInvalid).toBeTruthy();
    expect(end.errors?.matEndDateInvalid).toBeTruthy();

    end.setValue(new Date(2020, 3, 2));
    fixture.detectChanges();

    expect(fixture.componentInstance.rangeInput.errorState).toBe(false);
    expect(start.errors?.matStartDateInvalid).toBeFalsy();
    expect(end.errors?.matEndDateInvalid).toBeFalsy();
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

  it('should should revalidate when a new date filter function is assigned', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const {start, end} = fixture.componentInstance.range.controls;
    const date = new Date(2020, 2, 2);
    start.setValue(date);
    end.setValue(date);
    fixture.detectChanges();

    const spy = jasmine.createSpy('change spy');
    const subscription = new Subscription();
    subscription.add(start.valueChanges.subscribe(spy));
    subscription.add(end.valueChanges.subscribe(spy));

    fixture.componentInstance.dateFilter = () => false;
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(2);

    fixture.componentInstance.dateFilter = () => true;
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(4);

    subscription.unsubscribe();
  });

  it(
    'should not dispatch the change event if a new filter function with the same result ' +
      'is assigned',
    () => {
      const fixture = createComponent(StandardRangePicker);
      fixture.detectChanges();
      const {start, end} = fixture.componentInstance.range.controls;
      const date = new Date(2020, 2, 2);
      start.setValue(date);
      end.setValue(date);
      fixture.detectChanges();

      const spy = jasmine.createSpy('change spy');
      const subscription = new Subscription();
      subscription.add(start.valueChanges.subscribe(spy));
      subscription.add(end.valueChanges.subscribe(spy));

      fixture.componentInstance.dateFilter = () => false;
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledTimes(2);

      fixture.componentInstance.dateFilter = () => false;
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledTimes(2);

      subscription.unsubscribe();
    },
  );

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

  it('should focus the end input when clicking on the form field when start has a value', fakeAsync(() => {
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

    const rangeTexts = Array.from(
      overlayContainerElement!.querySelectorAll(
        [
          '.mat-calendar-body-range-start',
          '.mat-calendar-body-in-range',
          '.mat-calendar-body-range-end',
        ].join(','),
      ),
    ).map(cell => cell.textContent!.trim());

    expect(rangeTexts).toEqual(['2', '3', '4', '5']);
  }));

  it("should have aria-desciredby on start and end date cells that point to the <input/>'s accessible name", fakeAsync(() => {
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

    const rangeStart = overlayContainerElement!.querySelector('.mat-calendar-body-range-start');
    const rangeEnd = overlayContainerElement!.querySelector('.mat-calendar-body-range-end');

    // query for targets of `aria-describedby`. Query from document instead of fixture.nativeElement as calendar UI is rendered in an overlay.
    const rangeStartDescriptions = Array.from(
      document.querySelectorAll(
        rangeStart!
          .getAttribute('aria-describedby')!
          .split(/\s+/g)
          .map(x => `#${x}`)
          .join(' '),
      ),
    );
    const rangeEndDescriptions = Array.from(
      document.querySelectorAll(
        rangeEnd!
          .getAttribute('aria-describedby')!
          .split(/\s+/g)
          .map(x => `#${x}`)
          .join(' '),
      ),
    );

    expect(rangeStartDescriptions)
      .withContext('target of aria-descriedby should exist')
      .not.toBeNull();
    expect(rangeEndDescriptions)
      .withContext('target of aria-descriedby should exist')
      .not.toBeNull();
    expect(
      rangeStartDescriptions
        .map(x => x.textContent)
        .join(' ')
        .trim(),
    ).toEqual('Start date');
    expect(
      rangeEndDescriptions
        .map(x => x.textContent)
        .join(' ')
        .trim(),
    ).toEqual('End date');
  }));

  it('should pass the comparison range through to the calendar', fakeAsync(() => {
    const fixture = createComponent(StandardRangePicker);
    let overlayContainerElement: HTMLElement;

    // Set startAt to guarantee that the calendar opens on the proper month.
    fixture.componentInstance.comparisonStart = fixture.componentInstance.startAt = new Date(
      2020,
      1,
      2,
    );
    fixture.componentInstance.comparisonEnd = new Date(2020, 1, 5);
    inject([OverlayContainer], (overlayContainer: OverlayContainer) => {
      overlayContainerElement = overlayContainer.getContainerElement();
    })();
    fixture.detectChanges();

    fixture.componentInstance.rangePicker.open();
    fixture.detectChanges();
    tick();

    const rangeTexts = Array.from(
      overlayContainerElement!.querySelectorAll(
        [
          '.mat-calendar-body-comparison-start',
          '.mat-calendar-body-in-comparison-range',
          '.mat-calendar-body-comparison-end',
        ].join(','),
      ),
    ).map(cell => cell.textContent!.trim());

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

  it('should not be dirty on init when there is no value', fakeAsync(() => {
    const fixture = createComponent(RangePickerNgModel);
    fixture.detectChanges();
    flush();
    const {startModel, endModel} = fixture.componentInstance;

    expect(startModel.dirty).toBe(false);
    expect(startModel.touched).toBe(false);
    expect(endModel.dirty).toBe(false);
    expect(endModel.touched).toBe(false);
  }));

  it('should not be dirty on init when there is a value', fakeAsync(() => {
    const fixture = createComponent(RangePickerNgModel);
    fixture.componentInstance.start = new Date(2020, 1, 2);
    fixture.componentInstance.end = new Date(2020, 2, 2);
    fixture.detectChanges();
    flush();
    const {startModel, endModel} = fixture.componentInstance;

    expect(startModel.dirty).toBe(false);
    expect(startModel.touched).toBe(false);
    expect(endModel.dirty).toBe(false);
    expect(endModel.touched).toBe(false);
  }));

  it('should mark the input as dirty once the user types in it', fakeAsync(() => {
    const fixture = createComponent(RangePickerNgModel);
    fixture.componentInstance.start = new Date(2020, 1, 2);
    fixture.componentInstance.end = new Date(2020, 2, 2);
    fixture.detectChanges();
    flush();
    const {startModel, endModel, startInput, endInput} = fixture.componentInstance;

    expect(startModel.dirty).toBe(false);
    expect(endModel.dirty).toBe(false);

    endInput.nativeElement.value = '30/12/2020';
    dispatchFakeEvent(endInput.nativeElement, 'input');
    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    expect(startModel.dirty).toBe(false);
    expect(endModel.dirty).toBe(true);

    startInput.nativeElement.value = '12/12/2020';
    dispatchFakeEvent(startInput.nativeElement, 'input');
    fixture.detectChanges();
    flush();
    fixture.detectChanges();

    expect(startModel.dirty).toBe(true);
    expect(endModel.dirty).toBe(true);
  }));

  it('should mark both inputs as touched when the range picker is closed', fakeAsync(() => {
    const fixture = createComponent(RangePickerNgModel);
    fixture.detectChanges();
    flush();
    const {startModel, endModel, rangePicker} = fixture.componentInstance;

    expect(startModel.dirty).toBe(false);
    expect(startModel.touched).toBe(false);
    expect(endModel.dirty).toBe(false);
    expect(endModel.touched).toBe(false);

    rangePicker.open();
    fixture.detectChanges();
    tick();
    flush();

    expect(startModel.dirty).toBe(false);
    expect(startModel.touched).toBe(false);
    expect(endModel.dirty).toBe(false);
    expect(endModel.touched).toBe(false);

    rangePicker.close();
    fixture.detectChanges();
    flush();

    expect(startModel.dirty).toBe(false);
    expect(startModel.touched).toBe(true);
    expect(endModel.dirty).toBe(false);
    expect(endModel.touched).toBe(true);
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

  it('moves focus between fields with arrow keys when cursor is at edge (LTR)', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const {start, end} = fixture.componentInstance;

    start.nativeElement.value = '09/10/2020';
    end.nativeElement.value = '10/10/2020';

    start.nativeElement.focus();
    start.nativeElement.setSelectionRange(9, 9);
    dispatchKeyboardEvent(start.nativeElement, 'keydown', RIGHT_ARROW);
    fixture.detectChanges();
    expect(document.activeElement).toBe(start.nativeElement);

    start.nativeElement.setSelectionRange(10, 10);
    dispatchKeyboardEvent(start.nativeElement, 'keydown', LEFT_ARROW);
    fixture.detectChanges();
    expect(document.activeElement).toBe(start.nativeElement);

    start.nativeElement.setSelectionRange(10, 10);
    dispatchKeyboardEvent(start.nativeElement, 'keydown', RIGHT_ARROW);
    fixture.detectChanges();
    expect(document.activeElement).toBe(end.nativeElement);

    end.nativeElement.setSelectionRange(1, 1);
    dispatchKeyboardEvent(end.nativeElement, 'keydown', LEFT_ARROW);
    fixture.detectChanges();
    expect(document.activeElement).toBe(end.nativeElement);

    end.nativeElement.setSelectionRange(0, 0);
    dispatchKeyboardEvent(end.nativeElement, 'keydown', RIGHT_ARROW);
    fixture.detectChanges();
    expect(document.activeElement).toBe(end.nativeElement);

    end.nativeElement.setSelectionRange(0, 0);
    dispatchKeyboardEvent(end.nativeElement, 'keydown', LEFT_ARROW);
    fixture.detectChanges();
    expect(document.activeElement).toBe(start.nativeElement);
  });

  it('moves focus between fields with arrow keys when cursor is at edge (RTL)', () => {
    class RTL extends Directionality {
      override readonly value = 'rtl';
    }
    const fixture = createComponent(
      StandardRangePicker,
      [],
      [
        {
          provide: Directionality,
          useFactory: () => new RTL(null),
        },
      ],
    );
    fixture.detectChanges();
    const {start, end} = fixture.componentInstance;

    start.nativeElement.value = '09/10/2020';
    end.nativeElement.value = '10/10/2020';

    start.nativeElement.focus();
    start.nativeElement.setSelectionRange(9, 9);
    dispatchKeyboardEvent(start.nativeElement, 'keydown', LEFT_ARROW);
    fixture.detectChanges();
    expect(document.activeElement).toBe(start.nativeElement);

    start.nativeElement.setSelectionRange(10, 10);
    dispatchKeyboardEvent(start.nativeElement, 'keydown', RIGHT_ARROW);
    fixture.detectChanges();
    expect(document.activeElement).toBe(start.nativeElement);

    start.nativeElement.setSelectionRange(10, 10);
    dispatchKeyboardEvent(start.nativeElement, 'keydown', LEFT_ARROW);
    fixture.detectChanges();
    expect(document.activeElement).toBe(end.nativeElement);

    end.nativeElement.setSelectionRange(1, 1);
    dispatchKeyboardEvent(end.nativeElement, 'keydown', RIGHT_ARROW);
    fixture.detectChanges();
    expect(document.activeElement).toBe(end.nativeElement);

    end.nativeElement.setSelectionRange(0, 0);
    dispatchKeyboardEvent(end.nativeElement, 'keydown', LEFT_ARROW);
    fixture.detectChanges();
    expect(document.activeElement).toBe(end.nativeElement);

    end.nativeElement.setSelectionRange(0, 0);
    dispatchKeyboardEvent(end.nativeElement, 'keydown', RIGHT_ARROW);
    fixture.detectChanges();
    expect(document.activeElement).toBe(start.nativeElement);
  });

  it('should be able to get the input placeholder', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    expect(fixture.componentInstance.rangeInput.placeholder).toBe('Start Date – End Date');
  });

  it('should emit to the stateChanges stream when typing a value into an input', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const {start, rangeInput} = fixture.componentInstance;
    const spy = jasmine.createSpy('stateChanges spy');
    const subscription = rangeInput.stateChanges.subscribe(spy);

    start.nativeElement.value = '10/10/2020';
    dispatchFakeEvent(start.nativeElement, 'input');
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('should emit to the dateChange event only when typing in the relevant input', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const {startInput, endInput, start, end} = fixture.componentInstance;
    const startSpy = jasmine.createSpy('matStartDate spy');
    const endSpy = jasmine.createSpy('matEndDate spy');
    const startSubscription = startInput.dateChange.subscribe(startSpy);
    const endSubscription = endInput.dateChange.subscribe(endSpy);

    start.nativeElement.value = '10/10/2020';
    dispatchFakeEvent(start.nativeElement, 'change');
    fixture.detectChanges();

    expect(startSpy).toHaveBeenCalledTimes(1);
    expect(endSpy).not.toHaveBeenCalled();

    start.nativeElement.value = '11/10/2020';
    dispatchFakeEvent(start.nativeElement, 'change');
    fixture.detectChanges();

    expect(startSpy).toHaveBeenCalledTimes(2);
    expect(endSpy).not.toHaveBeenCalled();

    end.nativeElement.value = '11/10/2020';
    dispatchFakeEvent(end.nativeElement, 'change');
    fixture.detectChanges();

    expect(startSpy).toHaveBeenCalledTimes(2);
    expect(endSpy).toHaveBeenCalledTimes(1);

    end.nativeElement.value = '12/10/2020';
    dispatchFakeEvent(end.nativeElement, 'change');
    fixture.detectChanges();

    expect(startSpy).toHaveBeenCalledTimes(2);
    expect(endSpy).toHaveBeenCalledTimes(2);

    startSubscription.unsubscribe();
    endSubscription.unsubscribe();
  });

  it('should emit to the dateChange event when setting the value programmatically', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();
    const {startInput, endInput} = fixture.componentInstance;
    const {start, end} = fixture.componentInstance.range.controls;
    const startSpy = jasmine.createSpy('matStartDate spy');
    const endSpy = jasmine.createSpy('matEndDate spy');
    const startSubscription = startInput.dateChange.subscribe(startSpy);
    const endSubscription = endInput.dateChange.subscribe(endSpy);

    start.setValue(new Date(2020, 1, 2));
    end.setValue(new Date(2020, 2, 2));
    fixture.detectChanges();

    expect(startSpy).not.toHaveBeenCalled();
    expect(endSpy).not.toHaveBeenCalled();

    start.setValue(new Date(2020, 3, 2));
    end.setValue(new Date(2020, 4, 2));
    fixture.detectChanges();

    expect(startSpy).not.toHaveBeenCalled();
    expect(endSpy).not.toHaveBeenCalled();

    startSubscription.unsubscribe();
    endSubscription.unsubscribe();
  });

  it('should not trigger validators if new date object for same date is set for `min`', () => {
    const fixture = createComponent(RangePickerWithCustomValidator, [CustomValidator]);
    fixture.detectChanges();
    const minDate = new Date(2019, 0, 1);
    const validator = fixture.componentInstance.validator;

    validator.validate.calls.reset();
    fixture.componentInstance.min = minDate;
    fixture.detectChanges();
    expect(validator.validate).toHaveBeenCalledTimes(1);

    fixture.componentInstance.min = new Date(minDate);
    fixture.detectChanges();

    expect(validator.validate).toHaveBeenCalledTimes(1);
  });

  it('should not trigger validators if new date object for same date is set for `max`', () => {
    const fixture = createComponent(RangePickerWithCustomValidator, [CustomValidator]);
    fixture.detectChanges();
    const maxDate = new Date(2120, 0, 1);
    const validator = fixture.componentInstance.validator;

    validator.validate.calls.reset();
    fixture.componentInstance.max = maxDate;
    fixture.detectChanges();
    expect(validator.validate).toHaveBeenCalledTimes(1);

    fixture.componentInstance.max = new Date(maxDate);
    fixture.detectChanges();

    expect(validator.validate).toHaveBeenCalledTimes(1);
  });

  it('should not emit to `stateChanges` if new date object for same date is set for `min`', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();

    const minDate = new Date(2019, 0, 1);
    const spy = jasmine.createSpy('stateChanges spy');
    const subscription = fixture.componentInstance.rangeInput.stateChanges.subscribe(spy);

    fixture.componentInstance.minDate = minDate;
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);

    fixture.componentInstance.minDate = new Date(minDate);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);

    subscription.unsubscribe();
  });

  it('should not emit to `stateChanges` if new date object for same date is set for `max`', () => {
    const fixture = createComponent(StandardRangePicker);
    fixture.detectChanges();

    const maxDate = new Date(2120, 0, 1);
    const spy = jasmine.createSpy('stateChanges spy');
    const subscription = fixture.componentInstance.rangeInput.stateChanges.subscribe(spy);

    fixture.componentInstance.maxDate = maxDate;
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);

    fixture.componentInstance.maxDate = new Date(maxDate);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);

    subscription.unsubscribe();
  });

  it('should be able to pass in a different error state matcher through an input', () => {
    const fixture = createComponent(RangePickerErrorStateMatcher);
    fixture.detectChanges();
    const {startInput, endInput, matcher} = fixture.componentInstance;

    expect(startInput.errorStateMatcher).toBe(matcher);
    expect(endInput.errorStateMatcher).toBe(matcher);
  });

  it('should only update model for input that changed', fakeAsync(() => {
    const fixture = createComponent(RangePickerNgModel);

    fixture.detectChanges();
    tick();

    expect(fixture.componentInstance.startDateModelChangeCount).toBe(0);
    expect(fixture.componentInstance.endDateModelChangeCount).toBe(0);

    fixture.componentInstance.rangePicker.open();
    fixture.detectChanges();
    tick();

    const fromDate = new Date(2020, 0, 1);
    const toDate = new Date(2020, 0, 2);
    fixture.componentInstance.rangePicker.select(fromDate);
    fixture.detectChanges();
    tick();

    expect(fixture.componentInstance.startDateModelChangeCount)
      .withContext('Start Date set once')
      .toBe(1);
    expect(fixture.componentInstance.endDateModelChangeCount)
      .withContext('End Date not set')
      .toBe(0);

    fixture.componentInstance.rangePicker.select(toDate);
    fixture.detectChanges();
    tick();

    expect(fixture.componentInstance.startDateModelChangeCount)
      .withContext('Start Date unchanged (set once)')
      .toBe(1);
    expect(fixture.componentInstance.endDateModelChangeCount)
      .withContext('End Date set once')
      .toBe(1);

    fixture.componentInstance.rangePicker.open();
    fixture.detectChanges();
    tick();

    const fromDate2 = new Date(2021, 0, 1);
    const toDate2 = new Date(2021, 0, 2);
    fixture.componentInstance.rangePicker.select(fromDate2);
    fixture.detectChanges();
    tick();

    expect(fixture.componentInstance.startDateModelChangeCount)
      .withContext('Start Date set twice')
      .toBe(2);
    expect(fixture.componentInstance.endDateModelChangeCount)
      .withContext('End Date set twice (nulled)')
      .toBe(2);

    fixture.componentInstance.rangePicker.select(toDate2);
    fixture.detectChanges();
    tick();

    expect(fixture.componentInstance.startDateModelChangeCount)
      .withContext('Start Date unchanged (set twice)')
      .toBe(2);
    expect(fixture.componentInstance.endDateModelChangeCount)
      .withContext('End date set three times')
      .toBe(3);
  }));
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
        <input #start formControlName="start" matStartDate aria-label="Start date"
          placeholder="Start Date"/>
        <input #end formControlName="end" matEndDate aria-labelledby="end-date-label-1 end-date-label-2"
          placeholder="End Date"/>
      </mat-date-range-input>
      <label id='end-date-label-1' class="cdk-visually-hidden">End</label>
      <label id='end-date-label-2' class="cdk-visually-hidden">date</label>

      <mat-date-range-picker
        [startAt]="startAt"
        #rangePicker></mat-date-range-picker>
    </mat-form-field>
  `,
})
class StandardRangePicker {
  @ViewChild('start') start: ElementRef<HTMLInputElement>;
  @ViewChild('end') end: ElementRef<HTMLInputElement>;
  @ViewChild(MatStartDate) startInput: MatStartDate<Date>;
  @ViewChild(MatEndDate) endInput: MatEndDate<Date>;
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
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
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
  `,
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
  `,
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
  `,
})
class RangePickerNgModel {
  @ViewChild(MatStartDate, {read: NgModel}) startModel: NgModel;
  @ViewChild(MatEndDate, {read: NgModel}) endModel: NgModel;
  @ViewChild(MatStartDate, {read: ElementRef}) startInput: ElementRef<HTMLInputElement>;
  @ViewChild(MatEndDate, {read: ElementRef}) endInput: ElementRef<HTMLInputElement>;
  @ViewChild(MatDateRangePicker) rangePicker: MatDateRangePicker<Date>;
  private _start: Date | null = null;
  get start(): Date | null {
    return this._start;
  }
  set start(aStart: Date | null) {
    this.startDateModelChangeCount++;
    this._start = aStart;
  }
  private _end: Date | null = null;
  get end(): Date | null {
    return this._end;
  }
  set end(anEnd: Date | null) {
    this.endDateModelChangeCount++;
    this._end = anEnd;
  }
  startDateModelChangeCount = 0;
  endDateModelChangeCount = 0;
}

@Component({
  template: `
    <mat-form-field>
      <mat-date-range-input [rangePicker]="rangePicker">
        <input #start matStartDate/>
        <input #end matEndDate/>
      </mat-date-range-input>

      <mat-date-range-picker #rangePicker></mat-date-range-picker>
    </mat-form-field>
  `,
})
class RangePickerNoLabel {
  @ViewChild('start') start: ElementRef<HTMLInputElement>;
  @ViewChild('end') end: ElementRef<HTMLInputElement>;
}

@Directive({
  selector: '[customValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: CustomValidator,
      multi: true,
    },
  ],
})
class CustomValidator implements Validator {
  validate = jasmine.createSpy('validate spy').and.returnValue(null);
}

@Component({
  template: `
    <mat-form-field>
      <mat-date-range-input [rangePicker]="rangePicker" [min]="min" [max]="max">
        <input matStartDate [(ngModel)]="start" customValidator/>
        <input matEndDate [(ngModel)]="end" customValidator/>
      </mat-date-range-input>

      <mat-date-range-picker #rangePicker></mat-date-range-picker>
    </mat-form-field>
  `,
})
class RangePickerWithCustomValidator {
  @ViewChild(CustomValidator) validator: CustomValidator;
  start: Date | null = null;
  end: Date | null = null;
  min: Date;
  max: Date;
}

@Component({
  template: `
    <mat-form-field>
      <mat-date-range-input [rangePicker]="rangePicker">
        <input matStartDate [errorStateMatcher]="matcher"/>
        <input matEndDate [errorStateMatcher]="matcher"/>
      </mat-date-range-input>

      <mat-date-range-picker #rangePicker></mat-date-range-picker>
    </mat-form-field>
  `,
})
class RangePickerErrorStateMatcher {
  @ViewChild(MatStartDate) startInput: MatStartDate<Date>;
  @ViewChild(MatEndDate) endInput: MatEndDate<Date>;
  matcher: ErrorStateMatcher = {isErrorState: () => false};
}
