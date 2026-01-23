/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  afterEveryRender,
  Component,
  provideZoneChangeDetection,
  ɵTracingAction as TracingAction,
  ɵTracingService as TracingService,
  ɵTracingSnapshot as TracingSnapshot,
} from '../../src/core';
import {fakeAsync, TestBed} from '../../testing';

describe('TracingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    });
  });
  let actions: TracingAction[];
  let listeners: {event: string; handler: Function}[];
  let fakeSnapshot: TracingSnapshot;
  let mockTracingService: TracingService<TracingSnapshot>;
  let clickCount: number;

  beforeEach(() => {
    actions = [];
    listeners = [];
    clickCount = 0;
    fakeSnapshot = {
      run: function <T>(action: TracingAction, fn: () => T): T {
        actions.push(action);
        return fn();
      },
      dispose() {},
    };
    mockTracingService = {
      snapshot: jasmine.createSpy('snapshot').and.returnValue(fakeSnapshot),
      wrapEventListener: jasmine
        .createSpy('wrapEventListener')
        .and.callFake((_element, event: string, handler: Function) => {
          if (event === 'click') {
            const originalHandler = handler;
            handler = function (this: unknown) {
              clickCount++;
              originalHandler.apply(this, arguments);
            };
          }
          listeners.push({event, handler});
          return handler;
        }),
    };
  });

  it('should take a snapshot after change detection', () => {
    TestBed.configureTestingModule({
      providers: [{provide: TracingService, useValue: mockTracingService}],
    });

    @Component({template: ''})
    class App {}

    const fixture = TestBed.createComponent(App);
    expect(mockTracingService.snapshot).not.toHaveBeenCalled();

    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(mockTracingService.snapshot).toHaveBeenCalledTimes(1);
    expect(actions).toEqual([TracingAction.CHANGE_DETECTION]);

    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(mockTracingService.snapshot).toHaveBeenCalledTimes(2);
    expect(actions).toEqual([TracingAction.CHANGE_DETECTION, TracingAction.CHANGE_DETECTION]);
  });

  it('should take a snapshot after `afterRender`', fakeAsync(() => {
    TestBed.configureTestingModule({
      providers: [{provide: TracingService, useValue: mockTracingService}],
    });

    @Component({template: ''})
    class App {
      constructor() {
        afterEveryRender(() => {});
      }
    }

    const fixture = TestBed.createComponent(App);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(mockTracingService.snapshot).toHaveBeenCalledTimes(4);
    expect(actions).toEqual([
      TracingAction.CHANGE_DETECTION,
      TracingAction.CHANGE_DETECTION,
      TracingAction.AFTER_NEXT_RENDER,
    ]);
  }));

  it('should be able to wrap event listeners through the tracing service', fakeAsync(() => {
    TestBed.configureTestingModule({
      providers: [{provide: TracingService, useValue: mockTracingService}],
    });

    @Component({template: '<button (click)="noop()"></button> <span (mousedown)="noop()"></span>'})
    class App {
      noop() {}
    }

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(listeners).toEqual([
      {event: 'click', handler: jasmine.any(Function)},
      {event: 'mousedown', handler: jasmine.any(Function)},
    ]);
    expect(clickCount).toBe(0);

    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();

    expect(clickCount).toBe(1);
  }));
});
