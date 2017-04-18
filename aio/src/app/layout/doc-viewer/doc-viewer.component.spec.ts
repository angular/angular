import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentFactoryResolver, ElementRef, Injector, NgModule, OnInit, ViewChild, Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DocViewerComponent } from './doc-viewer.component';
import { DocumentContents } from 'app/documents/document.service';
import { EmbeddedModule, embeddedComponents, EmbeddedComponents } from 'app/embedded/embedded.module';


/// Embedded Test Components ///

///// FooComponent /////

@Component({
  selector: 'aio-foo',
  template: `Foo Component`
})
class FooComponent { }

///// BarComponent /////

@Component({
  selector: 'aio-bar',
  template: `
    <hr>
    <h2>Bar Component</h2>
    <p #barContent></p>
    <hr>
  `
})
class BarComponent implements OnInit {

  @ViewChild('barContent') barContentRef: ElementRef;

  constructor(public elementRef: ElementRef) { }

  // Project content in ngOnInit just like CodeExampleComponent
  ngOnInit() {
    // Security: this is a test component; never deployed
    this.barContentRef.nativeElement.innerHTML = this.elementRef.nativeElement.aioBarContent;
  }
}

///// BazComponent /////

@Component({
  selector: 'aio-baz',
  template: `
    <div>++++++++++++++</div>
    <h2>Baz Component</h2>
    <p #bazContent></p>
    <div>++++++++++++++</div>
  `
})
class BazComponent implements OnInit {

  @ViewChild('bazContent') bazContentRef: ElementRef;

  constructor(public elementRef: ElementRef) { }

  // Project content in ngOnInit just like CodeExampleComponent
  ngOnInit() {
    // Security: this is a test component; never deployed
    this.bazContentRef.nativeElement.innerHTML = this.elementRef.nativeElement.aioBazContent;
  }
}
///// Test Module //////

const embeddedTestComponents = [FooComponent, BarComponent, BazComponent];

@NgModule({
  imports: [ EmbeddedModule ],
  entryComponents: embeddedTestComponents
})
class TestModule { }

//// Test Component //////

@Component({
  selector: 'aio-test',
  template: `
    <aio-doc-viewer [doc]="currentDoc">Test Component</aio-doc-viewer>
  `
})
class TestComponent {
  currentDoc: DocumentContents;
  @ViewChild(DocViewerComponent) docViewer: DocViewerComponent;
}

//////// Tests //////////////

describe('DocViewerComponent', () => {
  let component: TestComponent;
  let docViewerDE: DebugElement;
  let docViewerEl: HTMLElement;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ],
      declarations: [
        TestComponent,
        DocViewerComponent,
        embeddedTestComponents
      ],
      providers: [
        {provide: EmbeddedComponents, useValue: {components: embeddedTestComponents}}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    docViewerDE = fixture.debugElement.children[0];
    docViewerEl = docViewerDE.nativeElement;
  });

  it('should create a DocViewer', () => {
    expect(component.docViewer).toBeTruthy();
  });

  it(('should display nothing when set currentDoc has no content'), () => {
    component.currentDoc = { title: 'fake title', contents: '', url: 'a/b' };
    fixture.detectChanges();
    expect(docViewerEl.innerHTML).toBe('');
  });

  it(('should display simple static content doc'), () => {
    const contents = '<p>Howdy, doc viewer</p>';
    component.currentDoc = { title: 'fake title', contents, url: 'a/b' };
    fixture.detectChanges();
    expect(docViewerEl.innerHTML).toEqual(contents);
  });

  it(('should display nothing after reset static content doc'), () => {
    const contents = '<p>Howdy, doc viewer</p>';
    component.currentDoc = { title: 'fake title', contents, url: 'a/b' };
    fixture.detectChanges();
    component.currentDoc = { title: 'fake title', contents: '', url: 'a/c' };
    fixture.detectChanges();
    expect(docViewerEl.innerHTML).toEqual('');
  });

  it(('should apply FooComponent'), () => {
    const contents = `
      <p>Above Foo</p>
      <p><aio-foo></aio-foo></p>
      <p>Below Foo</p>
    `;
    component.currentDoc = { title: 'fake title', contents, url: 'a/b' };
    fixture.detectChanges();
    const fooHtml = docViewerEl.querySelector('aio-foo').innerHTML;
    expect(fooHtml).toContain('Foo Component');
  });

  it(('should apply multiple FooComponents'), () => {
    const contents = `
      <p>Above Foo</p>
      <p><aio-foo></aio-foo></p>
      <div style="margin-left: 2em;">
        Holds a
        <aio-foo>Ignored text</aio-foo>
      </div>
      <p>Below Foo</p>
    `;
    component.currentDoc = { title: 'fake title', contents, url: 'a/b' };
    fixture.detectChanges();
    const foos = docViewerEl.querySelectorAll('aio-foo');
    expect(foos.length).toBe(2);
  });

  it(('should apply BarComponent'), () => {
    const contents = `
      <p>Above Bar</p>
      <aio-bar></aio-bar>
      <p>Below Bar</p>
    `;
    component.currentDoc = { title: 'fake title', contents, url: 'a/b' };
    fixture.detectChanges();
    const barHtml = docViewerEl.querySelector('aio-bar').innerHTML;
    expect(barHtml).toContain('Bar Component');
  });

  it(('should project bar content into BarComponent'), () => {
    const contents = `
      <p>Above Bar</p>
      <aio-bar>###bar content###</aio-bar>
      <p>Below Bar</p>
    `;
    component.currentDoc = { title: 'fake title', contents, url: 'a/b' };

    // necessary to trigger projection within ngOnInit
    fixture.detectChanges();

    const barHtml = docViewerEl.querySelector('aio-bar').innerHTML;
    expect(barHtml).toContain('###bar content###');
  });


  it(('should include Foo and Bar'), () => {
    const contents = `
      <p>Top</p>
      <p><aio-foo>ignored</aio-foo></p>
      <aio-bar>###bar content###</aio-bar>
      <p><aio-foo></aio-foo></p>
      <p>Bottom</p>
    `;
    component.currentDoc = { title: 'fake title', contents, url: 'a/b' };

    // necessary to trigger Bar's projection within ngOnInit
    fixture.detectChanges();

    const foos = docViewerEl.querySelectorAll('aio-foo');
    expect(foos.length).toBe(2, 'should have 2 foos');

    const barHtml = docViewerEl.querySelector('aio-bar').innerHTML;
    expect(barHtml).toContain('###bar content###', 'should have bar with projected content');
  });

  it(('should not include Bar within Foo'), () => {
    const contents = `
      <p>Top</p>
      <div>
        <aio-foo>
          <aio-bar>###bar content###</aio-bar>
        </aio-foo>
      </div>
      <p><aio-foo></aio-foo><p>
      <p>Bottom</p>
    `;
    component.currentDoc = { title: 'fake title', contents, url: 'a/b' };

    // necessary to trigger Bar's projection within ngOnInit
    fixture.detectChanges();

    const foos = docViewerEl.querySelectorAll('aio-foo');
    expect(foos.length).toBe(2, 'should have 2 foos');

    const bars = docViewerEl.querySelectorAll('aio-bar');
    expect(bars.length).toBe(0, 'did not expect Bar inside Foo');
  });

  // because FooComponents are processed before BazComponents
  it(('should include Foo within Bar'), () => {
    const contents = `
      <p>Top</p>
      <aio-bar>
        <div style="margin-left: 2em">
          Inner <aio-foo></aio-foo>
        </div>
      </aio-bar>
      <p><aio-foo></aio-foo></p>
      <p>Bottom</p>
    `;
    component.currentDoc = { title: 'fake title', contents, url: 'a/b' };

    // necessary to trigger Bar's projection within ngOnInit
    fixture.detectChanges();

    const foos = docViewerEl.querySelectorAll('aio-foo');
    expect(foos.length).toBe(2, 'should have 2 foos');

    const bars = docViewerEl.querySelectorAll('aio-bar');
    expect(bars.length).toBe(1, 'should have a bar');
    expect(bars[0].innerHTML).toContain('Bar Component', 'should have bar template content');
  });

  // The <aio-baz> tag and its inner content is copied
  // But the BazComponent is not created and therefore its template content is not displayed
  // because BarComponents are processed before BazComponents
  // and no chance for first Baz inside Bar to be processed by builder.
  it(('should NOT include Bar within Baz'), () => {
    const contents = `
      <p>Top</p>
      <aio-bar>
        <div style="margin-left: 2em">
          Inner <aio-baz>---baz stuff---</aio-baz>
        </div>
      </aio-bar>
      <p><aio-baz>---More baz--</aio-baz></p>
      <p>Bottom</p>
    `;
    component.currentDoc = { title: 'fake title', contents, url: 'a/b' };

    // necessary to trigger Bar's projection within ngOnInit
    fixture.detectChanges();
    const bazs = docViewerEl.querySelectorAll('aio-baz');

    // Both baz tags are there ...
    expect(bazs.length).toBe(2, 'should have 2 bazs');

    expect(bazs[0].innerHTML).not.toContain('Baz Component',
      'did not expect 1st Baz template content');

    expect(bazs[1].innerHTML).toContain('Baz Component',
      'expected 2nd Baz template content');

  });
});
