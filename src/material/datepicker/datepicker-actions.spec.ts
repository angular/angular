import {Component, ElementRef, Type, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, flush, fakeAsync, tick} from '@angular/core/testing';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatNativeDateModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {CommonModule} from '@angular/common';
import {MatDatepickerModule} from './datepicker-module';
import {MatDatepicker} from './datepicker';

describe('MatDatepickerActions', () => {
  function createComponent<T>(component: Type<T>): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
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

  it('should render the actions inside calendar panel in popup mode', fakeAsync(() => {
    const fixture = createComponent(DatepickerWithActions);
    fixture.detectChanges();
    fixture.componentInstance.datepicker.open();
    fixture.detectChanges();
    tick();
    flush();

    const actions = document.querySelector('.mat-datepicker-content .mat-datepicker-actions');
    expect(actions).toBeTruthy();
    expect(actions?.querySelector('.cancel')).toBeTruthy();
    expect(actions?.querySelector('.apply')).toBeTruthy();
  }));

  it('should render the actions inside calendar panel in touch UI mode', fakeAsync(() => {
    const fixture = createComponent(DatepickerWithActions);
    fixture.componentInstance.touchUi = true;
    fixture.detectChanges();
    fixture.componentInstance.datepicker.open();
    fixture.detectChanges();
    tick();
    flush();

    const actions = document.querySelector('.mat-datepicker-content .mat-datepicker-actions');
    expect(actions).toBeTruthy();
    expect(actions?.querySelector('.cancel')).toBeTruthy();
    expect(actions?.querySelector('.apply')).toBeTruthy();
  }));

  it('should not assign the value or close the datepicker when a value is selected', fakeAsync(() => {
    const fixture = createComponent(DatepickerWithActions);
    fixture.detectChanges();
    const {control, datepicker, onDateChange, input} = fixture.componentInstance;
    datepicker.open();
    fixture.detectChanges();
    tick();

    const content = document.querySelector('.mat-datepicker-content')!;
    const cells = content.querySelectorAll<HTMLElement>('.mat-calendar-body-cell');

    expect(datepicker.opened).toBe(true);
    expect(input.nativeElement.value).toBeFalsy();
    expect(control.value).toBeFalsy();
    expect(onDateChange).not.toHaveBeenCalled();
    expect(content.querySelector('.mat-calendar-body-selected')).toBeFalsy();

    cells[10].click();
    fixture.detectChanges();
    flush();

    expect(datepicker.opened).toBe(true);
    expect(input.nativeElement.value).toBeFalsy();
    expect(control.value).toBeFalsy();
    expect(onDateChange).not.toHaveBeenCalled();
    expect(content.querySelector('.mat-calendar-body-selected')).toBeTruthy();
  }));

  it('should close without changing the value when clicking on the cancel button', fakeAsync(() => {
    const fixture = createComponent(DatepickerWithActions);
    fixture.detectChanges();
    const {control, datepicker, onDateChange, input} = fixture.componentInstance;
    datepicker.open();
    fixture.detectChanges();
    tick();
    flush();

    const content = document.querySelector('.mat-datepicker-content')!;
    const cells = content.querySelectorAll<HTMLElement>('.mat-calendar-body-cell');

    expect(datepicker.opened).toBe(true);
    expect(input.nativeElement.value).toBeFalsy();
    expect(control.value).toBeFalsy();
    expect(onDateChange).not.toHaveBeenCalled();
    expect(content.querySelector('.mat-calendar-body-selected')).toBeFalsy();

    cells[10].click();
    fixture.detectChanges();
    tick();
    flush();

    expect(datepicker.opened).toBe(true);
    expect(input.nativeElement.value).toBeFalsy();
    expect(control.value).toBeFalsy();
    expect(onDateChange).not.toHaveBeenCalled();
    expect(content.querySelector('.mat-calendar-body-selected')).toBeTruthy();

    (content.querySelector('.cancel') as HTMLElement).click();
    fixture.detectChanges();
    flush();

    expect(datepicker.opened).toBe(false);
    expect(input.nativeElement.value).toBeFalsy();
    expect(control.value).toBeFalsy();
    expect(onDateChange).not.toHaveBeenCalled();
  }));

  it('should close while keeping the previous control value when clicking on cancel', fakeAsync(() => {
    const fixture = createComponent(DatepickerWithActions);
    fixture.detectChanges();
    const {control, datepicker, onDateChange} = fixture.componentInstance;
    const value = new Date(2021, 0, 20);
    control.setValue(value);
    fixture.detectChanges();
    datepicker.open();
    fixture.detectChanges();
    tick();
    flush();

    const content = document.querySelector('.mat-datepicker-content')!;
    const cells = content.querySelectorAll<HTMLElement>('.mat-calendar-body-cell');

    expect(datepicker.opened).toBe(true);
    expect(control.value).toBe(value);
    expect(onDateChange).not.toHaveBeenCalled();

    cells[10].click();
    fixture.detectChanges();
    tick();
    flush();

    expect(datepicker.opened).toBe(true);
    expect(control.value).toBe(value);
    expect(onDateChange).not.toHaveBeenCalled();

    (content.querySelector('.cancel') as HTMLElement).click();
    fixture.detectChanges();
    flush();

    expect(datepicker.opened).toBe(false);
    expect(control.value).toBe(value);
    expect(onDateChange).not.toHaveBeenCalled();
  }));

  it('should close and accept the value when clicking on the apply button', fakeAsync(() => {
    const fixture = createComponent(DatepickerWithActions);
    fixture.detectChanges();
    const {control, datepicker, onDateChange, input} = fixture.componentInstance;
    datepicker.open();
    fixture.detectChanges();
    tick();
    flush();

    const content = document.querySelector('.mat-datepicker-content')!;
    const cells = content.querySelectorAll<HTMLElement>('.mat-calendar-body-cell');

    expect(datepicker.opened).toBe(true);
    expect(input.nativeElement.value).toBeFalsy();
    expect(control.value).toBeFalsy();
    expect(onDateChange).not.toHaveBeenCalled();
    expect(content.querySelector('.mat-calendar-body-selected')).toBeFalsy();

    cells[10].click();
    fixture.detectChanges();
    tick();
    flush();

    expect(datepicker.opened).toBe(true);
    expect(input.nativeElement.value).toBeFalsy();
    expect(control.value).toBeFalsy();
    expect(onDateChange).not.toHaveBeenCalled();
    expect(content.querySelector('.mat-calendar-body-selected')).toBeTruthy();

    (content.querySelector('.apply') as HTMLElement).click();
    fixture.detectChanges();
    flush();

    expect(datepicker.opened).toBe(false);
    expect(input.nativeElement.value).toBeTruthy();
    expect(control.value).toBeTruthy();
    expect(onDateChange).toHaveBeenCalledTimes(1);
  }));

  it('should revert to the default behavior if the actions are removed', fakeAsync(() => {
    const fixture = createComponent(DatepickerWithActions);
    fixture.detectChanges();
    const {control, datepicker, onDateChange} = fixture.componentInstance;
    datepicker.open();
    fixture.detectChanges();
    tick();
    flush();

    let content = document.querySelector('.mat-datepicker-content')!;
    let actions = content.querySelector('.mat-datepicker-actions')!;
    let cells = content.querySelectorAll<HTMLElement>('.mat-calendar-body-cell');

    expect(actions).toBeTruthy();
    expect(datepicker.opened).toBe(true);
    expect(control.value).toBeFalsy();
    expect(onDateChange).not.toHaveBeenCalled();

    cells[10].click();
    fixture.detectChanges();
    tick();
    flush();

    expect(datepicker.opened).toBe(true);
    expect(control.value).toBeFalsy();
    expect(onDateChange).not.toHaveBeenCalled();

    (actions.querySelector('.cancel') as HTMLElement).click();
    fixture.detectChanges();
    flush();

    expect(datepicker.opened).toBe(false);
    expect(control.value).toBeFalsy();
    expect(onDateChange).not.toHaveBeenCalled();

    fixture.componentInstance.renderActions = false;
    fixture.detectChanges();
    datepicker.open();
    fixture.detectChanges();
    content = document.querySelector('.mat-datepicker-content')!;
    actions = content.querySelector('.mat-datepicker-actions')!;
    cells = content.querySelectorAll<HTMLElement>('.mat-calendar-body-cell');

    expect(actions).toBeFalsy();
    expect(datepicker.opened).toBe(true);
    expect(control.value).toBeFalsy();
    expect(onDateChange).not.toHaveBeenCalled();

    cells[10].click();
    fixture.detectChanges();
    tick();
    flush();

    expect(datepicker.opened).toBe(false);
    expect(control.value).toBeTruthy();
    expect(onDateChange).toHaveBeenCalledTimes(1);
  }));

  it('should be able to toggle the actions while the datepicker is open', fakeAsync(() => {
    const fixture = createComponent(DatepickerWithActions);
    fixture.componentInstance.renderActions = false;
    fixture.detectChanges();

    fixture.componentInstance.datepicker.open();
    fixture.detectChanges();
    tick();
    flush();

    const content = document.querySelector('.mat-datepicker-content')!;
    expect(content.querySelector('.mat-datepicker-actions')).toBeFalsy();

    fixture.componentInstance.renderActions = true;
    fixture.detectChanges();
    expect(content.querySelector('.mat-datepicker-actions')).toBeTruthy();

    fixture.componentInstance.renderActions = false;
    fixture.detectChanges();
    expect(content.querySelector('.mat-datepicker-actions')).toBeFalsy();
  }));
});

@Component({
  template: `
    <mat-form-field>
      <mat-label>Pick a date</mat-label>
      <input
          #input
          matInput
          [matDatepicker]="picker"
          [formControl]="control"
          (dateChange)="onDateChange()">
      <mat-datepicker #picker [touchUi]="touchUi" [startAt]="startAt">
        <mat-datepicker-actions *ngIf="renderActions">
          <button mat-button class="cancel" matDatepickerCancel>Cancel</button>
          <button mat-raised-button class="apply" matDatepickerApply>Apply</button>
        </mat-datepicker-actions>
      </mat-datepicker>
    </mat-form-field>
  `,
})
class DatepickerWithActions {
  @ViewChild(MatDatepicker) datepicker: MatDatepicker<Date>;
  @ViewChild('input', {read: ElementRef}) input: ElementRef<HTMLInputElement>;
  control = new FormControl<Date | null>(null);
  onDateChange = jasmine.createSpy('dateChange spy');
  touchUi = false;
  startAt = new Date(2021, 0, 15);
  renderActions = true;
}
