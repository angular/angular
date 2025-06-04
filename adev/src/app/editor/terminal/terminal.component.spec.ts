/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DOCUMENT, inject} from '@angular/core';
import {Terminal} from './terminal.component';
import {TerminalType, TerminalHandler} from './terminal-handler.service';
import {WINDOW} from '@angular/docs';

describe('Terminal', () => {
  let fixture: ComponentFixture<Terminal>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Terminal],
      providers: [
        {
          provide: WINDOW,
          useFactory: () => inject(DOCUMENT).defaultView,
        },
      ],
    });

    fixture = TestBed.createComponent(Terminal);
    fixture.componentRef.setInput('type', TerminalType.READONLY);
    await fixture.whenStable();
  });

  it('should write to terminal', async () => {
    await expectWriteStringToTerminal('test string');
  });

  it('should write to terminal when using new instance', async () => {
    await expectWriteStringToTerminal('first value');
    fixture.destroy();

    fixture = TestBed.createComponent(Terminal);
    fixture.componentRef.setInput('type', TerminalType.READONLY);
    await fixture.whenStable();

    await expectWriteStringToTerminal('second value');
  });

  async function expectWriteStringToTerminal(v: string) {
    TestBed.inject(TerminalHandler).readonlyTerminalInstance().write(v);
    await expectAsync(until(() => fixture.nativeElement.innerHTML.indexOf(v) > -1)).toBeResolved();
  }
});

async function until<T>(fn: () => T): Promise<T> {
  const timeout = 100;
  const start = performance.now();
  while (true) {
    const result = fn();
    if (result) {
      return result;
    }
    if (performance.now() - start > timeout) {
      throw new Error(`condition not satisfied within ${timeout}ms.`);
    }
    await new Promise((r) => setTimeout(r, 1));
  }
}
