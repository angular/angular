import {Directionality} from '@angular/cdk/bidi';
import {
  DOWN_ARROW,
  ENTER,
  ESCAPE,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {Overlay} from '@angular/cdk/overlay';
import {ScrollDispatcher} from '@angular/cdk/scrolling';
import {
  createKeyboardEvent,
  dispatchEvent,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  typeInElement,
} from '../../cdk/testing/private';
import {Component, Type, ViewChild, Provider, Directive, ViewEncapsulation} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, inject, TestBed, tick} from '@angular/core/testing';
import {
  FormControl,
  FormsModule,
  NgModel,
  ReactiveFormsModule,
  Validator,
  NG_VALIDATORS,
} from '@angular/forms';
import {MAT_DATE_LOCALE, MatNativeDateModule, NativeDateModule} from '@angular/material/core';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {DEC, JAN, JUL, JUN, SEP} from '../testing';
import {By} from '@angular/platform-browser';
import {_supportsShadowDom} from '@angular/cdk/platform';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Subject} from 'rxjs';
import {MatInputModule} from '../input/index';
import {MatDatepicker} from './datepicker';
import {MatDatepickerInput} from './datepicker-input';
import {MatDatepickerToggle} from './datepicker-toggle';
import {
  MAT_DATEPICKER_SCROLL_STRATEGY,
  MatDatepickerIntl,
  MatDatepickerModule,
  MatDateSelectionModel,
} from './index';
import {DatepickerDropdownPositionX, DatepickerDropdownPositionY} from './datepicker-base';

describe('MatDatepicker', () => {
  const SUPPORTS_INTL = typeof Intl != 'undefined';

  // Creates a test component fixture.
  function createComponent<T>(
    component: Type<T>,
    imports: Type<any>[] = [],
    providers: Provider[] = [],
    declarations: Type<any>[] = [],
  ): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        ...imports,
      ],
      providers,
      declarations: [component, ...declarations],
    });

    return TestBed.createComponent(component);
  }

  describe('with MatNativeDateModule', () => {
    describe('standard datepicker', () => {
      let fixture: ComponentFixture<StandardDatepicker>;
      let testComponent: StandardDatepicker;
      let model: MatDateSelectionModel<Date | null, Date>;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(StandardDatepicker, [MatNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
        model = fixture.debugElement
          .query(By.directive(MatDatepicker))
          .injector.get(MatDateSelectionModel);
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should initialize with correct value shown in input', () => {
        if (SUPPORTS_INTL) {
          expect(fixture.nativeElement.querySelector('input').value).toBe('1/1/2020');
        }
      });

      it('open non-touch should open popup', fakeAsync(() => {
        expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();
      }));

      it('touch should open dialog', fakeAsync(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        expect(document.querySelector('.mat-datepicker-dialog')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        expect(document.querySelector('.mat-datepicker-dialog')).not.toBeNull();
      }));

      it('should not be able to open more than one dialog', fakeAsync(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        expect(document.querySelectorAll('.mat-datepicker-dialog').length).toBe(0);

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        dispatchKeyboardEvent(document.querySelector('.mat-calendar-body')!, 'keydown', ENTER);
        fixture.detectChanges();
        tick(100);

        testComponent.datepicker.open();
        tick(500);
        fixture.detectChanges();
        flush();

        expect(document.querySelectorAll('.mat-datepicker-dialog').length).toBe(1);
      }));

      it('should open datepicker if opened input is set to true', fakeAsync(() => {
        testComponent.opened = true;
        fixture.detectChanges();
        tick();
        flush();

        expect(document.querySelector('.mat-datepicker-content')).not.toBeNull();

        testComponent.opened = false;
        fixture.detectChanges();
        flush();

        expect(document.querySelector('.mat-datepicker-content')).toBeNull();
      }));

      it('open in disabled mode should not open the calendar', fakeAsync(() => {
        testComponent.disabled = true;
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
        expect(document.querySelector('.mat-datepicker-dialog')).toBeNull();

        testComponent.datepicker.open();
        tick();
        fixture.detectChanges();
        flush();

        expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
        expect(document.querySelector('.mat-datepicker-dialog')).toBeNull();
      }));

      it('disabled datepicker input should open the calendar if datepicker is enabled', fakeAsync(() => {
        testComponent.datepicker.disabled = false;
        testComponent.datepickerInput.disabled = true;
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        expect(document.querySelector('.cdk-overlay-pane')).not.toBeNull();
      }));

      it('close should close popup', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        const popup = document.querySelector('.cdk-overlay-pane')!;
        expect(popup).not.toBeNull();
        expect(popup.getBoundingClientRect().height).toBeGreaterThan(0);

        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();

        expect(popup.getBoundingClientRect().height).toBe(0);
      }));

      it('should close the popup when pressing ESCAPE', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        expect(testComponent.datepicker.opened)
          .withContext('Expected datepicker to be open.')
          .toBe(true);

        const event = dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
        fixture.detectChanges();
        flush();

        expect(testComponent.datepicker.opened)
          .withContext('Expected datepicker to be closed.')
          .toBe(false);
        expect(event.defaultPrevented).toBe(true);
      }));

      it('should not close the popup when pressing ESCAPE with a modifier key', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();

        expect(testComponent.datepicker.opened)
          .withContext('Expected datepicker to be open.')
          .toBe(true);

        const event = dispatchKeyboardEvent(document.body, 'keydown', ESCAPE, undefined, {
          alt: true,
        });
        fixture.detectChanges();
        flush();

        expect(testComponent.datepicker.opened)
          .withContext('Expected datepicker to stay open.')
          .toBe(true);
        expect(event.defaultPrevented).toBe(false);
      }));

      it('should set the proper role on the popup', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        const popup = document.querySelector('.mat-datepicker-content-container')!;
        expect(popup).toBeTruthy();
        expect(popup.getAttribute('role')).toBe('dialog');
      }));

      it(
        'should set aria-labelledby to the one from the input, if not placed inside ' +
          'a mat-form-field',
        fakeAsync(() => {
          expect(fixture.nativeElement.querySelector('mat-form-field')).toBeFalsy();

          const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
          input.setAttribute('aria-labelledby', 'test-label');

          testComponent.datepicker.open();
          fixture.detectChanges();
          tick();
          flush();

          const popup = document.querySelector(
            '.cdk-overlay-pane .mat-datepicker-content-container',
          )!;
          expect(popup).toBeTruthy();
          expect(popup.getAttribute('aria-labelledby')).toBe('test-label');
        }),
      );

      it('close should close dialog', fakeAsync(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();

        expect(document.querySelector('.mat-datepicker-dialog')).not.toBeNull();

        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();

        expect(document.querySelector('.mat-datepicker-dialog')).toBeNull();
      }));

      it('setting selected via click should update input and close calendar', fakeAsync(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        expect(document.querySelector('.mat-datepicker-dialog')).not.toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 1));

        let cells = document.querySelectorAll('.mat-calendar-body-cell');
        dispatchMouseEvent(cells[1], 'click');
        fixture.detectChanges();
        flush();

        expect(document.querySelector('.mat-datepicker-dialog')).toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 2));
      }));

      it('setting selected via enter press should update input and close calendar', fakeAsync(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        expect(document.querySelector('.mat-datepicker-dialog')).not.toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 1));

        let calendarBodyEl = document.querySelector('.mat-calendar-body') as HTMLElement;

        dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
        fixture.detectChanges();
        tick();
        flush();
        dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
        fixture.detectChanges();
        dispatchKeyboardEvent(calendarBodyEl, 'keyup', ENTER);
        fixture.detectChanges();
        flush();

        expect(document.querySelector('.mat-datepicker-dialog')).toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 2));
      }));

      it(
        'clicking the currently selected date should close the calendar ' +
          'without firing selectedChanged',
        fakeAsync(() => {
          const spy = jasmine.createSpy('selectionChanged spy');
          const selectedSubscription = model.selectionChanged.subscribe(spy);

          for (let changeCount = 1; changeCount < 3; changeCount++) {
            const currentDay = changeCount;
            testComponent.datepicker.open();
            fixture.detectChanges();
            tick();

            expect(document.querySelector('mat-datepicker-content')).not.toBeNull();
            expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, currentDay));

            let cells = document.querySelectorAll('.mat-calendar-body-cell');
            dispatchMouseEvent(cells[1], 'click');
            fixture.detectChanges();
            flush();
          }

          expect(spy).toHaveBeenCalledTimes(1);
          expect(document.querySelector('.mat-datepicker-dialog')).toBeNull();
          expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 2));
          selectedSubscription.unsubscribe();
        }),
      );

      it(
        'pressing enter on the currently selected date should close the calendar without ' +
          'firing selectedChanged',
        fakeAsync(() => {
          const spy = jasmine.createSpy('selectionChanged spy');
          const selectedSubscription = model.selectionChanged.subscribe(spy);

          testComponent.datepicker.open();
          fixture.detectChanges();
          tick();
          flush();

          let calendarBodyEl = document.querySelector('.mat-calendar-body') as HTMLElement;
          expect(calendarBodyEl).not.toBeNull();
          expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 1));

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
          fixture.detectChanges();
          flush();

          fixture.whenStable().then(() => {
            expect(spy).not.toHaveBeenCalled();
            expect(document.querySelector('.mat-datepicker-dialog')).toBeNull();
            expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 1));
            selectedSubscription.unsubscribe();
          });
        }),
      );

      it('startAt should fallback to input value', () => {
        expect(testComponent.datepicker.startAt).toEqual(new Date(2020, JAN, 1));
      });

      it('should attach popup to native input', () => {
        let attachToRef = testComponent.datepickerInput.getConnectedOverlayOrigin();
        expect(attachToRef.nativeElement.tagName.toLowerCase())
          .withContext('popup should be attached to native input')
          .toBe('input');
      });

      it('input should aria-owns calendar after opened in non-touch mode', fakeAsync(() => {
        let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;
        expect(inputEl.getAttribute('aria-owns')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        let ownedElementId = inputEl.getAttribute('aria-owns');
        expect(ownedElementId).not.toBeNull();

        let ownedElement = document.getElementById(ownedElementId);
        expect(ownedElement).not.toBeNull();
        expect((ownedElement as Element).tagName.toLowerCase()).toBe('mat-calendar');
      }));

      it('input should aria-owns calendar after opened in touch mode', fakeAsync(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;
        expect(inputEl.getAttribute('aria-owns')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        let ownedElementId = inputEl.getAttribute('aria-owns');
        expect(ownedElementId).not.toBeNull();

        let ownedElement = document.getElementById(ownedElementId);
        expect(ownedElement).not.toBeNull();
        expect((ownedElement as Element).tagName.toLowerCase()).toBe('mat-calendar');
      }));

      it('should not throw when given wrong data type', () => {
        testComponent.date = '1/1/2017' as any;

        expect(() => fixture.detectChanges()).not.toThrow();
      });

      it('should clear out the backdrop subscriptions on close', fakeAsync(() => {
        for (let i = 0; i < 3; i++) {
          testComponent.datepicker.open();
          fixture.detectChanges();
          tick();

          testComponent.datepicker.close();
          fixture.detectChanges();
          tick();
        }

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        const spy = jasmine.createSpy('close event spy');
        const subscription = testComponent.datepicker.closedStream.subscribe(spy);
        const backdrop = document.querySelector('.cdk-overlay-backdrop')! as HTMLElement;

        backdrop.click();
        fixture.detectChanges();
        flush();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(testComponent.datepicker.opened).toBe(false);
        subscription.unsubscribe();
      }));

      it('should reset the datepicker when it is closed externally', fakeAsync(() => {
        TestBed.resetTestingModule();

        const scrolledSubject = new Subject();

        // Stub out a `CloseScrollStrategy` so we can trigger a detachment via the `OverlayRef`.
        fixture = createComponent(
          StandardDatepicker,
          [MatNativeDateModule],
          [
            {
              provide: ScrollDispatcher,
              useValue: {scrolled: () => scrolledSubject},
            },
            {
              provide: MAT_DATEPICKER_SCROLL_STRATEGY,
              deps: [Overlay],
              useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close(),
            },
          ],
        );

        fixture.detectChanges();
        testComponent = fixture.componentInstance;

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();

        expect(testComponent.datepicker.opened).toBe(true);

        scrolledSubject.next();
        flush();
        fixture.detectChanges();

        expect(testComponent.datepicker.opened).toBe(false);
      }));

      it('should close the datepicker using ALT + UP_ARROW', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        expect(testComponent.datepicker.opened).toBe(true);

        const event = createKeyboardEvent('keydown', UP_ARROW, undefined, {alt: true});

        dispatchEvent(document.body, event);
        fixture.detectChanges();
        flush();

        expect(testComponent.datepicker.opened).toBe(false);
      }));

      it('should open the datepicker using ALT + DOWN_ARROW', fakeAsync(() => {
        expect(testComponent.datepicker.opened).toBe(false);

        const event = createKeyboardEvent('keydown', DOWN_ARROW, undefined, {alt: true});

        dispatchEvent(fixture.nativeElement.querySelector('input'), event);
        fixture.detectChanges();
        tick();
        flush();

        expect(testComponent.datepicker.opened).toBe(true);
        expect(event.defaultPrevented).toBe(true);
      }));

      it('should not open for ALT + DOWN_ARROW on readonly input', fakeAsync(() => {
        const input = fixture.nativeElement.querySelector('input');

        expect(testComponent.datepicker.opened).toBe(false);

        input.setAttribute('readonly', 'true');

        const event = createKeyboardEvent('keydown', DOWN_ARROW, undefined, {alt: true});

        dispatchEvent(input, event);
        fixture.detectChanges();
        flush();

        expect(testComponent.datepicker.opened).toBe(false);
        expect(event.defaultPrevented).toBe(false);
      }));

      it('should show the invisible close button on focus', fakeAsync(() => {
        testComponent.opened = true;
        fixture.detectChanges();
        tick();
        flush();

        const button = document.querySelector('.mat-datepicker-close-button') as HTMLButtonElement;
        expect(button.classList).toContain('cdk-visually-hidden');

        dispatchFakeEvent(button, 'focus');
        fixture.detectChanges();
        expect(button.classList).not.toContain('cdk-visually-hidden');

        dispatchFakeEvent(button, 'blur');
        fixture.detectChanges();
        expect(button.classList).toContain('cdk-visually-hidden');
      }));

      it('should close the overlay when clicking on the invisible close button', fakeAsync(() => {
        testComponent.opened = true;
        fixture.detectChanges();
        tick();
        flush();

        const button = document.querySelector('.mat-datepicker-close-button') as HTMLButtonElement;
        expect(document.querySelector('.mat-datepicker-content')).not.toBeNull();

        button.click();
        fixture.detectChanges();
        flush();

        expect(document.querySelector('.mat-datepicker-content')).toBeNull();
      }));

      it('should prevent the default action of navigation keys before the focus timeout has elapsed', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        // Do the assertions before flushing the delays since we want
        // to check specifically what happens before they have fired.
        [UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, PAGE_UP, PAGE_DOWN].forEach(keyCode => {
          const event = dispatchKeyboardEvent(document.body, 'keydown', keyCode);
          fixture.detectChanges();
          expect(event.defaultPrevented)
            .withContext(`Expected default action to be prevented for key code ${keyCode}`)
            .toBe(true);
        });

        tick();
        flush();
      }));
    });

    describe('datepicker with too many inputs', () => {
      it('should throw when multiple inputs registered', fakeAsync(() => {
        const fixture = createComponent(MultiInputDatepicker, [MatNativeDateModule]);
        expect(() => fixture.detectChanges()).toThrow();
      }));
    });

    describe('datepicker that is assigned to input at a later point', () => {
      it('should not throw on ALT + DOWN_ARROW for input without datepicker', fakeAsync(() => {
        const fixture = createComponent(DelayedDatepicker, [MatNativeDateModule]);
        fixture.detectChanges();

        expect(() => {
          const event = createKeyboardEvent('keydown', DOWN_ARROW, undefined, {alt: true});
          dispatchEvent(fixture.nativeElement.querySelector('input'), event);
          fixture.detectChanges();
          flush();
        }).not.toThrow();
      }));

      it('should handle value changes when a datepicker is assigned after init', fakeAsync(() => {
        const fixture = createComponent(DelayedDatepicker, [MatNativeDateModule]);
        const testComponent: DelayedDatepicker = fixture.componentInstance;
        const toSelect = new Date(2017, JAN, 1);
        fixture.detectChanges();

        const model = fixture.debugElement
          .query(By.directive(MatDatepicker))
          .injector.get(MatDateSelectionModel);

        expect(testComponent.datepickerInput.value).toBeNull();
        expect(model.selection).toBeNull();

        testComponent.assignedDatepicker = testComponent.datepicker;
        fixture.detectChanges();

        testComponent.assignedDatepicker.select(toSelect);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(testComponent.datepickerInput.value).toEqual(toSelect);
        expect(model.selection).toEqual(toSelect);
      }));
    });

    describe('datepicker with no inputs', () => {
      let fixture: ComponentFixture<NoInputDatepicker>;
      let testComponent: NoInputDatepicker;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(NoInputDatepicker, [MatNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should not throw when accessing disabled property', () => {
        expect(() => testComponent.datepicker.disabled).not.toThrow();
      });

      it('should throw when opened with no registered inputs', fakeAsync(() => {
        expect(() => testComponent.datepicker.open()).toThrow();
      }));
    });

    describe('datepicker with startAt', () => {
      let fixture: ComponentFixture<DatepickerWithStartAt>;
      let testComponent: DatepickerWithStartAt;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithStartAt, [MatNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('explicit startAt should override input value', () => {
        expect(testComponent.datepicker.startAt).toEqual(new Date(2010, JAN, 1));
      });
    });

    describe('datepicker with startView set to year', () => {
      let fixture: ComponentFixture<DatepickerWithStartViewYear>;
      let testComponent: DatepickerWithStartViewYear;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithStartViewYear, [MatNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should start at the specified view', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();

        const firstCalendarCell = document.querySelector('.mat-calendar-body-cell')!;

        // When the calendar is in year view, the first cell should be for a month rather than
        // for a date.
        // When the calendar is in year view, the first cell should be for a month rather than
        // for a date.
        expect(firstCalendarCell.textContent!.trim())
          .withContext('Expected the calendar to be in year-view')
          .toBe('JAN');
      }));

      it('should fire yearSelected when user selects calendar year in year view', fakeAsync(() => {
        spyOn(testComponent, 'onYearSelection');
        expect(testComponent.onYearSelection).not.toHaveBeenCalled();

        testComponent.datepicker.open();
        tick();
        fixture.detectChanges();
        flush();

        const cells = document.querySelectorAll('.mat-calendar-body-cell');

        dispatchMouseEvent(cells[0], 'click');
        fixture.detectChanges();
        tick();
        flush();

        expect(testComponent.onYearSelection).toHaveBeenCalled();
      }));
    });

    describe('datepicker with startView set to multiyear', () => {
      let fixture: ComponentFixture<DatepickerWithStartViewMultiYear>;
      let testComponent: DatepickerWithStartViewMultiYear;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithStartViewMultiYear, [MatNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;

        spyOn(testComponent, 'onMultiYearSelection');
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should start at the specified view', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();

        const firstCalendarCell = document.querySelector('.mat-calendar-body-cell')!;

        // When the calendar is in year view, the first cell should be for a month rather than
        // for a date.
        // When the calendar is in year view, the first cell should be for a month rather than
        // for a date.
        expect(firstCalendarCell.textContent!.trim())
          .withContext('Expected the calendar to be in multi-year-view')
          .toBe('2016');
      }));

      it('should fire yearSelected when user selects calendar year in multiyear view', fakeAsync(() => {
        expect(testComponent.onMultiYearSelection).not.toHaveBeenCalled();

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();

        const cells = document.querySelectorAll('.mat-calendar-body-cell');

        dispatchMouseEvent(cells[0], 'click');
        fixture.detectChanges();
        tick();
        flush();

        expect(testComponent.onMultiYearSelection).toHaveBeenCalled();
      }));
    });

    describe('datepicker with ngModel', () => {
      let fixture: ComponentFixture<DatepickerWithNgModel>;
      let testComponent: DatepickerWithNgModel;
      let model: MatDateSelectionModel<Date | null, Date>;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithNgModel, [MatNativeDateModule]);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          testComponent = fixture.componentInstance;
          model = fixture.debugElement
            .query(By.directive(MatDatepicker))
            .injector.get(MatDateSelectionModel);
        });
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should update datepicker when model changes', fakeAsync(() => {
        expect(testComponent.datepickerInput.value).toBeNull();
        expect(model.selection).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.selected = selected;
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(testComponent.datepickerInput.value).toEqual(selected);
        expect(model.selection).toEqual(selected);
      }));

      it('should update model when date is selected', fakeAsync(() => {
        expect(testComponent.selected).toBeNull();
        expect(testComponent.datepickerInput.value).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.datepicker.select(selected);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(testComponent.selected).toEqual(selected);
        expect(testComponent.datepickerInput.value).toEqual(selected);
      }));

      it('should mark input dirty after input event', () => {
        let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        inputEl.value = '2001-01-01';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-dirty');
      });

      it('should mark input dirty after date selected', fakeAsync(() => {
        let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        testComponent.datepicker.select(new Date(2017, JAN, 1));
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-dirty');
      }));

      it('should mark input dirty after invalid value is typed in', () => {
        let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        inputEl.value = 'hello there';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-dirty');
      });

      it('should not mark dirty after model change', fakeAsync(() => {
        let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        testComponent.selected = new Date(2017, JAN, 1);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-pristine');
      }));

      it('should mark input touched on blur', () => {
        let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

        expect(inputEl.classList).toContain('ng-untouched');

        dispatchFakeEvent(inputEl, 'focus');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-untouched');

        dispatchFakeEvent(inputEl, 'blur');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-touched');
      });

      it('should mark input as touched when the datepicker is closed', fakeAsync(() => {
        let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

        expect(inputEl.classList).toContain('ng-untouched');

        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-untouched');

        fixture.componentInstance.datepicker.close();
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-touched');
      }));

      it('should reformat the input value on blur', () => {
        if (SUPPORTS_INTL) {
          // Skip this test if the internationalization API is not supported in the current
          // browser. Browsers like Safari 9 do not support the "Intl" API.
          return;
        }

        const inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

        inputEl.value = '2001-01-01';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        dispatchFakeEvent(inputEl, 'blur');
        fixture.detectChanges();

        expect(inputEl.value).toBe('1/1/2001');
      });

      it('should not reformat invalid dates on blur', () => {
        const inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

        inputEl.value = 'very-valid-date';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        dispatchFakeEvent(inputEl, 'blur');
        fixture.detectChanges();

        expect(inputEl.value).toBe('very-valid-date');
      });

      it('should mark input touched on calendar selection', fakeAsync(() => {
        let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

        expect(inputEl.classList).toContain('ng-untouched');

        testComponent.datepicker.select(new Date(2017, JAN, 1));
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-touched');
      }));
    });

    describe('datepicker with formControl', () => {
      let fixture: ComponentFixture<DatepickerWithFormControl>;
      let testComponent: DatepickerWithFormControl;
      let model: MatDateSelectionModel<Date | null, Date>;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithFormControl, [MatNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
        model = fixture.debugElement
          .query(By.directive(MatDatepicker))
          .injector.get(MatDateSelectionModel);
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should update datepicker when formControl changes', () => {
        expect(testComponent.datepickerInput.value).toBeNull();
        expect(model.selection).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.formControl.setValue(selected);
        fixture.detectChanges();

        expect(testComponent.datepickerInput.value).toEqual(selected);
        expect(model.selection).toEqual(selected);
      });

      it('should update formControl when date is selected', () => {
        expect(testComponent.formControl.value).toBeNull();
        expect(testComponent.datepickerInput.value).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.datepicker.select(selected);
        fixture.detectChanges();

        expect(testComponent.formControl.value).toEqual(selected);
        expect(testComponent.datepickerInput.value).toEqual(selected);
      });

      it('should disable input when form control disabled', () => {
        let inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

        expect(inputEl.disabled).toBe(false);

        testComponent.formControl.disable();
        fixture.detectChanges();

        expect(inputEl.disabled).toBe(true);
      });

      it('should disable toggle when form control disabled', () => {
        expect(testComponent.datepickerToggle.disabled).toBe(false);

        testComponent.formControl.disable();
        fixture.detectChanges();

        expect(testComponent.datepickerToggle.disabled).toBe(true);
      });

      it(
        'should not dispatch FormControl change event for invalid values on input when set ' +
          'to update on blur',
        fakeAsync(() => {
          const formControl = new FormControl({value: null} as unknown as Date, {updateOn: 'blur'});
          const spy = jasmine.createSpy('change spy');
          const subscription = formControl.valueChanges.subscribe(spy);
          const inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;
          const setValue = (value: string) => {
            inputEl.value = value;
            dispatchFakeEvent(inputEl, 'input');
            fixture.detectChanges();
            flush();
            fixture.detectChanges();
          };

          fixture.componentInstance.formControl = formControl;
          fixture.detectChanges();

          expect(spy).not.toHaveBeenCalled();

          setValue('10/10/2010');
          expect(spy).not.toHaveBeenCalled();

          setValue('10/10/');
          expect(spy).not.toHaveBeenCalled();

          setValue('10/10');
          expect(spy).not.toHaveBeenCalled();

          dispatchFakeEvent(inputEl, 'blur');
          fixture.detectChanges();
          flush();
          fixture.detectChanges();

          expect(spy).toHaveBeenCalledTimes(1);
          subscription.unsubscribe();
        }),
      );

      it('should set the matDatepickerParse error when an invalid value is typed for the first time', () => {
        const formControl = fixture.componentInstance.formControl;

        expect(formControl.hasError('matDatepickerParse')).toBe(false);

        typeInElement(fixture.nativeElement.querySelector('input'), 'Today');
        fixture.detectChanges();

        expect(formControl.hasError('matDatepickerParse')).toBe(true);
      });
    });

    describe('datepicker with mat-datepicker-toggle', () => {
      let fixture: ComponentFixture<DatepickerWithToggle>;
      let testComponent: DatepickerWithToggle;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithToggle, [MatNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should set `aria-haspopup` on the toggle button', () => {
        const button = fixture.debugElement.query(By.css('button'))!;

        expect(button).toBeTruthy();
        expect(button.nativeElement.getAttribute('aria-haspopup')).toBe('dialog');
      });

      it('should set a default `aria-label` on the toggle button', () => {
        const button = fixture.debugElement.query(By.css('button'))!;

        expect(button).toBeTruthy();
        expect(button.nativeElement.getAttribute('aria-label')).toBe('Open calendar');
      });

      it('should be able to change the button `aria-label`', () => {
        fixture.componentInstance.ariaLabel = 'Toggle the datepicker';
        fixture.detectChanges();
        const button = fixture.debugElement.query(By.css('button'))!;

        expect(button).toBeTruthy();
        expect(button.nativeElement.getAttribute('aria-label')).toBe('Toggle the datepicker');
      });

      it('should open calendar when toggle clicked', () => {
        expect(document.querySelector('.mat-datepicker-dialog')).toBeNull();

        let toggle = fixture.debugElement.query(By.css('button'))!;
        dispatchMouseEvent(toggle.nativeElement, 'click');
        fixture.detectChanges();

        expect(document.querySelector('.mat-datepicker-dialog')).not.toBeNull();
      });

      it('should not open calendar when toggle clicked if datepicker is disabled', () => {
        testComponent.datepicker.disabled = true;
        fixture.detectChanges();
        const toggle = fixture.debugElement.query(By.css('button'))!.nativeElement;

        expect(toggle.hasAttribute('disabled')).toBe(true);
        expect(document.querySelector('.mat-datepicker-dialog')).toBeNull();

        dispatchMouseEvent(toggle, 'click');
        fixture.detectChanges();

        expect(document.querySelector('.mat-datepicker-dialog')).toBeNull();
      });

      it('should not open calendar when toggle clicked if input is disabled', () => {
        expect(testComponent.datepicker.disabled).toBe(false);

        testComponent.input.disabled = true;
        fixture.detectChanges();
        const toggle = fixture.debugElement.query(By.css('button'))!.nativeElement;

        expect(toggle.hasAttribute('disabled')).toBe(true);
        expect(document.querySelector('.mat-datepicker-dialog')).toBeNull();

        dispatchMouseEvent(toggle, 'click');
        fixture.detectChanges();

        expect(document.querySelector('.mat-datepicker-dialog')).toBeNull();
      });

      it('should set the `button` type on the trigger to prevent form submissions', () => {
        let toggle = fixture.debugElement.query(By.css('button'))!.nativeElement;
        expect(toggle.getAttribute('type')).toBe('button');
      });

      it('should remove the underlying SVG icon from the tab order', () => {
        const icon = fixture.debugElement.nativeElement.querySelector('svg');
        expect(icon.getAttribute('focusable')).toBe('false');
      });

      it('should restore focus to the toggle after the calendar is closed', fakeAsync(() => {
        let toggle = fixture.debugElement.query(By.css('button'))!.nativeElement;

        fixture.componentInstance.touchUI = false;
        fixture.detectChanges();

        toggle.focus();
        expect(document.activeElement).withContext('Expected toggle to be focused.').toBe(toggle);

        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();
        tick();

        let pane = document.querySelector('.cdk-overlay-pane')!;

        expect(pane).withContext('Expected calendar to be open.').toBeTruthy();
        expect(pane.contains(document.activeElement))
          .withContext('Expected focus to be inside the calendar.')
          .toBe(true);

        fixture.componentInstance.datepicker.close();
        fixture.detectChanges();
        flush();

        expect(document.activeElement)
          .withContext('Expected focus to be restored to toggle.')
          .toBe(toggle);
      }));

      it('should restore focus when placed inside a shadow root', fakeAsync(() => {
        if (!_supportsShadowDom()) {
          return;
        }

        fixture.destroy();
        TestBed.resetTestingModule();
        fixture = createComponent(DatepickerWithToggleInShadowDom, [MatNativeDateModule]);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;

        const toggle = fixture.debugElement.query(By.css('button'))!.nativeElement;
        fixture.componentInstance.touchUI = false;
        fixture.detectChanges();

        toggle.focus();
        spyOn(toggle, 'focus').and.callThrough();
        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();
        tick();
        fixture.componentInstance.datepicker.close();
        fixture.detectChanges();
        flush();

        // We have to assert by looking at the `focus` method, because
        // `document.activeElement` will return the shadow root.
        expect(toggle.focus).toHaveBeenCalled();
      }));

      it('should allow for focus restoration to be disabled', fakeAsync(() => {
        let toggle = fixture.debugElement.query(By.css('button'))!.nativeElement;

        fixture.componentInstance.touchUI = false;
        fixture.componentInstance.restoreFocus = false;
        fixture.detectChanges();

        toggle.focus();
        expect(document.activeElement).withContext('Expected toggle to be focused.').toBe(toggle);

        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();
        tick();

        let pane = document.querySelector('.cdk-overlay-pane')!;

        expect(pane).withContext('Expected calendar to be open.').toBeTruthy();
        expect(pane.contains(document.activeElement))
          .withContext('Expected focus to be inside the calendar.')
          .toBe(true);

        fixture.componentInstance.datepicker.close();
        fixture.detectChanges();

        expect(document.activeElement)
          .not.withContext('Expected focus not to be restored to toggle.')
          .toBe(toggle);
      }));

      it('should not override focus if it was moved inside the closed event in touchUI mode', fakeAsync(() => {
        const focusTarget = document.createElement('button');
        const datepicker = fixture.componentInstance.datepicker;
        const subscription = datepicker.closedStream.subscribe(() => focusTarget.focus());
        const input = fixture.nativeElement.querySelector('input');

        focusTarget.setAttribute('tabindex', '0');
        document.body.appendChild(focusTarget);

        // Important: we're testing the touchUI behavior on particular.
        fixture.componentInstance.touchUI = true;
        fixture.detectChanges();

        // Focus the input before opening so that the datepicker restores focus to it on close.
        input.focus();

        expect(document.activeElement)
          .withContext('Expected input to be focused on init.')
          .toBe(input);

        datepicker.open();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        expect(document.activeElement).not.toBe(
          input,
          'Expected input not to be focused while dialog is open.',
        );

        datepicker.close();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        expect(document.activeElement)
          .withContext('Expected alternate focus target to be focused after closing.')
          .toBe(focusTarget);

        focusTarget.remove();
        subscription.unsubscribe();
      }));

      it('should re-render when the i18n labels change', inject(
        [MatDatepickerIntl],
        (intl: MatDatepickerIntl) => {
          const toggle = fixture.debugElement.query(By.css('button'))!.nativeElement;

          intl.openCalendarLabel = 'Open the calendar, perhaps?';
          intl.changes.next();
          fixture.detectChanges();

          expect(toggle.getAttribute('aria-label')).toBe('Open the calendar, perhaps?');
        },
      ));

      it('should toggle the active state of the datepicker toggle', fakeAsync(() => {
        const toggle = fixture.debugElement.query(By.css('mat-datepicker-toggle'))!.nativeElement;

        expect(toggle.classList).not.toContain('mat-datepicker-toggle-active');

        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        expect(toggle.classList).toContain('mat-datepicker-toggle-active');

        fixture.componentInstance.datepicker.close();
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(toggle.classList).not.toContain('mat-datepicker-toggle-active');
      }));
    });

    describe('datepicker with custom mat-datepicker-toggle icon', () => {
      it('should be able to override the mat-datepicker-toggle icon', fakeAsync(() => {
        const fixture = createComponent(DatepickerWithCustomIcon, [MatNativeDateModule]);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.mat-datepicker-toggle .custom-icon'))
          .withContext('Expected custom icon to be rendered.')
          .toBeTruthy();

        expect(fixture.nativeElement.querySelector('.mat-datepicker-toggle mat-icon'))
          .withContext('Expected default icon to be removed.')
          .toBeFalsy();
      }));
    });

    describe('datepicker with tabindex on mat-datepicker-toggle', () => {
      it('should forward the tabindex to the underlying button', () => {
        const fixture = createComponent(DatepickerWithTabindexOnToggle, [MatNativeDateModule]);
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('.mat-datepicker-toggle button');

        expect(button.getAttribute('tabindex')).toBe('7');
      });

      it('should remove the tabindex from the mat-datepicker-toggle host', () => {
        const fixture = createComponent(DatepickerWithTabindexOnToggle, [MatNativeDateModule]);
        fixture.detectChanges();

        const host = fixture.nativeElement.querySelector('.mat-datepicker-toggle');

        expect(host.hasAttribute('tabindex')).toBe(false);
      });
    });

    describe('datepicker inside mat-form-field', () => {
      let fixture: ComponentFixture<FormFieldDatepicker>;
      let testComponent: FormFieldDatepicker;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(FormFieldDatepicker, [MatNativeDateModule]);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should float the placeholder when an invalid value is entered', () => {
        testComponent.datepickerInput.value = 'totally-not-a-date' as any;
        fixture.debugElement.nativeElement.querySelector('input').value = 'totally-not-a-date';
        fixture.detectChanges();

        expect(
          fixture.debugElement.nativeElement.querySelector('mat-form-field').classList,
        ).toContain('mat-form-field-should-float');
      });

      it('should pass the form field theme color to the overlay', fakeAsync(() => {
        testComponent.formField.color = 'primary';
        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        let contentEl = document.querySelector('.mat-datepicker-content')!;

        expect(contentEl.classList).toContain('mat-primary');

        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();

        testComponent.formField.color = 'warn';
        testComponent.datepicker.open();

        contentEl = document.querySelector('.mat-datepicker-content')!;
        fixture.detectChanges();
        tick();
        flush();

        expect(contentEl.classList).toContain('mat-warn');
        expect(contentEl.classList).not.toContain('mat-primary');
      }));

      it('should prefer the datepicker color over the form field one', fakeAsync(() => {
        testComponent.datepicker.color = 'accent';
        testComponent.formField.color = 'warn';
        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        const contentEl = document.querySelector('.mat-datepicker-content')!;

        expect(contentEl.classList).toContain('mat-accent');
        expect(contentEl.classList).not.toContain('mat-warn');
      }));

      it('should set aria-labelledby of the overlay to the form field label', fakeAsync(() => {
        const label: HTMLElement = fixture.nativeElement.querySelector('.mat-form-field-label');

        expect(label).toBeTruthy();
        expect(label.getAttribute('id')).toBeTruthy();

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        const popup = document.querySelector(
          '.cdk-overlay-pane .mat-datepicker-content-container',
        )!;
        expect(popup).toBeTruthy();
        expect(popup.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'));
      }));
    });

    describe('datepicker with min and max dates and validation', () => {
      let fixture: ComponentFixture<DatepickerWithMinAndMaxValidation>;
      let testComponent: DatepickerWithMinAndMaxValidation;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithMinAndMaxValidation, [MatNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      function revalidate() {
        fixture.detectChanges();
        flush();
        fixture.detectChanges();
      }

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should use min and max dates specified by the input', () => {
        expect(testComponent.datepicker._getMinDate()).toEqual(new Date(2010, JAN, 1));
        expect(testComponent.datepicker._getMaxDate()).toEqual(new Date(2020, JAN, 1));
      });

      it('should mark invalid when value is before min', fakeAsync(() => {
        testComponent.date = new Date(2009, DEC, 31);
        revalidate();

        expect(fixture.debugElement.query(By.css('input'))!.nativeElement.classList).toContain(
          'ng-invalid',
        );
      }));

      it('should mark invalid when value is after max', fakeAsync(() => {
        testComponent.date = new Date(2020, JAN, 2);
        revalidate();

        expect(fixture.debugElement.query(By.css('input'))!.nativeElement.classList).toContain(
          'ng-invalid',
        );
      }));

      it('should not mark invalid when value equals min', fakeAsync(() => {
        testComponent.date = testComponent.datepicker._getMinDate();
        revalidate();

        expect(fixture.debugElement.query(By.css('input'))!.nativeElement.classList).not.toContain(
          'ng-invalid',
        );
      }));

      it('should not mark invalid when value equals max', fakeAsync(() => {
        testComponent.date = testComponent.datepicker._getMaxDate();
        revalidate();

        expect(fixture.debugElement.query(By.css('input'))!.nativeElement.classList).not.toContain(
          'ng-invalid',
        );
      }));

      it('should not mark invalid when value is between min and max', fakeAsync(() => {
        testComponent.date = new Date(2010, JAN, 2);
        revalidate();

        expect(fixture.debugElement.query(By.css('input'))!.nativeElement.classList).not.toContain(
          'ng-invalid',
        );
      }));

      it('should update validity when switching between null and invalid', fakeAsync(() => {
        const inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;
        inputEl.value = '';
        dispatchFakeEvent(inputEl, 'input');
        revalidate();

        expect(testComponent.model.valid).toBe(true);

        inputEl.value = 'abcdefg';
        dispatchFakeEvent(inputEl, 'input');
        revalidate();

        expect(testComponent.model.valid).toBe(false);

        inputEl.value = '';
        dispatchFakeEvent(inputEl, 'input');
        revalidate();

        expect(testComponent.model.valid).toBe(true);
      }));

      it('should update validity when a value is assigned', fakeAsync(() => {
        const inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;
        inputEl.value = '';
        dispatchFakeEvent(inputEl, 'input');
        revalidate();

        expect(testComponent.model.valid).toBe(true);

        inputEl.value = 'abcdefg';
        dispatchFakeEvent(inputEl, 'input');
        revalidate();

        expect(testComponent.model.valid).toBe(false);

        const validDate = new Date(2010, JAN, 2);

        // Assigning through the selection model simulates the user doing it via the calendar.
        const model = fixture.debugElement
          .query(By.directive(MatDatepicker))
          .injector.get<MatDateSelectionModel<Date>>(MatDateSelectionModel);
        model.updateSelection(validDate, null);
        revalidate();

        expect(testComponent.model.valid).toBe(true);
        expect(testComponent.date).toBe(validDate);
      }));

      it('should update the calendar when the min/max dates change', fakeAsync(() => {
        const getDisabledCells = () => {
          return document.querySelectorAll('.mat-calendar-body-disabled').length;
        };

        testComponent.date = new Date(2020, JAN, 5);
        fixture.detectChanges();

        testComponent.minDate = new Date(2020, JAN, 3);
        testComponent.maxDate = new Date(2020, JAN, 7);
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        let disabledCellCount = getDisabledCells();
        expect(disabledCellCount).not.toBe(0);

        testComponent.minDate = new Date(2020, JAN, 1);
        fixture.detectChanges();

        expect(getDisabledCells()).not.toBe(disabledCellCount);
        disabledCellCount = getDisabledCells();

        testComponent.maxDate = new Date(2020, JAN, 10);
        fixture.detectChanges();

        expect(getDisabledCells()).not.toBe(disabledCellCount);
      }));
    });

    describe('datepicker with filter and validation', () => {
      let fixture: ComponentFixture<DatepickerWithFilterAndValidation>;
      let testComponent: DatepickerWithFilterAndValidation;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithFilterAndValidation, [MatNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should mark input invalid', fakeAsync(() => {
        testComponent.date = new Date(2017, JAN, 1);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input'))!.nativeElement.classList).toContain(
          'ng-invalid',
        );

        testComponent.date = new Date(2017, JAN, 2);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input'))!.nativeElement.classList).not.toContain(
          'ng-invalid',
        );
      }));

      it('should disable filtered calendar cells', fakeAsync(() => {
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();
        flush();

        expect(document.querySelector('.mat-datepicker-dialog')).not.toBeNull();

        let cells = document.querySelectorAll('.mat-calendar-body-cell');
        expect(cells[0].classList).toContain('mat-calendar-body-disabled');
        expect(cells[1].classList).not.toContain('mat-calendar-body-disabled');
      }));

      it('should revalidate when a new function is assigned', fakeAsync(() => {
        const classList = fixture.debugElement.query(By.css('input'))!.nativeElement.classList;
        testComponent.date = new Date(2017, JAN, 1);
        testComponent.filter = () => true;
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(classList).not.toContain('ng-invalid');

        testComponent.filter = () => false;
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(classList).toContain('ng-invalid');
      }));

      it('should not dispatch the change event if a new function with the same result is assigned', fakeAsync(() => {
        const spy = jasmine.createSpy('change spy');
        const subscription = fixture.componentInstance.model.valueChanges?.subscribe(spy);
        testComponent.filter = () => false;
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledTimes(1);

        testComponent.filter = () => false;
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledTimes(1);
        subscription?.unsubscribe();
      }));
    });

    describe('datepicker with change and input events', () => {
      let fixture: ComponentFixture<DatepickerWithChangeAndInputEvents>;
      let testComponent: DatepickerWithChangeAndInputEvents;
      let inputEl: HTMLInputElement;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithChangeAndInputEvents, [MatNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('input'))!.nativeElement;

        spyOn(testComponent, 'onChange');
        spyOn(testComponent, 'onInput');
        spyOn(testComponent, 'onDateChange');
        spyOn(testComponent, 'onDateInput');
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should fire input and dateInput events when user types input', () => {
        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        inputEl.value = '2001-01-01';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).toHaveBeenCalled();
        expect(testComponent.onDateInput).toHaveBeenCalled();
      });

      it('should fire change and dateChange events when user commits typed input', () => {
        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        dispatchFakeEvent(inputEl, 'change');
        fixture.detectChanges();

        expect(testComponent.onChange).toHaveBeenCalled();
        expect(testComponent.onDateChange).toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();
      });

      it('should fire dateChange and dateInput events when user selects calendar date', fakeAsync(() => {
        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();

        expect(document.querySelector('.mat-datepicker-dialog')).not.toBeNull();

        const cells = document.querySelectorAll('.mat-calendar-body-cell');
        dispatchMouseEvent(cells[0], 'click');
        fixture.detectChanges();
        flush();

        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).toHaveBeenCalled();
      }));

      it('should not fire the dateInput event if the value has not changed', () => {
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        inputEl.value = '12/12/2012';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(testComponent.onDateInput).toHaveBeenCalledTimes(1);

        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(testComponent.onDateInput).toHaveBeenCalledTimes(1);
      });

      it('should have updated the native input value when the dateChange event is emitted', () => {
        let valueDuringChangeEvent = '';

        (testComponent.onDateChange as jasmine.Spy).and.callFake(() => {
          valueDuringChangeEvent = inputEl.value;
        });

        const model = fixture.debugElement
          .query(By.directive(MatDatepicker))
          .injector.get<MatDateSelectionModel<Date>>(MatDateSelectionModel);

        model.updateSelection(new Date(2020, 0, 1), null);
        fixture.detectChanges();

        expect(valueDuringChangeEvent).toBe('1/1/2020');
      });

      it('should not fire dateInput when typing an invalid value', () => {
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        inputEl.value = 'a';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        inputEl.value = 'b';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();
      });
    });

    describe('with ISO 8601 strings as input', () => {
      let fixture: ComponentFixture<DatepickerWithISOStrings>;
      let testComponent: DatepickerWithISOStrings;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithISOStrings, [MatNativeDateModule]);
        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should coerce ISO strings', fakeAsync(() => {
        expect(() => fixture.detectChanges()).not.toThrow();
        flush();
        fixture.detectChanges();

        expect(testComponent.datepicker.startAt).toEqual(new Date(2017, JUL, 1));
        expect(testComponent.datepickerInput.value).toEqual(new Date(2017, JUN, 1));
        expect(testComponent.datepickerInput.min).toEqual(new Date(2017, JAN, 1));
        expect(testComponent.datepickerInput.max).toEqual(new Date(2017, DEC, 31));
      }));
    });

    describe('with events', () => {
      let fixture: ComponentFixture<DatepickerWithEvents>;
      let testComponent: DatepickerWithEvents;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithEvents, [MatNativeDateModule]);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
      }));

      it('should dispatch an event when a datepicker is opened', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();

        expect(testComponent.openedSpy).toHaveBeenCalled();
      }));

      it('should dispatch an event when a datepicker is closed', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        tick();

        testComponent.datepicker.close();
        flush();
        fixture.detectChanges();

        expect(testComponent.closedSpy).toHaveBeenCalled();
      }));
    });

    describe('datepicker that opens on focus', () => {
      let fixture: ComponentFixture<DatepickerOpeningOnFocus>;
      let testComponent: DatepickerOpeningOnFocus;
      let input: HTMLInputElement;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerOpeningOnFocus, [MatNativeDateModule]);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
        input = fixture.debugElement.query(By.css('input'))!.nativeElement;
      }));

      it('should not reopen if the browser fires the focus event asynchronously', fakeAsync(() => {
        // Stub out the real focus method so we can call it reliably.
        spyOn(input, 'focus').and.callFake(() => {
          // Dispatch the event handler async to simulate the IE11 behavior.
          Promise.resolve().then(() => dispatchFakeEvent(input, 'focus'));
        });

        // Open initially by focusing.
        input.focus();
        fixture.detectChanges();
        tick();
        flush();

        // Due to some browser limitations we can't install a stub on `document.activeElement`
        // so instead we have to override the previously-focused element manually.
        (fixture.componentInstance.datepicker as any)._focusedElementBeforeOpen = input;

        // Ensure that the datepicker is actually open.
        // Ensure that the datepicker is actually open.
        expect(testComponent.datepicker.opened)
          .withContext('Expected datepicker to be open.')
          .toBe(true);

        // Close the datepicker.
        testComponent.datepicker.close();
        fixture.detectChanges();

        // Schedule the input to be focused asynchronously.
        input.focus();
        fixture.detectChanges();
        tick();

        // Flush out the scheduled tasks.
        flush();

        expect(testComponent.datepicker.opened)
          .withContext('Expected datepicker to be closed.')
          .toBe(false);
      }));
    });

    describe('datepicker directionality', () => {
      it('should pass along the directionality to the popup', fakeAsync(() => {
        const fixture = createComponent(
          StandardDatepicker,
          [MatNativeDateModule],
          [
            {
              provide: Directionality,
              useValue: {value: 'rtl'},
            },
          ],
        );

        fixture.detectChanges();
        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();
        tick();

        const overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

        expect(overlay.getAttribute('dir')).toBe('rtl');
      }));

      it('should update the popup direction if the directionality value changes', fakeAsync(() => {
        const dirProvider = {value: 'ltr'};
        const fixture = createComponent(
          StandardDatepicker,
          [MatNativeDateModule],
          [
            {
              provide: Directionality,
              useFactory: () => dirProvider,
            },
          ],
        );

        fixture.detectChanges();
        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();
        tick();

        let overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

        expect(overlay.getAttribute('dir')).toBe('ltr');

        fixture.componentInstance.datepicker.close();
        fixture.detectChanges();
        flush();

        dirProvider.value = 'rtl';
        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();
        tick();

        overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

        expect(overlay.getAttribute('dir')).toBe('rtl');
      }));

      it('should pass along the directionality to the dialog in touch mode', fakeAsync(() => {
        const fixture = createComponent(
          StandardDatepicker,
          [MatNativeDateModule],
          [
            {
              provide: Directionality,
              useValue: {value: 'rtl'},
            },
          ],
        );

        fixture.componentInstance.touch = true;
        fixture.detectChanges();
        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();
        tick();

        const overlay = document.querySelector('.cdk-global-overlay-wrapper')!;

        expect(overlay.getAttribute('dir')).toBe('rtl');
      }));
    });
  });

  describe('with missing DateAdapter and MAT_DATE_FORMATS', () => {
    it('should throw when created', () => {
      expect(() => createComponent(StandardDatepicker)).toThrowError(
        /MatDatepicker: No provider found for .*/,
      );
    });
  });

  describe('datepicker directives without a datepicker', () => {
    it('should not throw on init if toggle does not have a datepicker', () => {
      expect(() => {
        const fixture = createComponent(DatepickerToggleWithNoDatepicker, [MatNativeDateModule]);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should not set aria-haspopup if toggle does not have a datepicker', () => {
      const fixture = createComponent(DatepickerToggleWithNoDatepicker, [MatNativeDateModule]);
      fixture.detectChanges();
      const toggle = fixture.nativeElement.querySelector('.mat-datepicker-toggle button');

      expect(toggle.hasAttribute('aria-haspopup')).toBe(false);
    });

    it('should not throw on init if input does not have a datepicker', () => {
      expect(() => {
        const fixture = createComponent(DatepickerInputWithNoDatepicker, [MatNativeDateModule]);
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should not set aria-haspopup if input does not have a datepicker', () => {
      const fixture = createComponent(DatepickerInputWithNoDatepicker, [MatNativeDateModule]);
      fixture.detectChanges();
      const toggle = fixture.nativeElement.querySelector('input');

      expect(toggle.hasAttribute('aria-haspopup')).toBe(false);
    });
  });

  describe('popup positioning', () => {
    let fixture: ComponentFixture<StandardDatepicker>;
    let testComponent: StandardDatepicker;
    let input: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(StandardDatepicker, [MatNativeDateModule]);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      input = fixture.debugElement.query(By.css('input'))!.nativeElement;
      input.style.position = 'fixed';
    }));

    it('should be below and to the right when there is plenty of space', fakeAsync(() => {
      input.style.top = input.style.left = '20px';
      testComponent.datepicker.open();
      fixture.detectChanges();
      tick();

      const overlayRect = document.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();

      expect(Math.floor(overlayRect.top))
        .withContext('Expected popup to align to input bottom.')
        .toBe(Math.floor(inputRect.bottom));
      expect(Math.floor(overlayRect.left))
        .withContext('Expected popup to align to input left.')
        .toBe(Math.floor(inputRect.left));
    }));

    it('should be above and to the right when there is no space below', fakeAsync(() => {
      input.style.bottom = input.style.left = '20px';
      testComponent.datepicker.open();
      fixture.detectChanges();
      tick();

      const overlayRect = document.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();

      expect(Math.floor(overlayRect.bottom))
        .withContext('Expected popup to align to input top.')
        .toBe(Math.floor(inputRect.top));
      expect(Math.floor(overlayRect.left))
        .withContext('Expected popup to align to input left.')
        .toBe(Math.floor(inputRect.left));
    }));

    it('should be below and to the left when there is no space on the right', fakeAsync(() => {
      input.style.top = input.style.right = '20px';
      testComponent.datepicker.open();
      fixture.detectChanges();
      tick();

      const overlayRect = document.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();

      expect(Math.floor(overlayRect.top))
        .withContext('Expected popup to align to input bottom.')
        .toBe(Math.floor(inputRect.bottom));
      expect(Math.floor(overlayRect.right))
        .withContext('Expected popup to align to input right.')
        .toBe(Math.floor(inputRect.right));
    }));

    it('should be above and to the left when there is no space on the bottom', fakeAsync(() => {
      input.style.bottom = input.style.right = '20px';
      testComponent.datepicker.open();
      fixture.detectChanges();
      tick();

      const overlayRect = document.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();

      expect(Math.floor(overlayRect.bottom))
        .withContext('Expected popup to align to input top.')
        .toBe(Math.floor(inputRect.top));
      expect(Math.floor(overlayRect.right))
        .withContext('Expected popup to align to input right.')
        .toBe(Math.floor(inputRect.right));
    }));

    it('should be able to customize the calendar position along the X axis', fakeAsync(() => {
      input.style.top = input.style.left = '200px';
      testComponent.xPosition = 'end';
      fixture.detectChanges();

      testComponent.datepicker.open();
      fixture.detectChanges();
      tick();

      const overlayRect = document.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();

      expect(Math.floor(overlayRect.right))
        .withContext('Expected popup to align to input right.')
        .toBe(Math.floor(inputRect.right));
    }));

    it('should be able to customize the calendar position along the Y axis', fakeAsync(() => {
      input.style.bottom = input.style.left = '100px';
      testComponent.yPosition = 'above';
      fixture.detectChanges();

      testComponent.datepicker.open();
      fixture.detectChanges();
      tick();

      const overlayRect = document.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();

      expect(Math.floor(overlayRect.bottom))
        .withContext('Expected popup to align to input top.')
        .toBe(Math.floor(inputRect.top));
    }));
  });

  describe('internationalization', () => {
    let fixture: ComponentFixture<DatepickerWithi18n>;
    let testComponent: DatepickerWithi18n;
    let input: HTMLInputElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(
        DatepickerWithi18n,
        [MatNativeDateModule, NativeDateModule],
        [{provide: MAT_DATE_LOCALE, useValue: 'de-DE'}],
      );
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    }));

    it('should have the correct input value even when inverted date format', fakeAsync(() => {
      if (typeof Intl === 'undefined') {
        // Skip this test if the internationalization API is not supported in the current
        // browser. Browsers like Safari 9 do not support the "Intl" API.
        return;
      }

      const selected = new Date(2017, SEP, 1);
      testComponent.date = selected;
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      // Normally the proper date format would 01.09.2017, but some browsers seem format the
      // date without the leading zero. (e.g. 1.9.2017).
      expect(input.value).toMatch(/0?1\.0?9\.2017/);
      expect(testComponent.datepickerInput.value).toBe(selected);
    }));
  });

  describe('datepicker with custom header', () => {
    let fixture: ComponentFixture<DatepickerWithCustomHeader>;
    let testComponent: DatepickerWithCustomHeader;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(
        DatepickerWithCustomHeader,
        [MatNativeDateModule],
        [],
        [CustomHeaderForDatepicker],
      );
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
    }));

    it('should instantiate a datepicker with a custom header', fakeAsync(() => {
      expect(testComponent).toBeTruthy();
    }));

    it('should find the standard header element', fakeAsync(() => {
      testComponent.datepicker.open();
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();

      expect(document.querySelector('mat-calendar-header')).toBeTruthy();
    }));

    it('should find the custom element', fakeAsync(() => {
      testComponent.datepicker.open();
      fixture.detectChanges();
      tick();
      flush();
      fixture.detectChanges();

      expect(document.querySelector('.custom-element')).toBeTruthy();
    }));
  });

  it('should not trigger validators if new date object for same date is set for `min`', () => {
    const fixture = createComponent(
      DatepickerInputWithCustomValidator,
      [MatNativeDateModule],
      undefined,
      [CustomValidator],
    );
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
    const fixture = createComponent(
      DatepickerInputWithCustomValidator,
      [MatNativeDateModule],
      undefined,
      [CustomValidator],
    );
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
    const fixture = createComponent(StandardDatepicker, [MatNativeDateModule]);
    fixture.detectChanges();

    const minDate = new Date(2019, 0, 1);
    const spy = jasmine.createSpy('stateChanges spy');
    const subscription = fixture.componentInstance.datepickerInput.stateChanges.subscribe(spy);

    fixture.componentInstance.min = minDate;
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);

    fixture.componentInstance.min = new Date(minDate);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);

    subscription.unsubscribe();
  });

  it('should not emit to `stateChanges` if new date object for same date is set for `max`', () => {
    const fixture = createComponent(StandardDatepicker, [MatNativeDateModule]);
    fixture.detectChanges();

    const maxDate = new Date(2120, 0, 1);
    const spy = jasmine.createSpy('stateChanges spy');
    const subscription = fixture.componentInstance.datepickerInput.stateChanges.subscribe(spy);

    fixture.componentInstance.max = maxDate;
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);

    fixture.componentInstance.max = new Date(maxDate);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);

    subscription.unsubscribe();
  });

  describe('panelClass input', () => {
    let fixture: ComponentFixture<PanelClassDatepicker>;
    let testComponent: PanelClassDatepicker;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(PanelClassDatepicker, [MatNativeDateModule]);
      fixture.detectChanges();

      testComponent = fixture.componentInstance;
    }));

    afterEach(fakeAsync(() => {
      testComponent.datepicker.close();
      fixture.detectChanges();
      flush();
    }));

    it('should accept a single class', () => {
      testComponent.panelClass = 'foobar';
      fixture.detectChanges();
      expect(testComponent.datepicker.panelClass).toEqual(['foobar']);
    });

    it('should accept multiple classes', () => {
      testComponent.panelClass = 'foo bar';
      fixture.detectChanges();
      expect(testComponent.datepicker.panelClass).toEqual(['foo', 'bar']);
    });

    it('should work with ngClass', fakeAsync(() => {
      testComponent.panelClass = ['foo', 'bar'];
      testComponent.datepicker.open();
      fixture.detectChanges();
      tick();

      const actualClasses = document.querySelector(
        '.mat-datepicker-content .mat-calendar',
      )!.classList;
      expect(actualClasses.contains('foo')).toBe(true);
      expect(actualClasses.contains('bar')).toBe(true);
    }));
  });
});

/**
 * Styles that set input elements to a fixed width. This helps with client rect measurements
 * (i.e. that the datepicker aligns properly). Inputs have different dimensions in different
 * browsers. e.g. in Firefox the input width is uneven, causing unexpected deviations in measuring.
 * Note: The input should be able to shrink as on iOS the viewport width is very little but the
 * datepicker inputs should not leave the viewport (as that throws off measuring too).
 */
const inputFixedWidthStyles = `
  input {
    width: 100%;
    max-width: 150px;
    border: none;
    box-sizing: border-box;
  }
`;

@Component({
  template: `
    <input [matDatepicker]="d" [value]="date" [min]="min" [max]="max">
    <mat-datepicker
      #d
      [touchUi]="touch"
      [disabled]="disabled"
      [opened]="opened"
      [xPosition]="xPosition"
      [yPosition]="yPosition"></mat-datepicker>
  `,
  styles: [inputFixedWidthStyles],
})
class StandardDatepicker {
  opened = false;
  touch = false;
  disabled = false;
  date: Date | null = new Date(2020, JAN, 1);
  min: Date;
  max: Date;
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) datepickerInput: MatDatepickerInput<Date>;
  xPosition: DatepickerDropdownPositionX;
  yPosition: DatepickerDropdownPositionY;
}

@Component({
  template: `
    <input [matDatepicker]="d"><input [matDatepicker]="d"><mat-datepicker #d></mat-datepicker>
  `,
})
class MultiInputDatepicker {}

@Component({
  template: `<mat-datepicker #d></mat-datepicker>`,
})
class NoInputDatepicker {
  @ViewChild('d') datepicker: MatDatepicker<Date>;
}

@Component({
  template: `
    <input [matDatepicker]="d" [value]="date">
    <mat-datepicker #d [startAt]="startDate"></mat-datepicker>
  `,
})
class DatepickerWithStartAt {
  date = new Date(2020, JAN, 1);
  startDate = new Date(2010, JAN, 1);
  @ViewChild('d') datepicker: MatDatepicker<Date>;
}

@Component({
  template: `
    <input [matDatepicker]="d" [value]="date">
    <mat-datepicker #d startView="year" (monthSelected)="onYearSelection()"></mat-datepicker>
  `,
})
class DatepickerWithStartViewYear {
  date = new Date(2020, JAN, 1);
  @ViewChild('d') datepicker: MatDatepicker<Date>;

  onYearSelection() {}
}

@Component({
  template: `
    <input [matDatepicker]="d" [value]="date">
    <mat-datepicker #d startView="multi-year"
        (yearSelected)="onMultiYearSelection()"></mat-datepicker>
  `,
})
class DatepickerWithStartViewMultiYear {
  date = new Date(2020, JAN, 1);
  @ViewChild('d') datepicker: MatDatepicker<Date>;

  onMultiYearSelection() {}
}

@Component({
  template: `
    <input [(ngModel)]="selected" [matDatepicker]="d">
    <mat-datepicker #d></mat-datepicker>
  `,
})
class DatepickerWithNgModel {
  selected: Date | null = null;
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) datepickerInput: MatDatepickerInput<Date>;
}

@Component({
  template: `
    <input [formControl]="formControl" [matDatepicker]="d">
    <mat-datepicker-toggle [for]="d"></mat-datepicker-toggle>
    <mat-datepicker #d></mat-datepicker>
  `,
})
class DatepickerWithFormControl {
  formControl = new FormControl<Date | null>(null);
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) datepickerInput: MatDatepickerInput<Date>;
  @ViewChild(MatDatepickerToggle) datepickerToggle: MatDatepickerToggle<Date>;
}

@Component({
  template: `
    <input [matDatepicker]="d">
    <mat-datepicker-toggle [for]="d" [aria-label]="ariaLabel"></mat-datepicker-toggle>
    <mat-datepicker #d [touchUi]="touchUI" [restoreFocus]="restoreFocus"></mat-datepicker>
  `,
})
class DatepickerWithToggle {
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) input: MatDatepickerInput<Date>;
  touchUI = true;
  restoreFocus = true;
  ariaLabel: string;
}

@Component({
  encapsulation: ViewEncapsulation.ShadowDom,
  template: `
    <input [matDatepicker]="d">
    <mat-datepicker-toggle [for]="d" [aria-label]="ariaLabel"></mat-datepicker-toggle>
    <mat-datepicker #d [touchUi]="touchUI" [restoreFocus]="restoreFocus"></mat-datepicker>
  `,
})
class DatepickerWithToggleInShadowDom extends DatepickerWithToggle {}

@Component({
  template: `
    <input [matDatepicker]="d">
    <mat-datepicker-toggle [for]="d">
      <div class="custom-icon" matDatepickerToggleIcon></div>
    </mat-datepicker-toggle>
    <mat-datepicker #d></mat-datepicker>
  `,
})
class DatepickerWithCustomIcon {}

@Component({
  template: `
      <mat-form-field>
        <mat-label>Pick a date</mat-label>
        <input matInput [matDatepicker]="d">
        <mat-datepicker #d></mat-datepicker>
      </mat-form-field>
  `,
})
class FormFieldDatepicker {
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) datepickerInput: MatDatepickerInput<Date>;
  @ViewChild(MatFormField) formField: MatFormField;
}

@Component({
  template: `
    <input [matDatepicker]="d" [(ngModel)]="date" [min]="minDate" [max]="maxDate">
    <mat-datepicker-toggle [for]="d"></mat-datepicker-toggle>
    <mat-datepicker #d></mat-datepicker>
  `,
})
class DatepickerWithMinAndMaxValidation {
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(NgModel) model: NgModel;
  date: Date | null;
  minDate = new Date(2010, JAN, 1);
  maxDate = new Date(2020, JAN, 1);
}

@Component({
  template: `
    <input [matDatepicker]="d" [(ngModel)]="date" [matDatepickerFilter]="filter">
    <mat-datepicker-toggle [for]="d"></mat-datepicker-toggle>
    <mat-datepicker #d [touchUi]="true"></mat-datepicker>
  `,
})
class DatepickerWithFilterAndValidation {
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(NgModel) model: NgModel;
  date: Date;
  filter = (date: Date | null) => date?.getDate() != 1;
}

@Component({
  template: `
    <input [matDatepicker]="d" (change)="onChange()" (input)="onInput()"
           (dateChange)="onDateChange()" (dateInput)="onDateInput()">
    <mat-datepicker #d [touchUi]="true"></mat-datepicker>
  `,
})
class DatepickerWithChangeAndInputEvents {
  @ViewChild('d') datepicker: MatDatepicker<Date>;

  onChange() {}

  onInput() {}

  onDateChange() {}

  onDateInput() {}
}

@Component({
  template: `
    <input [matDatepicker]="d" [(ngModel)]="date">
    <mat-datepicker #d></mat-datepicker>
  `,
})
class DatepickerWithi18n {
  date: Date | null = new Date(2010, JAN, 1);
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) datepickerInput: MatDatepickerInput<Date>;
}

@Component({
  template: `
    <input [matDatepicker]="d" [(ngModel)]="value" [min]="min" [max]="max">
    <mat-datepicker #d [startAt]="startAt"></mat-datepicker>
  `,
})
class DatepickerWithISOStrings {
  value = new Date(2017, JUN, 1).toISOString();
  min = new Date(2017, JAN, 1).toISOString();
  max = new Date(2017, DEC, 31).toISOString();
  startAt = new Date(2017, JUL, 1).toISOString();
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) datepickerInput: MatDatepickerInput<Date>;
}

@Component({
  template: `
    <input [(ngModel)]="selected" [matDatepicker]="d">
    <mat-datepicker (opened)="openedSpy()" (closed)="closedSpy()" #d></mat-datepicker>
  `,
})
class DatepickerWithEvents {
  selected: Date | null = null;
  openedSpy = jasmine.createSpy('opened spy');
  closedSpy = jasmine.createSpy('closed spy');
  @ViewChild('d') datepicker: MatDatepicker<Date>;
}

@Component({
  template: `
    <input (focus)="d.open()" [matDatepicker]="d">
    <mat-datepicker #d="matDatepicker"></mat-datepicker>
  `,
})
class DatepickerOpeningOnFocus {
  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
}

@Component({
  template: `
    <input [matDatepicker]="ch">
    <mat-datepicker #ch [calendarHeaderComponent]="customHeaderForDatePicker"></mat-datepicker>
  `,
})
class DatepickerWithCustomHeader {
  @ViewChild('ch') datepicker: MatDatepicker<Date>;
  customHeaderForDatePicker = CustomHeaderForDatepicker;
}

@Component({
  template: `
    <div class="custom-element">Custom element</div>
    <mat-calendar-header></mat-calendar-header>
  `,
})
class CustomHeaderForDatepicker {}

@Component({
  template: `
    <input [matDatepicker]="assignedDatepicker" [value]="date">
    <mat-datepicker #d [touchUi]="touch"></mat-datepicker>
  `,
})
class DelayedDatepicker {
  @ViewChild('d') datepicker: MatDatepicker<Date>;
  @ViewChild(MatDatepickerInput) datepickerInput: MatDatepickerInput<Date>;
  date: Date | null;
  assignedDatepicker: MatDatepicker<Date>;
}

@Component({
  template: `
    <input [matDatepicker]="d">
    <mat-datepicker-toggle tabIndex="7" [for]="d" [disabled]="disabled">
      <div class="custom-icon" matDatepickerToggleIcon></div>
    </mat-datepicker-toggle>
    <mat-datepicker #d></mat-datepicker>
  `,
})
class DatepickerWithTabindexOnToggle {
  disabled = false;
}

@Component({
  template: `
    <mat-datepicker-toggle></mat-datepicker-toggle>
  `,
})
class DatepickerToggleWithNoDatepicker {}

@Component({
  template: `
    <input [matDatepicker]="d">
  `,
})
class DatepickerInputWithNoDatepicker {}

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
    <input [matDatepicker]="d" [(ngModel)]="value" [min]="min" [max]="max" customValidator>
    <mat-datepicker #d></mat-datepicker>
  `,
})
class DatepickerInputWithCustomValidator {
  @ViewChild(CustomValidator) validator: CustomValidator;
  value: Date;
  min: Date;
  max: Date;
}

@Component({
  template: `
  <input [matDatepicker]="d" [value]="date">
  <mat-datepicker [panelClass]="panelClass" touchUi #d></mat-datepicker>
  `,
})
class PanelClassDatepicker {
  date = new Date(0);
  panelClass: any;
  @ViewChild('d') datepicker: MatDatepicker<Date>;
}
