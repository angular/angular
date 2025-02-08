/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {Terminal} from './terminal.component';
import {TerminalHandler, TerminalType} from './terminal-handler.service';
import {FakeEventTarget, WINDOW} from '@angular/docs';

describe('Terminal', () => {
  let component: Terminal;
  let fixture: ComponentFixture<Terminal>;

  let terminalHandlerSpy: jasmine.SpyObj<TerminalHandler>;

  const fakeWindow = new FakeEventTarget();

  beforeEach(async () => {
    terminalHandlerSpy = jasmine.createSpyObj('TerminalHandler', [
      'registerTerminal',
      'resizeToFitParent',
    ]);

    await TestBed.configureTestingModule({
      imports: [Terminal],
      providers: [
        {provide: TerminalHandler, useValue: terminalHandlerSpy},
        {
          provide: WINDOW,
          useValue: fakeWindow,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Terminal);
    component = fixture.componentInstance;
    component.type = TerminalType.READONLY;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register the terminal element on afterViewInit', () => {
    const terminalDebugElement = fixture.debugElement.query(By.css('.adev-terminal-output'));

    component['terminalElementRef'] = terminalDebugElement;
    component.ngAfterViewInit();

    expect(terminalHandlerSpy.registerTerminal).toHaveBeenCalledWith(
      TerminalType.READONLY,
      terminalDebugElement.nativeElement,
    );
  });
});
