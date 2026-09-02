/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ExampleViewer} from './example-viewer.component';
import {ExampleMetadata, ExampleViewerContentLoader} from '../../../interfaces';
import {EXAMPLE_VIEWER_CONTENT_LOADER} from '../../../providers';
import {Component, ComponentRef, signal} from '@angular/core';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Clipboard} from '@angular/cdk/clipboard';
import {By} from '@angular/platform-browser';
import {MatTabGroupHarness} from '@angular/material/tabs/testing';
import {CopySourceCodeButton} from '../../copy-source-code-button/copy-source-code-button.component';
import {ActivatedRoute} from '@angular/router';

describe('ExampleViewer', () => {
  let component: ExampleViewer;
  let componentRef: ComponentRef<ExampleViewer>;
  let fixture: ComponentFixture<ExampleViewer>;

  let loader: HarnessLoader;
  let exampleContentSpy: jasmine.SpyObj<ExampleViewerContentLoader>;

  beforeEach(() => {
    exampleContentSpy = jasmine.createSpyObj('ExampleContentLoader', ['loadPreview']);
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ExampleViewer],
      providers: [
        {provide: EXAMPLE_VIEWER_CONTENT_LOADER, useValue: exampleContentSpy},
        {provide: ActivatedRoute, useValue: {snapshot: {fragment: 'fragment'}}},
      ],
    });
    fixture = TestBed.createComponent(ExampleViewer);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    loader = TestbedHarnessEnvironment.loader(fixture);
    await fixture.whenStable();
  });

  it('should set file extensions as tab names when all files have different extension', async () => {
    componentRef.setInput(
      'metadata',
      getMetadata({
        files: [
          {name: 'file.ts', sanitizedContent: ''},
          {name: 'file.html', sanitizedContent: ''},
          {name: 'file.css', sanitizedContent: ''},
        ],
      }),
    );

    await component.renderExample();

    expect(component.tabs()!.length).toBe(3);
    expect(component.tabs()![0].name).toBe('TS');
    expect(component.tabs()![1].name).toBe('HTML');
    expect(component.tabs()![2].name).toBe('CSS');
  });

  it('should generate correct code content for multi file mode when it is expanded', async () => {
    componentRef.setInput(
      'metadata',
      getMetadata({
        files: [
          {name: 'file.ts', sanitizedContent: 'typescript file'},
          {name: 'file.html', sanitizedContent: 'html file'},
          {name: 'file.css', sanitizedContent: 'css file'},
        ],
      }),
    );

    await component.renderExample();

    expect(component.tabs()!.length).toBe(3);
    expect(component.tabs()![0].code).toBe('typescript file');
    expect(component.tabs()![1].code).toBe('html file');
    expect(component.tabs()![2].code).toBe('css file');
  });

  it('should set file names as tab names when there is at least one duplication', async () => {
    componentRef.setInput(
      'metadata',
      getMetadata({
        files: [
          {name: 'example.ts', sanitizedContent: 'typescript file'},
          {name: 'example.html', sanitizedContent: 'html file'},
          {name: 'another-example.ts', sanitizedContent: 'css file'},
        ],
      }),
    );

    await component.renderExample();
    expect(component.tabs()!.length).toBe(3);
    expect(component.tabs()![0].name).toBe('example.ts');
    expect(component.tabs()![1].name).toBe('example.html');
    expect(component.tabs()![2].name).toBe('another-example.ts');
  });

  it('should expand button not appear when there is no hidden line', async () => {
    componentRef.setInput('metadata', getMetadata());
    await component.renderExample();
    const button = fixture.debugElement.query(By.css('button[aria-label="Expand code example"]'));
    expect(button).toBeNull();
  });

  it('should have line with hidden line class when expand button is present', async () => {
    const expectedCodeSnippetContent =
      'typescript code<br/>' + '<div class="line">hidden line</div>';

    componentRef.setInput(
      'metadata',
      getMetadata({
        files: [
          {
            name: 'example.ts',
            sanitizedContent: `<pre><code>${expectedCodeSnippetContent}</code></pre>`,
            visibleLinesRange: '[1]',
          },
        ],
      }),
    );

    await component.renderExample();
    await fixture.whenStable();

    const hiddenLine = fixture.debugElement.query(By.css('div[class="line hidden"]'));
    expect(hiddenLine).toBeTruthy();
  });

  it('should have no more line with hidden line class when expand button is clicked', async () => {
    const expectedCodeSnippetContent =
      'typescript code<br/>' + '<div class="line">hidden line</div>';

    componentRef.setInput(
      'metadata',
      getMetadata({
        files: [
          {
            name: 'example.ts',
            sanitizedContent: `<pre><code>${expectedCodeSnippetContent}</code></pre>`,
            visibleLinesRange: '[1]',
          },
        ],
      }),
    );

    await component.renderExample();
    await fixture.whenStable();

    const expandButton = fixture.debugElement.query(
      By.css('button[aria-label="Expand code example"]'),
    );
    expandButton.nativeElement.click();
    await fixture.whenStable();

    const hiddenLine = fixture.debugElement.query(By.css('div[class="line hidden"]'));
    expect(hiddenLine).toBeNull();
  });

  it('keeps the expand control after switching tabs while expanded', async () => {
    const collapsible = {
      name: 'example.ts',
      sanitizedContent:
        '<pre><code><div class="line">one</div><div class="line">two</div></code></pre>',
      visibleLinesRange: '1',
    };

    componentRef.setInput(
      'metadata',
      getMetadata({files: [collapsible, {name: 'example.css', sanitizedContent: ''}]}),
    );

    await component.renderExample();
    await fixture.whenStable();

    expect(component.expandable()).toBeTrue();

    component.toggleExampleVisibility();
    await fixture.whenStable();

    const tabGroup = await loader.getHarness(MatTabGroupHarness);
    await (await tabGroup.getTabs())[1].select();
    await fixture.whenStable();
    await (await tabGroup.getTabs())[0].select();
    await fixture.whenStable();

    expect(component.expandable()).toBeTrue();
  });

  it('hides only the lines outside the visible range, and adds no gap within one range', async () => {
    componentRef.setInput(
      'metadata',
      getMetadata({
        files: [
          {
            name: 'example.ts',
            sanitizedContent:
              '<pre><code><div class="line">one</div><div class="line">two</div><div class="line">three</div></code></pre>',
            visibleLinesRange: '2,3',
          },
        ],
      }),
    );

    await component.renderExample();
    await fixture.whenStable();

    const lines = fixture.debugElement
      .queryAll(By.css('.line'))
      .map((line) => (line.nativeElement as HTMLElement).className);

    expect(lines).toEqual(['line hidden', 'line', 'line']);
  });

  it('hides the line numbers that pair with the hidden lines', async () => {
    const numbered = (n: number, text: string) =>
      `<span class="shiki-ln-number">${n}</span><div class="line">${text}</div>`;

    componentRef.setInput(
      'metadata',
      getMetadata({
        files: [
          {
            name: 'example.ts',
            sanitizedContent: `<pre><code>${numbered(1, 'one')}${numbered(2, 'two')}${numbered(3, 'three')}</code></pre>`,
            visibleLinesRange: '2,3',
          },
        ],
      }),
    );

    await component.renderExample();
    await fixture.whenStable();

    const visibleNumbers = fixture.debugElement
      .queryAll(By.css('.shiki-ln-number'))
      .filter((el) => !(el.nativeElement as HTMLElement).classList.contains('hidden'))
      .map((el) => (el.nativeElement as HTMLElement).textContent);

    expect(visibleNumbers).toEqual(['2', '3']);
  });

  it('restores the selected tab and its collapsed lines after hiding and reshowing the code', async () => {
    componentRef.setInput(
      'metadata',
      getMetadata({
        files: [
          {name: 'example.ts', sanitizedContent: ''},
          {
            name: 'example.css',
            sanitizedContent:
              '<pre><code><div class="line">one</div><div class="line">two</div></code></pre>',
            visibleLinesRange: '2',
          },
        ],
      }),
    );

    await component.renderExample();
    await fixture.whenStable();

    const tabGroup = await loader.getHarness(MatTabGroupHarness);
    await (await tabGroup.getTabs())[1].select();
    await fixture.whenStable();

    component.toggleCodeVisibility();
    await fixture.whenStable();
    component.toggleCodeVisibility();
    await fixture.whenStable();

    expect(
      await (await (await loader.getHarness(MatTabGroupHarness)).getSelectedTab()).getLabel(),
    ).toBe('CSS');
    const lines = fixture.debugElement
      .queryAll(By.css('.line'))
      .map((line) => (line.nativeElement as HTMLElement).className);
    expect(lines).toEqual(['line hidden', 'line']);
  });

  it('offers no expand control when the range covers the whole file', async () => {
    componentRef.setInput(
      'metadata',
      getMetadata({
        files: [
          {
            name: 'example.ts',
            sanitizedContent:
              '<pre><code><div class="line">one</div><div class="line">two</div></code></pre>',
            visibleLinesRange: '1,2',
          },
        ],
      }),
    );

    await component.renderExample();
    await fixture.whenStable();

    expect(component.expandable()).toBeFalse();
  });

  it('should set exampleComponent when metadata contains path and preview is true', async () => {
    exampleContentSpy.loadPreview.and.resolveTo(ExampleComponent);
    componentRef.setInput(
      'metadata',
      getMetadata({
        path: 'example.ts',
        preview: true,
      }),
    );
    await component.renderExample();
    expect(component.exampleComponent).toBe(ExampleComponent);
  });

  it('should display GitHub button when githubUrl is provided and there is preview', async () => {
    exampleContentSpy.loadPreview.and.resolveTo(ExampleComponent);
    componentRef.setInput(
      'metadata',
      getMetadata({
        path: 'example.ts',
        preview: true,
      }),
    );
    componentRef.setInput('githubUrl', 'https://github.com/');
    await component.renderExample();
    await fixture.whenStable();

    const githubButton = fixture.debugElement.query(
      By.css('a[aria-label="Open example on GitHub"]'),
    );
    expect(githubButton).toBeTruthy();
    expect(githubButton.nativeElement.href).toBe(component.githubUrl());
  });

  it('should display StackBlitz button when stackblitzUrl is provided and there is preview', async () => {
    exampleContentSpy.loadPreview.and.resolveTo(ExampleComponent);
    componentRef.setInput(
      'metadata',
      getMetadata({
        path: 'example.ts',
        preview: true,
      }),
    );
    componentRef.setInput('stackblitzUrl', 'https://stackblitz.com/');

    await component.renderExample();
    await fixture.whenStable();

    const stackblitzButton = fixture.debugElement.query(
      By.css('a[aria-label="Edit example in StackBlitz"]'),
    );
    expect(stackblitzButton).toBeTruthy();
    expect(stackblitzButton.nativeElement.href).toBe(component.stackblitzUrl());
  });

  it('should set expanded flag in metadata after toggleExampleVisibility', async () => {
    componentRef.setInput('metadata', getMetadata());
    await component.renderExample();
    component.toggleExampleVisibility();
    expect(component.expanded()).toBeTrue();
    const tabGroup = await loader.getHarness(MatTabGroupHarness);
    const tab = await tabGroup.getSelectedTab();
    expect(await tab.getLabel()).toBe('TS');
    component.toggleExampleVisibility();
    expect(component.expanded()).toBeFalse();
  });

  it('should call clipboard service when clicked on copy source code', async () => {
    const expectedCodeSnippetContent = 'typescript code';
    componentRef.setInput(
      'metadata',
      getMetadata({
        files: [
          {
            name: 'example.ts',
            sanitizedContent: `<pre><code>${expectedCodeSnippetContent}</code></pre>`,
          },
          {name: 'example.css', sanitizedContent: ''},
        ],
      }),
    );
    const clipboardService = TestBed.inject(Clipboard);
    const spy = spyOn(clipboardService, 'copy');

    await component.renderExample();
    await fixture.whenStable();
    const button = fixture.debugElement.query(By.directive(CopySourceCodeButton)).nativeElement;
    button.click();

    expect(spy.calls.argsFor(0)[0]?.trim()).toBe(expectedCodeSnippetContent);
  });

  it('should call clipboard service when clicked on copy example link', async () => {
    componentRef.setInput('metadata', getMetadata());
    component.expanded.set(true);
    await fixture.whenStable();

    const clipboardService = TestBed.inject(Clipboard);
    const spy = spyOn(clipboardService, 'copy');
    await component.renderExample();
    const button = fixture.debugElement.query(
      By.css('button.docs-example-copy-link'),
    ).nativeElement;
    button.click();
    const expectedUrl = location.origin + location.pathname + location.search + '#example-1';
    expect(spy.calls.argsFor(0)[0].trim()).toBe(expectedUrl);
  });

  it('should hide code content when `hideCode` is true', async () => {
    componentRef.setInput(
      'metadata',
      getMetadata({
        hideCode: true,
      }),
    );

    await component.renderExample();
    await fixture.whenStable();

    // Initially, the code should be hidden.
    expect(component.showCode()).toBeFalse();
    let codeContainer = fixture.debugElement.query(By.css('.docs-example-viewer-code-wrapper'));
    expect(codeContainer).toBeNull();
  });

  it('should expand/collapse code content with toggle button.', async () => {
    componentRef.setInput('metadata', getMetadata());

    await component.renderExample();
    await fixture.whenStable();

    // Initially, the code should be visible.
    expect(component.showCode()).toBeTrue();
    let codeContainer = fixture.debugElement.query(By.css('.docs-example-viewer-code-wrapper'));
    expect(codeContainer).not.toBeNull();

    const codeToggleButton = fixture.debugElement.query(By.css('.docs-example-code-toggle'));
    codeToggleButton.nativeElement.click();
    await fixture.whenStable();

    expect(component.showCode()).toBeFalse();
    codeContainer = fixture.debugElement.query(By.css('.docs-example-viewer-code-wrapper'));
    expect(codeContainer).toBeNull();

    codeToggleButton.nativeElement.click();
    await fixture.whenStable();

    expect(component.showCode()).toBeTrue();
    codeContainer = fixture.debugElement.query(By.css('.docs-example-viewer-code-wrapper'));
    expect(codeContainer).not.toBeNull();
  });

  it('should render example', async () => {
    exampleContentSpy.loadPreview.and.resolveTo(ExampleComponent);
    componentRef.setInput(
      'metadata',
      getMetadata({
        path: 'example.ts',
        preview: true,
      }),
    );
    await component.renderExample();
    await fixture.whenStable();
    expect(component.exampleComponent).toBeDefined();

    const previewContainer = fixture.debugElement.query(By.css('.docs-example-viewer-preview'));
    expect(previewContainer.nativeElement.innerHTML).toContain('ng-component');
    expect(previewContainer.nativeElement.textContent).toContain('foobar');
  });
});

const getMetadata = (value: Partial<ExampleMetadata> = {}): ExampleMetadata => {
  return {
    id: 1,
    files: [
      {name: 'example.ts', sanitizedContent: ''},
      {name: 'example.css', sanitizedContent: ''},
    ],
    preview: false,
    hideCode: false,
    ...value,
    style: undefined,
  };
};

@Component({
  template: '{{foobar}}',
})
class ExampleComponent {
  foobar = signal('foobar');
}
