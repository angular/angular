/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  provideZonelessChangeDetection,
  ViewChild,
} from '@angular/core';
import {
  ControlContainer,
  FormControl,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '../public_api';
import {TestBed} from '@angular/core/testing';

describe('status host binding classes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideZonelessChangeDetection()]});
  });

  it('work in OnPush components', async () => {
    @Component({
      selector: 'test-cmp',
      template: `<input type="text" [formControl]="control" />`,
      imports: [FormsModule, ReactiveFormsModule],
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class App {
      control = new FormControl('old value', [Validators.required]);
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toContain('ng-valid');
    expect(fixture.nativeElement.innerHTML).toContain('ng-untouched');
    expect(fixture.nativeElement.innerHTML).toContain('ng-pristine');

    fixture.componentInstance.control.setValue(null);
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toContain('ng-invalid');

    fixture.debugElement.query((x) => x.name === 'input').triggerEventHandler('blur');
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toContain('ng-touched');

    fixture.componentInstance.control.reset();
    await fixture.whenStable();
    expect(fixture.nativeElement.innerHTML).toContain('ng-untouched');
  });

  it('update on ngModelGroup hosts in OnPush components when the group has no rendered controls', async () => {
    @Component({
      selector: 'collapsed-group',
      // A "collapsed section": the group host renders, its controls do not.
      template: `<div class="group" ngModelGroup="section">collapsed</div>`,
      imports: [FormsModule],
      viewProviders: [{provide: ControlContainer, useExisting: NgForm}],
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class CollapsedGroup {}

    @Component({
      selector: 'test-cmp',
      template: `<form><collapsed-group /></form>`,
      imports: [FormsModule, CollapsedGroup],
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class App {
      @ViewChild(NgForm) ngForm!: NgForm;
    }

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    // The group is registered by `NgForm` in a deferred microtask; the host
    // bindings must still pick the state up once it lands.
    const group = fixture.nativeElement.querySelector('.group');
    expect(group.classList.contains('ng-valid')).toBe(true);
    expect(group.classList.contains('ng-untouched')).toBe(true);
    expect(group.classList.contains('ng-pristine')).toBe(true);

    // Later model-only changes must keep being reflected: nothing inside the
    // group's view ever writes a tracked signal, so this only works if the
    // first binding pass created a dependency.
    fixture.componentInstance.ngForm.form.markAllAsTouched();
    await fixture.whenStable();
    expect(group.classList.contains('ng-touched')).toBe(true);
    expect(group.classList.contains('ng-untouched')).toBe(false);
  });

  it('update on the form host in OnPush components before any control registers', async () => {
    @Component({
      selector: 'test-cmp',
      template: `<form class="form"></form>`,
      imports: [FormsModule],
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class App {}

    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const form = fixture.nativeElement.querySelector('.form');
    expect(form.classList.contains('ng-valid')).toBe(true);
    expect(form.classList.contains('ng-untouched')).toBe(true);
    expect(form.classList.contains('ng-pristine')).toBe(true);
  });
});
