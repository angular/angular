/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {supportsPassiveEventListeners} from '@angular/cdk/platform';
import {Component, ElementRef, ViewChild} from '@angular/core';
import {ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {empty as observableEmpty} from 'rxjs/observable/empty';
import {AutofillEvent, AutofillMonitor} from './autofill';
import {MatInputModule} from './input-module';


const listenerOptions: any = supportsPassiveEventListeners() ? {passive: true} : false;


describe('AutofillMonitor', () => {
  let autofillMonitor: AutofillMonitor;
  let fixture: ComponentFixture<Inputs>;
  let testComponent: Inputs;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatInputModule],
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
    expect(inputEl.classList).toContain('mat-input-autofill-monitored');
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
    expect(inputEl.classList).toContain('mat-input-autofill-monitored');
    expect(inputEl.removeEventListener).not.toHaveBeenCalled();

    autofillMonitor.stopMonitoring(inputEl);
    expect(inputEl.classList).not.toContain('mat-input-autofill-monitored');
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
    inputEl.addEventListener.and.callFake((_, cb) => animationStartCallback = cb);
    const autofillStream = autofillMonitor.monitor(inputEl);
    autofillStream.subscribe(event => autofillStreamEvent = event);
    expect(autofillStreamEvent).toBeNull();
    expect(inputEl.classList).not.toContain('mat-input-autofilled');

    animationStartCallback({animationName: 'mat-input-autofill-start', target: inputEl});
    expect(inputEl.classList).toContain('mat-input-autofilled');
    expect(autofillStreamEvent).toEqual({target: inputEl, isAutofilled: true} as any);
  });

  it('should emit and remove filled class upon end animation', () => {
    const inputEl = testComponent.input1.nativeElement;
    let animationStartCallback: Function = () => {};
    let autofillStreamEvent: AutofillEvent | null = null;
    inputEl.addEventListener.and.callFake((_, cb) => animationStartCallback = cb);
    const autofillStream = autofillMonitor.monitor(inputEl);
    autofillStream.subscribe(event => autofillStreamEvent = event);
    animationStartCallback({animationName: 'mat-input-autofill-start', target: inputEl});
    expect(inputEl.classList).toContain('mat-input-autofilled');
    expect(autofillStreamEvent).toEqual({target: inputEl, isAutofilled: true} as any);

    animationStartCallback({animationName: 'mat-input-autofill-end', target: inputEl});
    expect(inputEl.classList).not.toContain('mat-input-autofilled');
    expect(autofillStreamEvent).toEqual({target: inputEl, isAutofilled: false} as any);
  });

  it('should cleanup filled class if monitoring stopped in autofilled state', () => {
    const inputEl = testComponent.input1.nativeElement;
    let animationStartCallback: Function = () => {};
    inputEl.addEventListener.and.callFake((_, cb) => animationStartCallback = cb);
    autofillMonitor.monitor(inputEl);
    animationStartCallback({animationName: 'mat-input-autofill-start', target: inputEl});
    expect(inputEl.classList).toContain('mat-input-autofilled');

    autofillMonitor.stopMonitoring(inputEl);
    expect(inputEl.classlist).not.toContain('mat-input-autofilled');
  });
});

describe('matAutofill', () => {
  let autofillMonitor: AutofillMonitor;
  let fixture: ComponentFixture<InputWithMatAutofilled>;
  let testComponent: InputWithMatAutofilled;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatInputModule],
      declarations: [InputWithMatAutofilled],
    }).compileComponents();
  });

  beforeEach(inject([AutofillMonitor], (afm: AutofillMonitor) => {
    autofillMonitor = afm;
    spyOn(autofillMonitor, 'monitor').and.returnValue(observableEmpty());
    spyOn(autofillMonitor, 'stopMonitoring');
    fixture = TestBed.createComponent(InputWithMatAutofilled);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should monitor host element on init', () => {
    expect(autofillMonitor.monitor).toHaveBeenCalledWith(testComponent.input.nativeElement);
  });

  it('should stop monitoring host element on destroy', () => {
    expect(autofillMonitor.stopMonitoring).not.toHaveBeenCalled();
    fixture.destroy();
    expect(autofillMonitor.stopMonitoring).toHaveBeenCalledWith(testComponent.input.nativeElement);
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
  @ViewChild('input1') input1: ElementRef;
  @ViewChild('input2') input2: ElementRef;
  @ViewChild('input3') input3: ElementRef;
}

@Component({
  template: `<input #input matAutofill>`
})
class InputWithMatAutofilled {
  @ViewChild('input') input: ElementRef;
}
