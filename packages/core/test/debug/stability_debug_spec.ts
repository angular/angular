/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationInitStatus, ApplicationRef, PendingTasks} from '../../src/core';
import {provideStabilityDebugging} from '../../src/application/stability_debug_impl';
import {TestBed} from '@angular/core/testing';

describe('provideStabilityDebugging', () => {
  let consoleWarnSpy: jasmine.Spy;
  let consoleDebugSpy: jasmine.Spy;
  let consoleInfoSpy: jasmine.Spy;
  let consoleGroupEndSpy: jasmine.Spy;

  beforeEach(() => {
    jasmine.clock().install();
    spyOn(global, 'Error').and.returnValue({stack: 'fake stack trace', name: 'Error', message: ''});
    consoleWarnSpy = spyOn(console, 'warn');
    consoleDebugSpy = spyOn(console, 'debug');
    consoleInfoSpy = spyOn(console, 'info');
    consoleGroupEndSpy = spyOn(console, 'groupEnd');
    TestBed.configureTestingModule({
      providers: [provideStabilityDebugging()],
    });
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  function runInitializers() {
    (TestBed.inject(ApplicationInitStatus) as any).runInitializers();
  }

  it('should log pending tasks if application does not stabilize', () => {
    const pendingTasks = TestBed.inject(PendingTasks);

    // Prevent stability
    const removeTask = pendingTasks.add();

    runInitializers();

    jasmine.clock().tick(10_000);

    expect(consoleDebugSpy.calls.first().args[0]).toMatch(/Application did not stabilize/);
    expect(consoleDebugSpy.calls.all()[1].args[0]).toMatch(/fake stack trace/);

    removeTask();
  });

  it('should not log if application stabilizes within 9 seconds', async () => {
    const pendingTasks = TestBed.inject(PendingTasks);

    // Prevent stability
    const removeTask = pendingTasks.add();

    runInitializers();

    jasmine.clock().tick(5000);
    removeTask(); // Stabilize
    jasmine.clock().tick(0);
    await TestBed.inject(ApplicationRef).whenStable();
    await Promise.resolve();
    jasmine.clock().tick(4000); // Reach 9000 total

    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });
});
