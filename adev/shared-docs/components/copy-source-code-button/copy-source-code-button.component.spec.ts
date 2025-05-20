/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';

import {
  CONFIRMATION_DISPLAY_TIME_MS,
  CopySourceCodeButton,
} from './copy-source-code-button.component';
import {
  ChangeDetectionStrategy,
  Component,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
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
      providers: [provideZonelessChangeDetection()],
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

  it('should not copy lines marked as deleted when code snippet contains diff', async () => {
    const codeInHtmlFormat = `
    <code>
      <div class="line remove"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> *<span class="hljs-attr">ngFor</span>=<span class="hljs-string">"let product of products"</span>&gt;</span></div>
      <div class="line add"><span class="hljs-tag">&lt;<span class="hljs-name">div</span> *<span class="hljs-attr">ngFor</span>=<span class="hljs-string">"let product of products()"</span>&gt;</span></div>
    </code>
    `;
    const expectedCodeToBeCopied = `<div *ngFor="let product of products()">`;
    component.code.set(codeInHtmlFormat);

    await fixture.whenStable();

    const button = fixture.debugElement.query(By.directive(CopySourceCodeButton)).nativeElement;
    button.click();

    expect(copySpy.calls.argsFor(0)[0].trim()).toBe(expectedCodeToBeCopied);
  });

  it(`should set ${SUCCESSFULLY_COPY_CLASS_NAME} for ${CONFIRMATION_DISPLAY_TIME_MS} ms when copy was executed properly`, fakeAsync(() => {
    component.code.set('example');

    fixture.detectChanges();

    const button = fixture.debugElement.query(By.directive(CopySourceCodeButton)).nativeElement;
    button.click();
    fixture.detectChanges();

    expect(button).toHaveClass(SUCCESSFULLY_COPY_CLASS_NAME);

    tick(CONFIRMATION_DISPLAY_TIME_MS);
    fixture.detectChanges();

    expect(button).not.toHaveClass(SUCCESSFULLY_COPY_CLASS_NAME);
  }));

  it(`should set ${FAILED_COPY_CLASS_NAME} for ${CONFIRMATION_DISPLAY_TIME_MS} ms when copy failed`, fakeAsync(() => {
    component.code.set('example');
    copySpy.and.throwError('Fake copy error');

    fixture.detectChanges();

    const button = fixture.debugElement.query(By.directive(CopySourceCodeButton)).nativeElement;
    button.click();

    fixture.detectChanges();

    expect(button).toHaveClass(FAILED_COPY_CLASS_NAME);

    tick(CONFIRMATION_DISPLAY_TIME_MS);
    fixture.detectChanges();

    expect(button).not.toHaveClass(FAILED_COPY_CLASS_NAME);
  }));
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
