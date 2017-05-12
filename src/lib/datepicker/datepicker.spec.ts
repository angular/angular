import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MdDatepickerModule} from './index';
import {Component, ViewChild} from '@angular/core';
import {MdDatepicker} from './datepicker';
import {MdDatepickerInput} from './datepicker-input';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {dispatchFakeEvent, dispatchMouseEvent} from '../core/testing/dispatch-events';
import {MdInputModule} from '../input/index';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MdNativeDateModule} from '../core/datetime/index';


// When constructing a Date, the month is zero-based. This can be confusing, since people are
// used to seeing them one-based. So we create these aliases to make reading the tests easier.
const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9,
      NOV = 10, DEC = 11;


describe('MdDatepicker', () => {
  describe('with MdNativeDateModule', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          FormsModule,
          MdDatepickerModule,
          MdInputModule,
          MdNativeDateModule,
          NoopAnimationsModule,
          ReactiveFormsModule,
        ],
        declarations: [
          DatepickerWithFilterAndValidation,
          DatepickerWithFormControl,
          DatepickerWithMinAndMax,
          DatepickerWithNgModel,
          DatepickerWithStartAt,
          DatepickerWithToggle,
          InputContainerDatepicker,
          MultiInputDatepicker,
          NoInputDatepicker,
          StandardDatepicker,
        ],
      });

      TestBed.compileComponents();
    }));

    describe('standard datepicker', () => {
      let fixture: ComponentFixture<StandardDatepicker>;
      let testComponent: StandardDatepicker;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(StandardDatepicker);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('open non-touch should open popup', async(() => {
        expect(document.querySelector('.cdk-overlay-pane')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).not.toBeNull();
      }));

      it('open touch should open dialog', async(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        expect(document.querySelector('md-dialog-container')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('md-dialog-container')).not.toBeNull();
      }));

      it('close should close popup', async(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        let popup = document.querySelector('.cdk-overlay-pane');
        expect(popup).not.toBeNull();
        expect(parseInt(getComputedStyle(popup).height)).not.toBe(0);

        testComponent.datepicker.close();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(parseInt(getComputedStyle(popup).height)).toBe(0);
        });
      }));

      it('close should close dialog', async(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('md-dialog-container')).not.toBeNull();

        testComponent.datepicker.close();
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(document.querySelector('md-dialog-container')).toBeNull();
        });
      }));

      it('setting selected should update input and close calendar', async(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('md-dialog-container')).not.toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 1));

        let cells = document.querySelectorAll('.mat-calendar-body-cell');
        dispatchMouseEvent(cells[1], 'click');
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(document.querySelector('md-dialog-container')).toBeNull();
          expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 2));
        });
      }));

      it('startAt should fallback to input value', () => {
        expect(testComponent.datepicker.startAt).toEqual(new Date(2020, JAN, 1));
      });

      it('should attach popup to native input', () => {
        let attachToRef = testComponent.datepickerInput.getPopupConnectionElementRef();
        expect(attachToRef.nativeElement.tagName.toLowerCase())
            .toBe('input', 'popup should be attached to native input');
      });
    });

    describe('datepicker with too many inputs', () => {
      it('should throw when multiple inputs registered', async(() => {
        let fixture = TestBed.createComponent(MultiInputDatepicker);
        expect(() => fixture.detectChanges()).toThrow();
      }));
    });

    describe('datepicker with no inputs', () => {
      let fixture: ComponentFixture<NoInputDatepicker>;
      let testComponent: NoInputDatepicker;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(NoInputDatepicker);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should throw when opened with no registered inputs', async(() => {
        expect(() => testComponent.datepicker.open()).toThrow();
      }));
    });

    describe('datepicker with startAt', () => {
      let fixture: ComponentFixture<DatepickerWithStartAt>;
      let testComponent: DatepickerWithStartAt;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithStartAt);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('explicit startAt should override input value', () => {
        expect(testComponent.datepicker.startAt).toEqual(new Date(2010, JAN, 1));
      });
    });

    describe('datepicker with ngModel', () => {
      let fixture: ComponentFixture<DatepickerWithNgModel>;
      let testComponent: DatepickerWithNgModel;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithNgModel);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          testComponent = fixture.componentInstance;
        });
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should update datepicker when model changes', async(() => {
        expect(testComponent.datepickerInput.value).toBeNull();
        expect(testComponent.datepicker._selected).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.selected = selected;
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(testComponent.datepickerInput.value).toEqual(selected);
          expect(testComponent.datepicker._selected).toEqual(selected);
        });
      }));

      it('should update model when date is selected', async(() => {
        expect(testComponent.selected).toBeNull();
        expect(testComponent.datepickerInput.value).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.datepicker._selectAndClose(selected);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(testComponent.selected).toEqual(selected);
          expect(testComponent.datepickerInput.value).toEqual(selected);
        });
      }));

      it('should mark input dirty after input event', () => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-dirty');
      });

      it('should mark input dirty after date selected', async(() => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        testComponent.datepicker._selectAndClose(new Date(2017, JAN, 1));
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(inputEl.classList).toContain('ng-dirty');
        });
      }));

      it('should not mark dirty after model change', async(() => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        testComponent.selected = new Date(2017, JAN, 1);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(inputEl.classList).toContain('ng-pristine');
        });
      }));

      it('should mark input touched on blur', () => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-untouched');

        dispatchFakeEvent(inputEl, 'focus');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-untouched');

        dispatchFakeEvent(inputEl, 'blur');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-touched');
      });
    });

    describe('datepicker with formControl', () => {
      let fixture: ComponentFixture<DatepickerWithFormControl>;
      let testComponent: DatepickerWithFormControl;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithFormControl);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should update datepicker when formControl changes', () => {
        expect(testComponent.datepickerInput.value).toBeNull();
        expect(testComponent.datepicker._selected).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.formControl.setValue(selected);
        fixture.detectChanges();

        expect(testComponent.datepickerInput.value).toEqual(selected);
        expect(testComponent.datepicker._selected).toEqual(selected);
      });

      it('should update formControl when date is selected', () => {
        expect(testComponent.formControl.value).toBeNull();
        expect(testComponent.datepickerInput.value).toBeNull();

        let selected = new Date(2017, JAN, 1);
        testComponent.datepicker._selectAndClose(selected);
        fixture.detectChanges();

        expect(testComponent.formControl.value).toEqual(selected);
        expect(testComponent.datepickerInput.value).toEqual(selected);
      });

      it('should disable input when form control disabled', () => {
        let inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.disabled).toBe(false);

        testComponent.formControl.disable();
        fixture.detectChanges();

        expect(inputEl.disabled).toBe(true);
      });
    });

    describe('datepicker with mdDatepickerToggle', () => {
      let fixture: ComponentFixture<DatepickerWithToggle>;
      let testComponent: DatepickerWithToggle;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithToggle);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should open calendar when toggle clicked', async(() => {
        expect(document.querySelector('md-dialog-container')).toBeNull();

        let toggle = fixture.debugElement.query(By.css('button'));
        dispatchMouseEvent(toggle.nativeElement, 'click');
        fixture.detectChanges();

        expect(document.querySelector('md-dialog-container')).not.toBeNull();
      }));
    });

    describe('datepicker inside input-container', () => {
      let fixture: ComponentFixture<InputContainerDatepicker>;
      let testComponent: InputContainerDatepicker;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(InputContainerDatepicker);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should attach popup to input-container underline', () => {
        let attachToRef = testComponent.datepickerInput.getPopupConnectionElementRef();
        expect(attachToRef.nativeElement.classList.contains('mat-input-underline'))
            .toBe(true, 'popup should be attached to input-container underline');
      });
    });

    describe('datepicker with min and max dates', () => {
      let fixture: ComponentFixture<DatepickerWithMinAndMax>;
      let testComponent: DatepickerWithMinAndMax;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithMinAndMax);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should use min and max dates specified by the input', () => {
        expect(testComponent.datepicker._minDate).toEqual(new Date(2010, JAN, 1));
        expect(testComponent.datepicker._maxDate).toEqual(new Date(2020, JAN, 1));
      });
    });

    describe('datepicker with filter and validation', () => {
      let fixture: ComponentFixture<DatepickerWithFilterAndValidation>;
      let testComponent: DatepickerWithFilterAndValidation;

      beforeEach(async(() => {
        fixture = TestBed.createComponent(DatepickerWithFilterAndValidation);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(async(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should mark input invalid', async(() => {
        testComponent.date = new Date(2017, JAN, 1);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
              .toContain('ng-invalid');

          testComponent.date = new Date(2017, JAN, 2);
          fixture.detectChanges();

          fixture.whenStable().then(() => {
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
                .not.toContain('ng-invalid');
          });
        });
      }));

      it('should disable filtered calendar cells', () => {
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('md-dialog-container')).not.toBeNull();

        let cells = document.querySelectorAll('.mat-calendar-body-cell');
        expect(cells[0].classList).toContain('mat-calendar-body-disabled');
        expect(cells[1].classList).not.toContain('mat-calendar-body-disabled');
      });
    });
  });

  describe('with missing DateAdapter and MD_DATE_FORMATS', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        imports: [
          FormsModule,
          MdDatepickerModule,
          MdInputModule,
          NoopAnimationsModule,
          ReactiveFormsModule,
        ],
        declarations: [StandardDatepicker],
      });

      TestBed.compileComponents();
    }));

    it('should throw when created', () => {
      expect(() => TestBed.createComponent(StandardDatepicker))
          .toThrowError(/MdDatepicker: No provider found for .*/);
    });
  });
});


@Component({
  template: `
    <input [mdDatepicker]="d" [value]="date">
    <md-datepicker #d [touchUi]="touch"></md-datepicker>
  `,
})
class StandardDatepicker {
  touch = false;
  date = new Date(2020, JAN, 1);
  @ViewChild('d') datepicker: MdDatepicker<Date>;
  @ViewChild(MdDatepickerInput) datepickerInput: MdDatepickerInput<Date>;
}


@Component({
  template: `
    <input [mdDatepicker]="d"><input [mdDatepicker]="d"><md-datepicker #d></md-datepicker>
  `,
})
class MultiInputDatepicker {}


@Component({
  template: `<md-datepicker #d></md-datepicker>`,
})
class NoInputDatepicker {
  @ViewChild('d') datepicker: MdDatepicker<Date>;
}


@Component({
  template: `
    <input [mdDatepicker]="d" [value]="date">
    <md-datepicker #d [startAt]="startDate"></md-datepicker>
  `,
})
class DatepickerWithStartAt {
  date = new Date(2020, JAN, 1);
  startDate = new Date(2010, JAN, 1);
  @ViewChild('d') datepicker: MdDatepicker<Date>;
}


@Component({
  template: `<input [(ngModel)]="selected" [mdDatepicker]="d"><md-datepicker #d></md-datepicker>`,
})
class DatepickerWithNgModel {
  selected: Date = null;
  @ViewChild('d') datepicker: MdDatepicker<Date>;
  @ViewChild(MdDatepickerInput) datepickerInput: MdDatepickerInput<Date>;
}


@Component({
  template: `
    <input [formControl]="formControl" [mdDatepicker]="d">
    <md-datepicker #d></md-datepicker>
  `,
})
class DatepickerWithFormControl {
  formControl = new FormControl();
  @ViewChild('d') datepicker: MdDatepicker<Date>;
  @ViewChild(MdDatepickerInput) datepickerInput: MdDatepickerInput<Date>;
}


@Component({
  template: `
    <input [mdDatepicker]="d">
    <button [mdDatepickerToggle]="d"></button>
    <md-datepicker #d [touchUi]="true"></md-datepicker>
  `,
})
class DatepickerWithToggle {
  @ViewChild('d') datepicker: MdDatepicker<Date>;
}


@Component({
  template: `
      <md-input-container>
        <input mdInput [mdDatepicker]="d">
        <md-datepicker #d></md-datepicker>
      </md-input-container>
  `,
})
class InputContainerDatepicker {
  @ViewChild('d') datepicker: MdDatepicker<Date>;
  @ViewChild(MdDatepickerInput) datepickerInput: MdDatepickerInput<Date>;
}


@Component({
  template: `
    <input [mdDatepicker]="d" [min]="minDate" [max]="maxDate">
    <md-datepicker #d></md-datepicker>
  `,
})
class DatepickerWithMinAndMax {
  minDate = new Date(2010, JAN, 1);
  maxDate = new Date(2020, JAN, 1);
  @ViewChild('d') datepicker: MdDatepicker<Date>;
}


@Component({
  template: `
    <input [mdDatepicker]="d" [(ngModel)]="date" [mdDatepickerFilter]="filter">
    <button [mdDatepickerToggle]="d"></button>
    <md-datepicker #d [touchUi]="true"></md-datepicker>
  `,
})
class DatepickerWithFilterAndValidation {
  @ViewChild('d') datepicker: MdDatepicker<Date>;
  date: Date;
  filter = (date: Date) => date.getDate() != 1;
}
