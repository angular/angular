import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, ComponentFactoryResolver, DebugElement,
  ElementRef, Injector, NgModule, OnInit, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DocViewerComponent } from './doc-viewer.component';
import { DocumentContents } from 'app/documents/document.service';
import { EmbeddedModule, embeddedComponents, EmbeddedComponents } from 'app/embedded/embedded.module';
import { Title } from '@angular/platform-browser';
import { TocService } from 'app/shared/toc.service';

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

//// Test Services ////

class TestTitleService {
  setTitle = jasmine.createSpy('reset');
}

class TestTocService {
  reset = jasmine.createSpy('reset');
  genToc = jasmine.createSpy('genToc');
}

//////// Tests //////////////

describe('DocViewerComponent', () => {
  let component: TestComponent;
  let docViewerDE: DebugElement;
  let docViewerEl: HTMLElement;
  let fixture: ComponentFixture<TestComponent>;

  function setCurrentDoc(contents = '', id = 'fizz/buzz') {
    component.currentDoc = { contents, id };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ TestModule ],
      declarations: [
        TestComponent,
        DocViewerComponent,
        embeddedTestComponents
      ],
      providers: [
        { provide: EmbeddedComponents, useValue: {components: embeddedTestComponents} },
        { provide: Title, useClass: TestTitleService },
        { provide: TocService, useClass: TestTocService }
      ]
    });
  });

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
    setCurrentDoc();
    fixture.detectChanges();
    expect(docViewerEl.innerHTML).toBe('');
  });

  it(('should display simple static content doc'), () => {
    const contents = '<p>Howdy, doc viewer</p>';
    setCurrentDoc(contents);
    fixture.detectChanges();
    expect(docViewerEl.innerHTML).toEqual(contents);
  });

  it(('should display nothing after reset static content doc'), () => {
    const contents = '<p>Howdy, doc viewer</p>';
    setCurrentDoc(contents);
    fixture.detectChanges();
    component.currentDoc = { contents: '', id: 'a/c' };
    fixture.detectChanges();
    expect(docViewerEl.innerHTML).toEqual('');
  });

  it(('should apply FooComponent'), () => {
    const contents = `
      <p>Above Foo</p>
      <p><aio-foo></aio-foo></p>
      <p>Below Foo</p>
    `;
    setCurrentDoc(contents);
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
    setCurrentDoc(contents);
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
    setCurrentDoc(contents);
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
    setCurrentDoc(contents);

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
    setCurrentDoc(contents);

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
    setCurrentDoc(contents);

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
    setCurrentDoc(contents);

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
    setCurrentDoc(contents);

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

  describe('Title', () => {
    let titleService: TestTitleService;

    beforeEach(() => {
      titleService = TestBed.get(Title);
    });

    it('should set the default empty title when no <h1>', () => {
      setCurrentDoc('Some content');
      fixture.detectChanges();
      expect(titleService.setTitle).toHaveBeenCalledWith('Angular');
    });

    it('should set the expected title when has <h1>', () => {
      setCurrentDoc('<h1>Features</h1>Some content');
      fixture.detectChanges();
      expect(titleService.setTitle).toHaveBeenCalledWith('Angular - Features');
    });

    it('should set the expected title with a no-toc <h1>', () => {
      setCurrentDoc('<h1 class="no-toc">Features</h1>Some content');
      fixture.detectChanges();
      expect(titleService.setTitle).toHaveBeenCalledWith('Angular - Features');
    });
  });

  describe('TOC', () => {
    let tocService: TestTocService;

    function getAioToc(): HTMLElement {
      return fixture.debugElement.nativeElement.querySelector('aio-toc');
    }

    beforeEach(() => {
      tocService = TestBed.get(TocService);
    });

    describe('if no <h1> title', () => {
      beforeEach(() => {
        setCurrentDoc('Some content');
        fixture.detectChanges();
      });

      it('should not have an <aio-toc>', () => {
        expect(getAioToc()).toBeFalsy();
      });

      it('should reset Toc Service', () => {
        expect(tocService.reset).toHaveBeenCalled();
      });

      it('should not call Toc Service genToc()', () => {
        expect(tocService.genToc).not.toHaveBeenCalled();
      });
    });

    it('should not have an <aio-toc> with a no-toc <h1>', () => {
      setCurrentDoc('<h1 class="no-toc">Features</h1>Some content');
      fixture.detectChanges();
      expect(getAioToc()).toBeFalsy();
    });

    describe('when has an <h1> (title)', () => {
      beforeEach(() => {
        setCurrentDoc('<h1>Features</h1>Some content');
        fixture.detectChanges();
      });

      it('should add <aio-toc>', () => {
        expect(getAioToc()).toBeTruthy();
      });

      it('should have <aio-toc> with "embedded" class', () => {
        expect(getAioToc().classList.contains('embedded')).toEqual(true);
      });

      it('should call Toc Service genToc()', () => {
        expect(tocService.genToc).toHaveBeenCalled();
      });
    });
  });
});
