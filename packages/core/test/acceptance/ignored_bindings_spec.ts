/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Directive, DOCUMENT, output, signal, Type} from '@angular/core';
import {TestBed} from '@angular/core/testing';

@Directive({selector: '[unused]'})
class UnusedDirective {}

@Directive({selector: '[class-input-dir]', inputs: ['class']})
class ClassInputDirective {
  class: string | undefined;
}

@Directive({selector: '[output-dir]', outputs: ['ready']})
class OutputDirective {
  readonly ready = output<void>();
}

@Directive({
  selector: '[host-bindings-dir]',
  host: {'[class.active]': 'true', '[style.color]': '"red"', '(click)': 'onClick()'},
})
class HostBindingsDirective {
  onClick() {}
}

describe('bindings on ng-container and ng-template', () => {
  let loggedCodes: string[];
  let handledEvents: number;

  beforeEach(() => {
    loggedCodes = [];
    handledEvents = 0;
    spyOn(console, 'error').and.callFake((message: unknown) => {
      loggedCodes.push(/NG0\d+/.exec(String(message))?.[0] ?? String(message));
    });
  });

  /**
   * Renders `template` in a standalone component. Any import compiles the template with the full
   * instruction set; an empty `imports` compiles it with the DOM-only instruction set.
   */
  async function render(template: string, imports: Type<unknown>[] = [UnusedDirective]) {
    @Component({template, imports})
    class TestComponent {
      readonly isActive = signal(true);
      readonly value = signal('');
      onEvent() {
        handledEvents++;
      }
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();
  }

  it('should log NG0319 for a class binding on ng-container', async () => {
    await render('<ng-container [class.active]="isActive()"></ng-container>');
    expect(loggedCodes).toEqual(['NG0319']);
  });

  it('should log NG0319 for a style map binding on ng-container', async () => {
    await render(`<ng-container [style]="{color: 'red'}"></ng-container>`);
    expect(loggedCodes).toEqual(['NG0319']);
  });

  it('should log NG0319 for a class map binding on ng-template', async () => {
    await render(`<ng-template [class]="'active'"></ng-template>`);
    expect(loggedCodes).toEqual(['NG0319']);
  });

  it('should log NG0319 for an unclaimed event on ng-container', async () => {
    await render('<ng-container (click)="onEvent()"></ng-container>');
    expect(loggedCodes).toEqual(['NG0319']);
  });

  it('should log NG0319 for an unclaimed event in a component without imports', async () => {
    await render('<ng-container (click)="onEvent()"></ng-container>', []);
    expect(loggedCodes).toEqual(['NG0319']);
  });

  it('should log NG0319 for a class binding next to a directive class input', async () => {
    await render('<ng-container class-input-dir [class.active]="isActive()"></ng-container>', [
      ClassInputDirective,
    ]);
    expect(loggedCodes).toEqual(['NG0319']);
  });

  it('should log only NG0303 for an unclaimed two-way binding on ng-container', async () => {
    await render('<ng-container [(text)]="value"></ng-container>');
    expect(loggedCodes).toEqual(['NG0303']);
  });

  it('should log NG0319 when errorOnUnknownProperties is enabled', async () => {
    TestBed.configureTestingModule({errorOnUnknownProperties: true});
    await render('<ng-container (click)="onEvent()"></ng-container>');
    expect(loggedCodes).toEqual(['NG0319']);
  });

  it('should not log NG0319 for directive host bindings', async () => {
    await render('<ng-container host-bindings-dir></ng-container>', [HostBindingsDirective]);
    expect(loggedCodes).toEqual([]);
  });

  it('should not log NG0319 for an event that a directive output claims', async () => {
    await render('<ng-container output-dir (ready)="onEvent()"></ng-container>', [OutputDirective]);
    expect(loggedCodes).toEqual([]);
  });

  it('should not log NG0319 for an event on a global target, and should run it', async () => {
    await render('<ng-container (document:ping)="onEvent()"></ng-container>');
    TestBed.inject(DOCUMENT).dispatchEvent(new Event('ping'));
    expect(loggedCodes).toEqual([]);
    expect(handledEvents).toBe(1);
  });

  it('should not log NG0319 for a class map binding that a directive input takes', async () => {
    await render(`<ng-container class-input-dir [class]="'active'"></ng-container>`, [
      ClassInputDirective,
    ]);
    expect(loggedCodes).toEqual([]);
  });
});
