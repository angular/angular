/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ThemeManager} from '../../../../core/services/theme-manager.service';
import {CodeHighlighter} from '../../code-highlighting/code-highlighter';
import {CodeBlock} from './code-block';

interface HighlightOptions {
  cssVariablePrefix: string;
  lang: string;
  theme: string;
}

describe('CodeBlock', () => {
  let fixture: ComponentFixture<CodeBlock>;
  let codeToHtml: jasmine.Spy<(code: string, options: HighlightOptions) => Promise<string>>;
  const resolvedTheme = signal<'dark' | 'light'>('light');

  function renderedCode(): string {
    return fixture.nativeElement.querySelector('code').innerHTML;
  }

  beforeEach(async () => {
    resolvedTheme.set('light');
    codeToHtml = jasmine
      .createSpy('codeToHtml')
      .and.callFake(
        async (code: string, options: HighlightOptions) =>
          `<span class="${options.theme}">${code}</span>`,
      );

    TestBed.configureTestingModule({
      providers: [
        {provide: CodeHighlighter, useValue: {codeToHtml}},
        {provide: ThemeManager, useValue: {resolvedTheme}},
      ],
    });

    fixture = TestBed.createComponent(CodeBlock);
    fixture.componentRef.setInput('code', 'const answer = 42;');
    await fixture.whenStable();
  });

  it('should render the highlighted code', () => {
    expect(codeToHtml).toHaveBeenCalledOnceWith('const answer = 42;', {
      cssVariablePrefix: '--shiki-',
      lang: 'angular-ts',
      theme: 'github-light',
    });
    expect(renderedCode()).toBe('<span class="github-light">const answer = 42;</span>');
  });

  it('should highlight the code again when the theme changes', async () => {
    resolvedTheme.set('dark');
    await fixture.whenStable();

    expect(renderedCode()).toBe('<span class="github-dark">const answer = 42;</span>');
  });

  it('should highlight the code with the given language', async () => {
    fixture.componentRef.setInput('language', 'angular-html');
    await fixture.whenStable();

    expect(codeToHtml).toHaveBeenCalledWith('const answer = 42;', {
      cssVariablePrefix: '--shiki-',
      lang: 'angular-html',
      theme: 'github-light',
    });
  });
});
