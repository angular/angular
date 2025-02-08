/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {ExampleViewer} from './example-viewer.component';
import {DocsContentLoader, ExampleMetadata, ExampleViewerContentLoader} from '../../../interfaces';
import {DOCS_CONTENT_LOADER, EXAMPLE_VIEWER_CONTENT_LOADER} from '../../../providers';
import {Component, provideExperimentalZonelessChangeDetection} from '@angular/core';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Clipboard} from '@angular/cdk/clipboard';
import {By} from '@angular/platform-browser';
import {MatTabGroupHarness} from '@angular/material/tabs/testing';
import {CopySourceCodeButton} from '../../copy-source-code-button/copy-source-code-button.component';
import {ActivatedRoute} from '@angular/router';

describe('ExampleViewer', () => {
  let component: ExampleViewer;
  let fixture: ComponentFixture<ExampleViewer>;
  let loader: HarnessLoader;
  let exampleContentSpy: jasmine.SpyObj<ExampleViewerContentLoader>;
  let contentServiceSpy: jasmine.SpyObj<DocsContentLoader>;

  beforeEach(() => {
    exampleContentSpy = jasmine.createSpyObj('ExampleContentLoader', ['loadPreview']);
    contentServiceSpy = jasmine.createSpyObj('ContentLoader', ['getContent']);
    contentServiceSpy.getContent.and.returnValue(Promise.resolve(undefined));
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleViewer],
      providers: [
        provideNoopAnimations(),
        provideExperimentalZonelessChangeDetection(),
        {provide: EXAMPLE_VIEWER_CONTENT_LOADER, useValue: exampleContentSpy},
        {provide: DOCS_CONTENT_LOADER, useValue: contentServiceSpy},
        {provide: ActivatedRoute, useValue: {snapshot: {fragment: 'fragment'}}},
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ExampleViewer);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should set file extensions as tab names when all files have different extension', waitForAsync(async () => {
    component.metadata = getMetadata({
      files: [
        {name: 'file.ts', content: ''},
        {name: 'file.html', content: ''},
        {name: 'file.css', content: ''},
      ],
    });

    await component.renderExample();

    expect(component.tabs()!.length).toBe(3);
    expect(component.tabs()![0].name).toBe('TS');
    expect(component.tabs()![1].name).toBe('HTML');
    expect(component.tabs()![2].name).toBe('CSS');
  }));

  it('should generate correct code content for multi file mode when it is expanded', waitForAsync(async () => {
    component.metadata = getMetadata({
      files: [
        {name: 'file.ts', content: 'typescript file'},
        {name: 'file.html', content: 'html file'},
        {name: 'file.css', content: 'css file'},
      ],
    });

    await component.renderExample();

    expect(component.tabs()!.length).toBe(3);
    expect(component.tabs()![0].code).toBe('typescript file');
    expect(component.tabs()![1].code).toBe('html file');
    expect(component.tabs()![2].code).toBe('css file');
  }));

  it('should set file names as tab names when there is at least one duplication', async () => {
    component.metadata = getMetadata({
      files: [
        {name: 'example.ts', content: 'typescript file'},
        {name: 'example.html', content: 'html file'},
        {name: 'another-example.ts', content: 'css file'},
      ],
    });

    await component.renderExample();
    expect(component.tabs()!.length).toBe(3);
    expect(component.tabs()![0].name).toBe('example.ts');
    expect(component.tabs()![1].name).toBe('example.html');
    expect(component.tabs()![2].name).toBe('another-example.ts');
  });

  it('should expandable be false when none of the example files have defined visibleLinesRange ', waitForAsync(async () => {
    component.metadata = getMetadata();
    await component.renderExample();
    expect(component.expandable()).toBeFalse();
  }));

  it('should expandable be true when at least one example file has defined visibleLinesRange ', waitForAsync(async () => {
    component.metadata = getMetadata({
      files: [
        {name: 'example.ts', content: 'typescript file'},
        {
          name: 'example.html',
          content: 'html file',
          visibleLinesRange: '[1, 2]',
        },
        {name: 'another-example.ts', content: 'css file'},
      ],
    });
    await component.renderExample();
    expect(component.expandable()).toBeTrue();
  }));

  it('should set exampleComponent when metadata contains path and preview is true', waitForAsync(async () => {
    exampleContentSpy.loadPreview.and.resolveTo(ExampleComponent);
    component.metadata = getMetadata({
      path: 'example.ts',
      preview: true,
    });
    await component.renderExample();
    expect(component.exampleComponent).toBe(ExampleComponent);
  }));

  it('should display GitHub button when githubUrl is provided and there is preview', waitForAsync(async () => {
    exampleContentSpy.loadPreview.and.resolveTo(ExampleComponent);
    component.metadata = getMetadata({
      path: 'example.ts',
      preview: true,
    });
    component.githubUrl = 'https://github.com/';
    await component.renderExample();
    const githubButton = fixture.debugElement.query(
      By.css('a[aria-label="Open example on GitHub"]'),
    );
    expect(githubButton).toBeTruthy();
    expect(githubButton.nativeElement.href).toBe(component.githubUrl);
  }));

  it('should display StackBlitz button when stackblitzUrl is provided and there is preview', waitForAsync(async () => {
    exampleContentSpy.loadPreview.and.resolveTo(ExampleComponent);
    component.metadata = getMetadata({
      path: 'example.ts',
      preview: true,
    });
    component.stackblitzUrl = 'https://stackblitz.com/';
    await component.renderExample();
    const stackblitzButton = fixture.debugElement.query(
      By.css('a[aria-label="Edit this example in StackBlitz"]'),
    );
    expect(stackblitzButton).toBeTruthy();
    expect(stackblitzButton.nativeElement.href).toBe(component.stackblitzUrl);
  }));

  it('should set expanded flag in metadata after toggleExampleVisibility', waitForAsync(async () => {
    component.metadata = getMetadata();
    await component.renderExample();
    component.toggleExampleVisibility();
    expect(component.expanded()).toBeTrue();
    const tabGroup = await loader.getHarness(MatTabGroupHarness);
    const tab = await tabGroup.getSelectedTab();
    expect(await tab.getLabel()).toBe('TS');
    component.toggleExampleVisibility();
    expect(component.expanded()).toBeFalse();
  }));

  // TODO(josephperrott): enable once the docs-viewer/example-viewer circle is sorted out.
  xit('should call clipboard service when clicked on copy source code', waitForAsync(async () => {
    const expectedCodeSnippetContent = 'typescript code';
    component.metadata = getMetadata({
      files: [
        {
          name: 'example.ts',
          content: `<pre><code>${expectedCodeSnippetContent}</code></pre>`,
        },
        {name: 'example.css', content: ''},
      ],
    });
    const clipboardService = TestBed.inject(Clipboard);
    const spy = spyOn(clipboardService, 'copy');

    await component.renderExample();
    const button = fixture.debugElement.query(By.directive(CopySourceCodeButton)).nativeElement;
    button.click();

    expect(spy.calls.argsFor(0)[0]?.trim()).toBe(expectedCodeSnippetContent);
  }));

  it('should call clipboard service when clicked on copy example link', waitForAsync(async () => {
    component.metadata = getMetadata();
    component.expanded.set(true);
    fixture.detectChanges();

    const clipboardService = TestBed.inject(Clipboard);
    const spy = spyOn(clipboardService, 'copy');
    await component.renderExample();
    const button = fixture.debugElement.query(
      By.css('button.docs-example-copy-link'),
    ).nativeElement;
    button.click();
    expect(spy.calls.argsFor(0)[0].trim()).toBe(`${window.origin}/context.html#example-1`);
  }));
});

const getMetadata = (value: Partial<ExampleMetadata> = {}): ExampleMetadata => {
  return {
    id: 1,
    files: [
      {name: 'example.ts', content: ''},
      {name: 'example.css', content: ''},
    ],
    preview: false,
    ...value,
  };
};

@Component({
  template: '',
})
class ExampleComponent {}
