/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalizePassiveListenerOptions} from '@angular/cdk/platform';
import {Component, ElementRef, NgZone, ViewChild} from '@angular/core';
import {ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {EMPTY} from 'rxjs';
import {AutofillEvent, AutofillMonitor} from './autofill';
import {TextFieldModule} from './text-field-module';


const listenerOptions = normalizePassiveListenerOptions({passive: true});


describe('AutofillMonitor', () => {
  let autofillMonitor: AutofillMonitor;
  let fixture: ComponentFixture<Inputs>;
  let testComponent: Inputs;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TextFieldModule],
      declarations: [Inputs],
    }).compileComponents();
  });

  beforeEach(inject([AutofillMonitor], (afm: AutofillMonitor) => {
    autofillMonitor = afm;
    fixture = TestBed.createComponent(Inputs);
    testComponent = fixture.componentInstance;

    for (const input of [testComponent.input1, testComponent.input2, testComponent.input3]) {
      spyOn(input.nativeElement, 'addEventListener');
      spyOn(input.nativeElement, 'removeEventListener');
    }

    fixture.detectChanges();
  }));

  afterEach(() => {
    // Call destroy to make sure we clean up all listeners.
    autofillMonitor.ngOnDestroy();
  });

  it('should add monitored class and listener upon monitoring', () => {
    const inputEl = testComponent.input1.nativeElement;
    expect(inputEl.addEventListener).not.toHaveBeenCalled();

    autofillMonitor.monitor(inputEl);
    expect(inputEl.classList).toContain('cdk-text-field-autofill-monitored');
    expect(inputEl.addEventListener)
        .toHaveBeenCalledWith('animationstart', jasmine.any(Function), listenerOptions);
  });

  it('should not add multiple listeners to the same element', () => {
    const inputEl = testComponent.input1.nativeElement;
    expect(inputEl.addEventListener).not.toHaveBeenCalled();

    autofillMonitor.monitor(inputEl);
    autofillMonitor.monitor(inputEl);
    expect(inputEl.addEventListener).toHaveBeenCalledTimes(1);
  });

  it('should remove monitored class and listener upon stop monitoring', () => {
    const inputEl = testComponent.input1.nativeElement;
    autofillMonitor.monitor(inputEl);
    expect(inputEl.classList).toContain('cdk-text-field-autofill-monitored');
    expect(inputEl.removeEventListener).not.toHaveBeenCalled();

    autofillMonitor.stopMonitoring(inputEl);
    expect(inputEl.classList).not.toContain('cdk-text-field-autofill-monitored');
    expect(inputEl.removeEventListener)
        .toHaveBeenCalledWith('animationstart', jasmine.any(Function), listenerOptions);
  });

  it('should stop monitoring all monitored elements upon destroy', () => {
    const inputEl1 = testComponent.input1.nativeElement;
    const inputEl2 = testComponent.input2.nativeElement;
    const inputEl3 = testComponent.input3.nativeElement;
    autofillMonitor.monitor(inputEl1);
    autofillMonitor.monitor(inputEl2);
    autofillMonitor.monitor(inputEl3);
    expect(inputEl1.removeEventListener).not.toHaveBeenCalled();
    expect(inputEl2.removeEventListener).not.toHaveBeenCalled();
    expect(inputEl3.removeEventListener).not.toHaveBeenCalled();

    autofillMonitor.ngOnDestroy();
    expect(inputEl1.removeEventListener).toHaveBeenCalled();
    expect(inputEl2.removeEventListener).toHaveBeenCalled();
    expect(inputEl3.removeEventListener).toHaveBeenCalled();
  });

  it('should emit and add filled class upon start animation', () => {
    const inputEl = testComponent.input1.nativeElement;
    let animationStartCallback: Function = () => {};
    let autofillStreamEvent: AutofillEvent | null = null;
    inputEl.addEventListener.and.callFake((_: string, cb: Function) => animationStartCallback = cb);
    const autofillStream = autofillMonitor.monitor(inputEl);
    autofillStream.subscribe(event => autofillStreamEvent = event);
    expect(autofillStreamEvent).toBeNull();
    expect(inputEl.classList).not.toContain('cdk-text-field-autofilled');

    animationStartCallback({animationName: 'cdk-text-field-autofill-start', target: inputEl});
    expect(inputEl.classList).toContain('cdk-text-field-autofilled');
    expect(autofillStreamEvent).toEqual({target: inputEl, isAutofilled: true} as any);
  });

  it('should emit and remove filled class upon end animation', () => {
    const inputEl = testComponent.input1.nativeElement;
    let animationStartCallback: Function = () => {};
    let autofillStreamEvent: AutofillEvent | null = null;
    inputEl.addEventListener.and.callFake((_: string, cb: Function) => animationStartCallback = cb);
    const autofillStream = autofillMonitor.monitor(inputEl);
    autofillStream.subscribe(event => autofillStreamEvent = event);
    animationStartCallback({animationName: 'cdk-text-field-autofill-start', target: inputEl});
    expect(inputEl.classList).toContain('cdk-text-field-autofilled');
    expect(autofillStreamEvent).toEqual({target: inputEl, isAutofilled: true} as any);

    animationStartCallback({animationName: 'cdk-text-field-autofill-end', target: inputEl});
    expect(inputEl.classList).not.toContain('cdk-text-field-autofilled');
    expect(autofillStreamEvent).toEqual({target: inputEl, isAutofilled: false} as any);
  });

  it('should cleanup filled class if monitoring stopped in autofilled state', () => {
    const inputEl = testComponent.input1.nativeElement;
    let animationStartCallback: Function = () => {};
    inputEl.addEventListener.and.callFake((_: string, cb: Function) => animationStartCallback = cb);
    autofillMonitor.monitor(inputEl);
    animationStartCallback({animationName: 'cdk-text-field-autofill-start', target: inputEl});
    expect(inputEl.classList).toContain('cdk-text-field-autofilled');

    autofillMonitor.stopMonitoring(inputEl);
    expect(inputEl.classlist).not.toContain('cdk-text-field-autofilled');
  });

  it('should complete the stream when monitoring is stopped', () => {
    const element = testComponent.input1.nativeElement;
    const autofillStream = autofillMonitor.monitor(element);
    const spy = jasmine.createSpy('autofillStream complete');

    autofillStream.subscribe(undefined, undefined, spy);
    expect(spy).not.toHaveBeenCalled();

    autofillMonitor.stopMonitoring(element);
    expect(spy).toHaveBeenCalled();
  });

  it('should emit on stream inside the NgZone', () => {
    const inputEl = testComponent.input1.nativeElement;
    let animationStartCallback: Function = () => {};
    inputEl.addEventListener.and.callFake((_: string, cb: Function) => animationStartCallback = cb);
    const autofillStream = autofillMonitor.monitor(inputEl);
    const spy = jasmine.createSpy('autofill spy');

    autofillStream.subscribe(() => spy(NgZone.isInAngularZone()));
    expect(spy).not.toHaveBeenCalled();

    animationStartCallback({animationName: 'cdk-text-field-autofill-start', target: inputEl});
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('should not emit on init if input is unfilled', () => {
    const inputEl = testComponent.input1.nativeElement;
    let animationStartCallback: Function = () => {};
    inputEl.addEventListener.and.callFake((_: string, cb: Function) => animationStartCallback = cb);
    const autofillStream = autofillMonitor.monitor(inputEl);
    const spy = jasmine.createSpy('autofill spy');
    autofillStream.subscribe(() => spy());
    animationStartCallback({animationName: 'cdk-text-field-autofill-end', target: inputEl});
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('cdkAutofill', () => {
  let autofillMonitor: AutofillMonitor;
  let fixture: ComponentFixture<InputWithCdkAutofilled>;
  let testComponent: InputWithCdkAutofilled;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TextFieldModule],
      declarations: [InputWithCdkAutofilled],
    }).compileComponents();
  });

  beforeEach(inject([AutofillMonitor], (afm: AutofillMonitor) => {
    autofillMonitor = afm;
    spyOn(autofillMonitor, 'monitor').and.returnValue(EMPTY);
    spyOn(autofillMonitor, 'stopMonitoring');
    fixture = TestBed.createComponent(InputWithCdkAutofilled);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should monitor host element on init', () => {
    expect(autofillMonitor.monitor).toHaveBeenCalledWith(testComponent.input);
  });

  it('should stop monitoring host element on destroy', () => {
    expect(autofillMonitor.stopMonitoring).not.toHaveBeenCalled();
    fixture.destroy();
    expect(autofillMonitor.stopMonitoring).toHaveBeenCalledWith(testComponent.input);
  });
});

@Component({
  template: `
    <input #input1>
    <input #input2>
    <input #input3>
  `
})
class Inputs {
  // Cast to `any` so we can stub out some methods in the tests.
  @ViewChild('input1', {static: true}) input1: ElementRef<any>;
  @ViewChild('input2', {static: true}) input2: ElementRef<any>;
  @ViewChild('input3', {static: true}) input3: ElementRef<any>;
}

@Component({
  template: `<input #input cdkAutofill>`
})
class InputWithCdkAutofilled {
  // Cast to `any` so we can stub out some methods in the tests.
  @ViewChild('input') input: ElementRef<any>;
}
