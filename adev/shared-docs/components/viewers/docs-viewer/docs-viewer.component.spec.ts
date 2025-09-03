/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {ExampleViewerContentLoader} from '../../../interfaces';
import {EXAMPLE_VIEWER_CONTENT_LOADER} from '../../../providers';
import {CodeExampleViewMode, ExampleViewer} from '../example-viewer/example-viewer.component';
import {DocViewer} from './docs-viewer.component';
import {IconComponent} from '../../icon/icon.component';
import {Breadcrumb} from '../../breadcrumb/breadcrumb.component';
import {NavigationState} from '../../../services';
import {CopySourceCodeButton} from '../../copy-source-code-button/copy-source-code-button.component';
import {TableOfContents} from '../../table-of-contents/table-of-contents.component';
import {provideZonelessChangeDetection} from '@angular/core';

describe('DocViewer', () => {
  let fixture: ComponentFixture<DocViewer>;
  let exampleContentSpy: jasmine.SpyObj<ExampleViewerContentLoader>;
  let navigationStateSpy: jasmine.SpyObj<NavigationState>;

  const exampleDocContentWithExampleViewerPlaceholders = `<div class="docs-code linenums" visibleLines="[12, 31]" expanded="true" path="hello-world/hello-world-new.ts">
    <div class="docs-code-header">A styled code example</div>
    <pre>
      <code><div class="hljs-ln-line"><span class="hljs-comment">/*!</div><div class="hljs-ln-line"> * @license</div><div class="hljs-ln-line"> * Copyright Google LLC All Rights Reserved.</div><div class="hljs-ln-line"> *</div><div class="hljs-ln-line"> * Use of this source code is governed by an MIT-style license that can be</div><div class="hljs-ln-line"> * found in the LICENSE file at https://angular.dev/license</div><div class="hljs-ln-line"> */</span></div><div class="hljs-ln-line"></div><div class="hljs-ln-line remove"><span class="hljs-keyword">import</span> {ChangeDetectorRef, Component, <span class="hljs-keyword">inject</span>, signal} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;@angular/core&#x27;</span>;</div><div class="hljs-ln-line add"><span class="hljs-keyword">import</span> {Component, signal} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;@angular/core&#x27;</span>;</div><div class="hljs-ln-line"><span class="hljs-keyword">import</span> {CommonModule} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;@angular/common&#x27;</span>;</div><div class="hljs-ln-line"></div><div class="hljs-ln-line highlighted">@Component({</div><div class="hljs-ln-line highlighted">  selector: <span class="hljs-string">&#x27;hello-world&#x27;</span>,</div><div class="hljs-ln-line highlighted">  imports: [CommonModule],</div><div class="hljs-ln-line highlighted">  templateUrl: <span class="hljs-string">&#x27;./hello-world.html&#x27;</span>,</div><div class="hljs-ln-line highlighted">  styleUrls: [<span class="hljs-string">&#x27;./hello-world.css&#x27;</span>],</div><div class="hljs-ln-line highlighted">})</div><div class="hljs-ln-line">export <span class="hljs-keyword">default</span> <span class="hljs-keyword">class</span> HelloWorldComponent {</div><div class="hljs-ln-line remove">  world = <span class="hljs-string">&#x27;World&#x27;</span>;</div><div class="hljs-ln-line add">  world = <span class="hljs-string">&#x27;World!!!&#x27;</span>;</div><div class="hljs-ln-line">  <span class="hljs-keyword">count</span> = signal(<span class="hljs-number">0</span>);</div><div class="hljs-ln-line remove">  changeDetector = <span class="hljs-keyword">inject</span>(ChangeDetectorRef);</div><div class="hljs-ln-line"></div><div class="hljs-ln-line">  increase(): <span class="hljs-keyword">void</span> {</div><div class="hljs-ln-line">    <span class="hljs-keyword">this</span>.<span class="hljs-keyword">count</span>.update((<span class="hljs-keyword">previous</span>) =&gt; {</div><div class="hljs-ln-line highlighted">      <span class="hljs-keyword">return</span> <span class="hljs-keyword">previous</span> + <span class="hljs-number">1</span>;</div><div class="hljs-ln-line">    });</div><div class="hljs-ln-line remove">    <span class="hljs-keyword">this</span>.changeDetector.detectChanges();</div><div class="hljs-ln-line">  }</div><div class="hljs-ln-line">}</div><div class="hljs-ln-line"></div></code>
    </pre>
  </div>`;

  const exampleDocContentWithExpandedExampleViewerPlaceholders = `<div class="docs-code-multifile" expanded="true" path="hello-world/hello-world-new.ts">
  <div class="docs-code" visibleLines="[12, 31]" path="hello-world/hello-world-new.ts">
    <pre>
      <code><div class="hljs-ln-line"><span class="hljs-comment">/*!</div><div class="hljs-ln-line"> * @license</div><div class="hljs-ln-line"> * Copyright Google LLC All Rights Reserved.</div><div class="hljs-ln-line"> *</div><div class="hljs-ln-line"> * Use of this source code is governed by an MIT-style license that can be</div><div class="hljs-ln-line"> * found in the LICENSE file at https://angular.dev/license</div><div class="hljs-ln-line"> */</span></div><div class="hljs-ln-line"></div><div class="hljs-ln-line remove"><span class="hljs-keyword">import</span> {ChangeDetectorRef, Component, <span class="hljs-keyword">inject</span>, signal} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;@angular/core&#x27;</span>;</div><div class="hljs-ln-line add"><span class="hljs-keyword">import</span> {Component, signal} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;@angular/core&#x27;</span>;</div><div class="hljs-ln-line"><span class="hljs-keyword">import</span> {CommonModule} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;@angular/common&#x27;</span>;</div><div class="hljs-ln-line"></div><div class="hljs-ln-line">@Component({</div><div class="hljs-ln-line">  selector: <span class="hljs-string">&#x27;hello-world&#x27;</span>,</div><div class="hljs-ln-line">  imports: [CommonModule],</div><div class="hljs-ln-line">  templateUrl: <span class="hljs-string">&#x27;./hello-world.html&#x27;</span>,</div><div class="hljs-ln-line">  styleUrls: [<span class="hljs-string">&#x27;./hello-world.css&#x27;</span>],</div><div class="hljs-ln-line">})</div><div class="hljs-ln-line">export <span class="hljs-keyword">default</span> <span class="hljs-keyword">class</span> HelloWorldComponent {</div><div class="hljs-ln-line remove">  world = <span class="hljs-string">&#x27;World&#x27;</span>;</div><div class="hljs-ln-line add">  world = <span class="hljs-string">&#x27;World!!!&#x27;</span>;</div><div class="hljs-ln-line">  <span class="hljs-keyword">count</span> = signal(<span class="hljs-number">0</span>);</div><div class="hljs-ln-line remove">  changeDetector = <span class="hljs-keyword">inject</span>(ChangeDetectorRef);</div><div class="hljs-ln-line"></div><div class="hljs-ln-line">  increase(): <span class="hljs-keyword">void</span> {</div><div class="hljs-ln-line">    <span class="hljs-keyword">this</span>.<span class="hljs-keyword">count</span>.update((<span class="hljs-keyword">previous</span>) =&gt; {</div><div class="hljs-ln-line">      <span class="hljs-keyword">return</span> <span class="hljs-keyword">previous</span> + <span class="hljs-number">1</span>;</div><div class="hljs-ln-line">    });</div><div class="hljs-ln-line remove">    <span class="hljs-keyword">this</span>.changeDetector.detectChanges();</div><div class="hljs-ln-line">  }</div><div class="hljs-ln-line">}</div><div class="hljs-ln-line"></div></code>
    </pre>
  </div>
  <div class="docs-code linenums" path="hello-world/hello-world.html">
    <pre>
      <code><div class="hljs-ln-line"><span class="language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">h2</span>&gt;</span>Hello </span><span class="hljs-template-variable">{{ <span class="hljs-name">world</span> }}</span><span class="language-xml"><span class="hljs-tag">&lt;/<span class="hljs-name">h2</span>&gt;</span></div><div class="hljs-ln-line"><span class="hljs-tag">&lt;<span class="hljs-name">button</span> (<span class="hljs-attr">click</span>)=<span class="hljs-string">&quot;increase()&quot;</span>&gt;</span>Increase<span class="hljs-tag">&lt;/<span class="hljs-name">button</span>&gt;</span></div><div class="hljs-ln-line"><span class="hljs-tag">&lt;<span class="hljs-name">p</span>&gt;</span>Counter: </span><span class="hljs-template-variable">{{ <span class="hljs-name">count</span>() }}</span><span class="language-xml"><span class="hljs-tag">&lt;/<span class="hljs-name">p</span>&gt;</span></div><div class="hljs-ln-line"></span></div></code>
    </pre>
  </div>
</div>`;

  const exampleContentWithIcons = `
    <p>Content</p>
    <docs-icon>light_mode</docs-icon>
    <p>More content</p>
    <docs-icon>dark_mode</docs-icon>
  `;

  const exampleContentWithBreadcrumbPlaceholder = `
    <docs-breadcrumb></docs-breadcrumb>
    <p>Content</p>
  `;

  const exampleContentWithCodeSnippet = `
    <div class="docs-code" path="forms/src/app/actor.ts" header="src/app/actor.ts">
        <code>
          <div class="hljs-ln-line"></div>
        </code>
    </div>
  `;

  const exampleContentWithHeadings = `
    <h2>Heading h2</h2>
    <h3>Heading h3</h3>
  `;

  beforeEach(() => {
    exampleContentSpy = jasmine.createSpyObj('ExampleViewerContentLoader', ['getCodeExampleData']);
    navigationStateSpy = jasmine.createSpyObj(NavigationState, ['activeNavigationItem']);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocViewer],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        {provide: EXAMPLE_VIEWER_CONTENT_LOADER, useValue: exampleContentSpy},
        {provide: NavigationState, useValue: navigationStateSpy},
      ],
    });

    fixture = TestBed.createComponent(DocViewer);
    fixture.detectChanges();
  });

  it('should load doc into innerHTML', () => {
    const fixture = TestBed.createComponent(DocViewer);
    fixture.componentRef.setInput('docContent', 'hello world');
    fixture.detectChanges();

    expect(fixture.nativeElement.innerHTML).toBe('hello world');
  });

  it('should instantiate example viewer in snippet view mode', async () => {
    const fixture = TestBed.createComponent(DocViewer);
    fixture.componentRef.setInput('docContent', exampleDocContentWithExampleViewerPlaceholders);
    fixture.detectChanges();
    await fixture.whenStable();

    const exampleViewer = fixture.debugElement.query(By.directive(ExampleViewer));

    expect(exampleViewer).not.toBeNull();
    expect(exampleViewer.componentInstance.view()).toBe(CodeExampleViewMode.SNIPPET);

    const copySourceCodeButton = fixture.debugElement.query(By.directive(CopySourceCodeButton));
    expect(copySourceCodeButton).not.toBeNull();

    const checkIcon = copySourceCodeButton.query(By.directive(IconComponent));
    expect((checkIcon.nativeElement as HTMLElement).classList).toContain(
      `material-symbols-outlined`,
    );
    expect((checkIcon.nativeElement as HTMLElement).classList).toContain(`docs-check`);
    expect(checkIcon.nativeElement.innerHTML).toBe('check');
  });

  it('should display example viewer in multi file mode when provided example is multi file snippet', async () => {
    const fixture = TestBed.createComponent(DocViewer);
    fixture.componentRef.setInput(
      'docContent',
      exampleDocContentWithExpandedExampleViewerPlaceholders,
    );
    fixture.detectChanges();
    await fixture.whenStable();

    const exampleViewer = fixture.debugElement.query(By.directive(ExampleViewer));

    expect(exampleViewer).not.toBeNull();
    expect(exampleViewer.componentInstance.view()).toBe(CodeExampleViewMode.MULTI_FILE);
    expect(exampleViewer.componentInstance.tabs().length).toBe(2);
  });

  it('should render Icon component when content has <docs-icon> element', async () => {
    const fixture = TestBed.createComponent(DocViewer);
    const renderComponentSpy = spyOn(fixture.componentInstance, 'renderComponent' as any);
    fixture.componentRef.setInput('docContent', exampleContentWithIcons);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(renderComponentSpy).toHaveBeenCalledTimes(2);
    expect(renderComponentSpy.calls.allArgs()[0][0]).toBe(IconComponent);
    expect((renderComponentSpy.calls.allArgs()[0][1] as HTMLElement).innerText).toEqual(
      `light_mode`,
    );
    expect(renderComponentSpy.calls.allArgs()[1][0]).toBe(IconComponent);
    expect((renderComponentSpy.calls.allArgs()[1][1] as HTMLElement).innerText).toEqual(
      `dark_mode`,
    );
  });

  it('should render Breadcrumb component when content has <docs-breadcrumb> element', async () => {
    navigationStateSpy.activeNavigationItem.and.returnValue({
      label: 'Active Item',
      parent: {
        label: 'Parent Item',
      },
    });

    const fixture = TestBed.createComponent(DocViewer);
    const renderComponentSpy = spyOn(fixture.componentInstance, 'renderComponent' as any);
    fixture.componentRef.setInput('docContent', exampleContentWithBreadcrumbPlaceholder);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(renderComponentSpy).toHaveBeenCalledTimes(1);
    expect(renderComponentSpy.calls.allArgs()[0][0]).toBe(Breadcrumb);
  });

  it('should render copy source code buttons', async () => {
    const fixture = TestBed.createComponent(DocViewer);
    fixture.componentRef.setInput('docContent', exampleContentWithCodeSnippet);

    fixture.detectChanges();
    await fixture.whenStable();

    const copySourceCodeButton = fixture.debugElement.query(By.directive(CopySourceCodeButton));

    expect(copySourceCodeButton).toBeTruthy();
  });

  it('should render ToC', async () => {
    const fixture = TestBed.createComponent(DocViewer);
    const renderComponentSpy = spyOn(fixture.componentInstance, 'renderComponent' as any);
    fixture.componentRef.setInput('docContent', exampleContentWithHeadings);
    fixture.componentRef.setInput('hasToc', true);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(renderComponentSpy).toHaveBeenCalled();
    expect(renderComponentSpy.calls.allArgs()[0][0]).toBe(TableOfContents);
  });

  it('should not render ToC when hasToc is false', async () => {
    const fixture = TestBed.createComponent(DocViewer);
    const renderComponentSpy = spyOn(fixture.componentInstance, 'renderComponent' as any);
    fixture.componentRef.setInput('docContent', exampleContentWithHeadings);
    fixture.componentRef.setInput('hasToc', false);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(renderComponentSpy).not.toHaveBeenCalled();
  });
});
