/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterTestingModule} from '@angular/router/testing';
import {DocContent, ExampleViewerContentLoader} from '../../interfaces';
import {EXAMPLE_VIEWER_CONTENT_LOADER} from '../../providers';
import {CodeExampleViewMode, ExampleViewer} from '../example-viewer/example-viewer.component';
import {DocViewer} from './docs-viewer.component';

describe('DocViewer', () => {
  let fixture: ComponentFixture<DocViewer>;
  let exampleContentSpy: jasmine.SpyObj<ExampleViewerContentLoader>;

  const sampleDocContentWithExampleViewerPlaceholders: DocContent = {
    id: 'id',
    contents: `<div class="docs-code linenums" visibleLines="[12, 31]" expanded="true" path="hello-world/hello-world-new.ts">
    <div class="docs-code-header">A styled code example</div>
    <pre>
      <code><div class="hljs-ln-line"><span class="hljs-comment">/*!</div><div class="hljs-ln-line"> * @license</div><div class="hljs-ln-line"> * Copyright Google LLC All Rights Reserved.</div><div class="hljs-ln-line"> *</div><div class="hljs-ln-line"> * Use of this source code is governed by an MIT-style license that can be</div><div class="hljs-ln-line"> * found in the LICENSE file at https://angular.dev/license</div><div class="hljs-ln-line"> */</span></div><div class="hljs-ln-line"></div><div class="hljs-ln-line remove"><span class="hljs-keyword">import</span> {ChangeDetectorRef, Component, <span class="hljs-keyword">inject</span>, signal} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;@angular/core&#x27;</span>;</div><div class="hljs-ln-line add"><span class="hljs-keyword">import</span> {Component, signal} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;@angular/core&#x27;</span>;</div><div class="hljs-ln-line"><span class="hljs-keyword">import</span> {CommonModule} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;@angular/common&#x27;</span>;</div><div class="hljs-ln-line"></div><div class="hljs-ln-line highlighted">@Component({</div><div class="hljs-ln-line highlighted">  selector: <span class="hljs-string">&#x27;hello-world&#x27;</span>,</div><div class="hljs-ln-line highlighted">  standalone: <span class="hljs-keyword">true</span>,</div><div class="hljs-ln-line highlighted">  imports: [CommonModule],</div><div class="hljs-ln-line highlighted">  templateUrl: <span class="hljs-string">&#x27;./hello-world.html&#x27;</span>,</div><div class="hljs-ln-line highlighted">  styleUrls: [<span class="hljs-string">&#x27;./hello-world.css&#x27;</span>],</div><div class="hljs-ln-line highlighted">})</div><div class="hljs-ln-line">export <span class="hljs-keyword">default</span> <span class="hljs-keyword">class</span> HelloWorldComponent {</div><div class="hljs-ln-line remove">  world = <span class="hljs-string">&#x27;World&#x27;</span>;</div><div class="hljs-ln-line add">  world = <span class="hljs-string">&#x27;World!!!&#x27;</span>;</div><div class="hljs-ln-line">  <span class="hljs-keyword">count</span> = signal(<span class="hljs-number">0</span>);</div><div class="hljs-ln-line remove">  changeDetector = <span class="hljs-keyword">inject</span>(ChangeDetectorRef);</div><div class="hljs-ln-line"></div><div class="hljs-ln-line">  increase(): <span class="hljs-keyword">void</span> {</div><div class="hljs-ln-line">    <span class="hljs-keyword">this</span>.<span class="hljs-keyword">count</span>.update((<span class="hljs-keyword">previous</span>) =&gt; {</div><div class="hljs-ln-line highlighted">      <span class="hljs-keyword">return</span> <span class="hljs-keyword">previous</span> + <span class="hljs-number">1</span>;</div><div class="hljs-ln-line">    });</div><div class="hljs-ln-line remove">    <span class="hljs-keyword">this</span>.changeDetector.detectChanges();</div><div class="hljs-ln-line">  }</div><div class="hljs-ln-line">}</div><div class="hljs-ln-line"></div></code>
    </pre>
  </div>`,
  };

  const sampleDocContentWithExpandedExampleViewerPlaceholders: DocContent = {
    id: 'id',
    contents: `    <div class="docs-code-multifile" expanded="true" path="hello-world/hello-world-new.ts">
    <div class="docs-code" visibleLines="[12, 31]" path="hello-world/hello-world-new.ts">
      <pre>
        <code><div class="hljs-ln-line"><span class="hljs-comment">/*!</div><div class="hljs-ln-line"> * @license</div><div class="hljs-ln-line"> * Copyright Google LLC All Rights Reserved.</div><div class="hljs-ln-line"> *</div><div class="hljs-ln-line"> * Use of this source code is governed by an MIT-style license that can be</div><div class="hljs-ln-line"> * found in the LICENSE file at https://angular.dev/license</div><div class="hljs-ln-line"> */</span></div><div class="hljs-ln-line"></div><div class="hljs-ln-line remove"><span class="hljs-keyword">import</span> {ChangeDetectorRef, Component, <span class="hljs-keyword">inject</span>, signal} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;@angular/core&#x27;</span>;</div><div class="hljs-ln-line add"><span class="hljs-keyword">import</span> {Component, signal} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;@angular/core&#x27;</span>;</div><div class="hljs-ln-line"><span class="hljs-keyword">import</span> {CommonModule} <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;@angular/common&#x27;</span>;</div><div class="hljs-ln-line"></div><div class="hljs-ln-line">@Component({</div><div class="hljs-ln-line">  selector: <span class="hljs-string">&#x27;hello-world&#x27;</span>,</div><div class="hljs-ln-line">  standalone: <span class="hljs-keyword">true</span>,</div><div class="hljs-ln-line">  imports: [CommonModule],</div><div class="hljs-ln-line">  templateUrl: <span class="hljs-string">&#x27;./hello-world.html&#x27;</span>,</div><div class="hljs-ln-line">  styleUrls: [<span class="hljs-string">&#x27;./hello-world.css&#x27;</span>],</div><div class="hljs-ln-line">})</div><div class="hljs-ln-line">export <span class="hljs-keyword">default</span> <span class="hljs-keyword">class</span> HelloWorldComponent {</div><div class="hljs-ln-line remove">  world = <span class="hljs-string">&#x27;World&#x27;</span>;</div><div class="hljs-ln-line add">  world = <span class="hljs-string">&#x27;World!!!&#x27;</span>;</div><div class="hljs-ln-line">  <span class="hljs-keyword">count</span> = signal(<span class="hljs-number">0</span>);</div><div class="hljs-ln-line remove">  changeDetector = <span class="hljs-keyword">inject</span>(ChangeDetectorRef);</div><div class="hljs-ln-line"></div><div class="hljs-ln-line">  increase(): <span class="hljs-keyword">void</span> {</div><div class="hljs-ln-line">    <span class="hljs-keyword">this</span>.<span class="hljs-keyword">count</span>.update((<span class="hljs-keyword">previous</span>) =&gt; {</div><div class="hljs-ln-line">      <span class="hljs-keyword">return</span> <span class="hljs-keyword">previous</span> + <span class="hljs-number">1</span>;</div><div class="hljs-ln-line">    });</div><div class="hljs-ln-line remove">    <span class="hljs-keyword">this</span>.changeDetector.detectChanges();</div><div class="hljs-ln-line">  }</div><div class="hljs-ln-line">}</div><div class="hljs-ln-line"></div></code>
      </pre>
    </div>
    <div class="docs-code linenums" path="hello-world/hello-world.html">
      <pre>
        <code><div class="hljs-ln-line"><span class="language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">h2</span>&gt;</span>Hello </span><span class="hljs-template-variable">{{ <span class="hljs-name">world</span> }}</span><span class="language-xml"><span class="hljs-tag">&lt;/<span class="hljs-name">h2</span>&gt;</span></div><div class="hljs-ln-line"><span class="hljs-tag">&lt;<span class="hljs-name">button</span> (<span class="hljs-attr">click</span>)=<span class="hljs-string">&quot;increase()&quot;</span>&gt;</span>Increase<span class="hljs-tag">&lt;/<span class="hljs-name">button</span>&gt;</span></div><div class="hljs-ln-line"><span class="hljs-tag">&lt;<span class="hljs-name">p</span>&gt;</span>Counter: </span><span class="hljs-template-variable">{{ <span class="hljs-name">count</span>() }}</span><span class="language-xml"><span class="hljs-tag">&lt;/<span class="hljs-name">p</span>&gt;</span></div><div class="hljs-ln-line"></span></div></code>
      </pre>
    </div>
  </div>`,
  };

  beforeEach(() => {
    exampleContentSpy = jasmine.createSpyObj('ExampleContentLoader', ['getCodeExampleData']);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocViewer, NoopAnimationsModule, RouterTestingModule],
      providers: [{provide: EXAMPLE_VIEWER_CONTENT_LOADER, useValue: exampleContentSpy}],
    }).compileComponents();

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
    fixture.componentRef.setInput(
      'docContent',
      sampleDocContentWithExampleViewerPlaceholders.contents,
    );
    fixture.detectChanges();
    await fixture.whenStable();

    const exampleViewer = fixture.debugElement.query(By.directive(ExampleViewer));

    expect(exampleViewer).not.toBeNull();
    expect(exampleViewer.componentInstance.view()).toBe(CodeExampleViewMode.SNIPPET);
  });

  it('should display example viewer in multi file mode when user clicks expand', async () => {
    const fixture = TestBed.createComponent(DocViewer);
    fixture.componentRef.setInput(
      'docContent',
      sampleDocContentWithExpandedExampleViewerPlaceholders.contents,
    );
    fixture.detectChanges();
    await fixture.whenStable();

    const exampleViewer = fixture.debugElement.query(By.directive(ExampleViewer));
    const expandButton = fixture.debugElement.query(
      By.css('button[aria-label="Expand code example"]'),
    );
    expandButton.nativeElement.click();

    expect(exampleViewer).not.toBeNull();
    expect(exampleViewer.componentInstance.view()).toBe(CodeExampleViewMode.MULTI_FILE);
    expect(exampleViewer.componentInstance.tabs().length).toBe(2);
  });
});
