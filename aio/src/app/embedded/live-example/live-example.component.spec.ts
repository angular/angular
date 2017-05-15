import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement, ElementRef } from '@angular/core';
import { Location } from '@angular/common';

import { LiveExampleComponent, EmbeddedPlunkerComponent } from './live-example.component';

const defaultTestPath = '/test';

describe('LiveExampleComponent', () => {
  let hostComponent: HostComponent;
  let liveExampleDe: DebugElement;
  let liveExampleComponent: LiveExampleComponent;
  let fixture: ComponentFixture<HostComponent>;
  let testPath: string;
  let liveExampleContent: string;

  //////// test helpers ////////

  @Component({
    selector: 'aio-host-comp',
    template: `<live-example></live-example>`
  })
  class HostComponent { }

  class TestLocation {
    path() { return testPath; }
  }

  function getAnchors() {
    return liveExampleDe.queryAll(By.css('a')).map(de => de.nativeElement as HTMLAnchorElement);
  }

  function getHrefs() { return getAnchors().map(a => a.href); }

  function setHostTemplate(template: string) {
    TestBed.overrideComponent(HostComponent, {set: {template}});
  }

  function testComponent(testFn: () => void) {
    fixture = TestBed.createComponent(HostComponent);
    hostComponent = fixture.componentInstance;
    liveExampleDe = fixture.debugElement.children[0];
    liveExampleComponent = liveExampleDe.componentInstance;

    // Copy the LiveExample's innerHTML (content)
    // into the `liveExampleContent` property as the DocViewer does
    liveExampleDe.nativeElement.liveExampleContent = liveExampleContent;

    fixture.detectChanges();
    liveExampleComponent.onResize(1033); // wide by default
    fixture.detectChanges();

    testFn();
  }

  //////// tests ////////
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ HostComponent, LiveExampleComponent, EmbeddedPlunkerComponent ],
      providers: [
        { provide: Location, useClass: TestLocation }
      ]
    })
    // Disable the <iframe> within the EmbeddedPlunkerComponent
    .overrideComponent(EmbeddedPlunkerComponent, {set: {template: 'NO IFRAME'}});

    testPath = defaultTestPath;
    liveExampleContent = undefined;
  });

  describe('when not embedded', () => {
    function getLiveExampleAnchor() { return getAnchors()[0]; }
    function getDownloadAnchor() { return getAnchors()[1]; }

    it('should create LiveExampleComponent', () => {
      testComponent(() => {
        expect(liveExampleComponent).toBeTruthy('LiveExampleComponent');
      });
    });

    it('should have expected plunker & download hrefs', () => {
      testPath = '/tutorial/toh-pt1';
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain('/toh-pt1/eplnkr.html');
        expect(hrefs[1]).toContain('/toh-pt1/toh-pt1.zip');
      });
    });

    it('should have expected plunker & download hrefs even when path has # frag', () => {
      testPath = '/tutorial/toh-pt1#somewhere';
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain('/toh-pt1/eplnkr.html');
        expect(hrefs[1]).toContain('/toh-pt1/toh-pt1.zip');
      });
    });

    it('should have expected plunker & download hrefs even when path has ? params', () => {
      testPath = '/tutorial/toh-pt1?foo=1&bar="bar"';
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain('/toh-pt1/eplnkr.html');
        expect(hrefs[1]).toContain('/toh-pt1/toh-pt1.zip');
      });
    });

    it('should have expected flat-style plunker when has `flat-style`', () => {
      testPath = '/tutorial/toh-pt1';
      setHostTemplate('<live-example flat-style></live-example>');
      testComponent(() => {
        // The file should be "plnkr.html", not "eplnkr.html"
        expect(getLiveExampleAnchor().href).toContain('/plnkr.html');
      });
    });

    it('should have expected plunker & download hrefs when has example directory (name)', () => {
      testPath = '/guide/somewhere';
      setHostTemplate('<live-example name="toh-pt1"></live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain('/toh-pt1/eplnkr.html');
        expect(hrefs[1]).toContain('/toh-pt1/toh-pt1.zip');
      });
    });

    it('should have expected plunker & download hrefs when has `plnkr`', () => {
      testPath = '/testing';
      setHostTemplate('<live-example plnkr="app-specs"></live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain('/testing/app-specs.eplnkr.html');
        expect(hrefs[1]).toContain('/testing/app-specs.testing.zip');
      });
    });

    it('should have expected plunker & download hrefs when has `name` & `plnkr`', () => {
      testPath = '/guide/somewhere';
      setHostTemplate('<live-example name="testing" plnkr="app-specs"></live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain('/testing/app-specs.eplnkr.html');
        expect(hrefs[1]).toContain('/testing/app-specs.testing.zip');
      });
    });

    it('should be embedded style by default', () => {
      setHostTemplate('<live-example></live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain(defaultTestPath + '/eplnkr.html');
      });
    });

    it('should be flat style when flat-style requested', () => {
      setHostTemplate('<live-example flat-style></live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain(defaultTestPath + '/plnkr.html');
      });
    });

    it('should not have a download link when `noDownload` atty present', () => {
      setHostTemplate('<live-example noDownload></live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs.length).toBe(1, 'only the plunker live-example anchor');
        expect(hrefs[0]).toContain('plnkr.html');
      });
    });

    it('should only have a download link when `downloadOnly` atty present', () => {
      setHostTemplate('<live-example downloadOnly>download this</live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs.length).toBe(1, 'only the zip anchor');
        expect(hrefs[0]).toContain('.zip');      });
    });

    it('should have default title when no title attribute or content', () => {
      setHostTemplate('<live-example></live-example>');
      testComponent(() => {
        const expectedTitle = 'live example';
        const anchor = getLiveExampleAnchor();
        expect(anchor.innerText).toBe(expectedTitle, 'anchor content');
        expect(anchor.getAttribute('title')).toBe(expectedTitle, 'title');
      });
    });

    it('should add title when set `title` attribute', () => {
      const expectedTitle = 'Great Example';
      setHostTemplate(`<live-example title="${expectedTitle}"></live-example>`);
      testComponent(() => {
        const anchor = getLiveExampleAnchor();
        expect(anchor.innerText).toBe(expectedTitle, 'anchor content');
        expect(anchor.getAttribute('title')).toBe(expectedTitle, 'title');
      });
    });

    it('should add title from <live-example> body', () => {
      liveExampleContent = 'The Greatest Example';
      setHostTemplate('<live-example title="ignore this title"></live-example>');
      testComponent(() => {
        const anchor = getLiveExampleAnchor();
        expect(anchor.innerText).toBe(liveExampleContent, 'anchor content');
        expect(anchor.getAttribute('title')).toBe(liveExampleContent, 'title');
      });
    });

    it('should not duplicate the exampleDir on a zip when there is a / on the name', () => {
      setHostTemplate('<live-example name="testing/ts"></live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain('/testing/ts/eplnkr.html');
        expect(hrefs[1]).toContain('/testing/ts/testing.zip');
      });
    });
  });

  describe('when embedded', () => {

    function getDownloadAnchor() {
      const anchor = liveExampleDe.query(By.css('p > a'));
      return anchor && anchor.nativeElement as HTMLAnchorElement;
    }

    function getEmbeddedPlunkerComponent() {
      const compDe = liveExampleDe.query(By.directive(EmbeddedPlunkerComponent));
      return compDe && compDe.componentInstance as EmbeddedPlunkerComponent;
    }

    function getImg() {
      const img = liveExampleDe.query(By.css('img'));
      return img && img.nativeElement as HTMLImageElement;
    }

    describe('before click', () => {

      it('should have hidden, embedded plunker', () => {
        setHostTemplate('<live-example embedded></live-example>');
        testComponent(() => {
          expect(liveExampleComponent.mode).toBe('embedded', 'component is embedded');
          expect(liveExampleComponent.showEmbedded).toBe(false, 'component.showEmbedded');
          expect(getEmbeddedPlunkerComponent()).toBeNull('no EmbeddedPlunkerComponent');
        });
      });

      it('should have default plunker placeholder image', () => {
        setHostTemplate('<live-example embedded></live-example>');
        testComponent(() => {
          expect(getImg().src).toContain('plunker/placeholder.png');
        });
      });

      it('should have specified plunker placeholder image', () => {
        const expectedSrc = 'example/demo.png';
        setHostTemplate(`<live-example embedded img="${expectedSrc}"></live-example>`);
        testComponent(() => {
          expect(getImg().src).toContain(expectedSrc);
        });
      });

      it('should have download paragraph with expected anchor href', () => {
        testPath = '/tutorial/toh-pt1';
        setHostTemplate('<live-example embedded></live-example>');
        testComponent(() => {
          expect(getDownloadAnchor().href).toContain('/toh-pt1/toh-pt1.zip');
        });
      });

      it('should not have download paragraph when has `nodownload`', () => {
        testPath = '/tutorial/toh-pt1';
        setHostTemplate('<live-example embedded nodownload></live-example>');
        testComponent(() => {
          expect(getDownloadAnchor()).toBeNull();
        });
      });

    });

    describe('after click', () => {

      function clickImg() {
        getImg().click();
        fixture.detectChanges();
      }

      it('should show plunker in the page', () => {
        setHostTemplate('<live-example embedded></live-example>');
        testComponent(() => {
          clickImg();
          expect(liveExampleComponent.mode).toBe('embedded', 'component is embedded');
          expect(liveExampleComponent.showEmbedded).toBe(true, 'component.showEmbedded');
          expect(getEmbeddedPlunkerComponent()).toBeDefined('has EmbeddedPlunkerComponent');
        });
      });

    });
  });

  describe('when narrow display (mobile)', () => {

    it('should be embedded style when no style defined', () => {
      setHostTemplate('<live-example></live-example>');
      testComponent(() => {
        liveExampleComponent.onResize(600); // narrow
        fixture.detectChanges();
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain(defaultTestPath + '/eplnkr.html');
      });
    });

    it('should be embedded style even when flat-style requested', () => {
      setHostTemplate('<live-example flat-style></live-example>');
      testComponent(() => {
        liveExampleComponent.onResize(600); // narrow
        fixture.detectChanges();
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain(defaultTestPath + '/eplnkr.html');
      });
    });
  });
});
