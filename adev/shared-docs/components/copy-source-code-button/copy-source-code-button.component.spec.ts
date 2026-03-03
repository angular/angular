/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {
  CONFIRMATION_DISPLAY_TIME_MS,
  CopySourceCodeButton,
} from './copy-source-code-button.component';
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {By} from '@angular/platform-browser';
import {Clipboard} from '@angular/cdk/clipboard';

const SUCCESSFULLY_COPY_CLASS_NAME = 'docs-copy-source-code-button-success';
const FAILED_COPY_CLASS_NAME = 'docs-copy-source-code-button-failed';

describe('CopySourceCodeButton', () => {
  let component: CodeSnippetWrapper;
  let fixture: ComponentFixture<CodeSnippetWrapper>;
  let copySpy: jasmine.Spy<(text: string) => boolean>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CodeSnippetWrapper],
    });
    fixture = TestBed.createComponent(CodeSnippetWrapper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  beforeEach(() => {
    const clipboardService = TestBed.inject(Clipboard);
    copySpy = spyOn(clipboardService, 'copy');
  });

  it('should call clipboard service when clicked on copy source code', async () => {
    const expectedCodeToBeCopied = 'npm install -g @angular/cli';
    component.code.set(expectedCodeToBeCopied);

    await fixture.whenStable();

    const button = fixture.debugElement.query(By.directive(CopySourceCodeButton)).nativeElement;
    button.click();

    expect(copySpy.calls.argsFor(0)[0].trim()).toBe(expectedCodeToBeCopied);
  });

  it(`should set ${SUCCESSFULLY_COPY_CLASS_NAME} for ${CONFIRMATION_DISPLAY_TIME_MS} ms when copy was executed properly`, async () => {
    const clock = jasmine.clock().install();
    component.code.set('example');

    await fixture.whenStable();

    const button = fixture.debugElement.query(By.directive(CopySourceCodeButton)).nativeElement;
    button.click();
    await fixture.whenStable();

    expect(button).toHaveClass(SUCCESSFULLY_COPY_CLASS_NAME);

    clock.tick(CONFIRMATION_DISPLAY_TIME_MS);
    await fixture.whenStable();

    expect(button).not.toHaveClass(SUCCESSFULLY_COPY_CLASS_NAME);
    clock.uninstall();
  });

  it(`should set ${FAILED_COPY_CLASS_NAME} for ${CONFIRMATION_DISPLAY_TIME_MS} ms when copy failed`, async () => {
    const clock = jasmine.clock().install();
    component.code.set('example');
    copySpy.and.throwError('Fake copy error');

    await fixture.whenStable();

    const button = fixture.debugElement.query(By.directive(CopySourceCodeButton)).nativeElement;
    button.click();

    await fixture.whenStable();

    expect(button).toHaveClass(FAILED_COPY_CLASS_NAME);

    clock.tick(CONFIRMATION_DISPLAY_TIME_MS);
    await fixture.whenStable();

    expect(button).not.toHaveClass(FAILED_COPY_CLASS_NAME);
    clock.uninstall();
  });
});

@Component({
  template: `
    <pre>
      <code [innerHtml]="code()"></code>
    </pre>
    <button docs-copy-source-code></button>
  `,
  imports: [CopySourceCodeButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CodeSnippetWrapper {
  code = signal('');
}
