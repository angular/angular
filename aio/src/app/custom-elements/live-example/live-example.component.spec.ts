import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component, DebugElement } from '@angular/core';
import { Location } from '@angular/common';

import { LiveExampleComponent, EmbeddedStackblitzComponent } from './live-example.component';

const defaultTestPath = '/test';

describe('LiveExampleComponent', () => {
  let liveExampleDe: DebugElement;
  let liveExampleComponent: LiveExampleComponent;
  let fixture: ComponentFixture<HostComponent>;
  let testPath: string;

  //////// test helpers ////////

  @Component({
    selector: 'aio-host-comp',
    template: '<live-example></live-example>'
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
    liveExampleDe = fixture.debugElement.children[0];
    liveExampleComponent = liveExampleDe.componentInstance;

    // Trigger `ngAfterContentInit()`.
    fixture.detectChanges();

    testFn();
  }

  //////// tests ////////
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ HostComponent, LiveExampleComponent, EmbeddedStackblitzComponent ],
      providers: [
        { provide: Location, useClass: TestLocation }
      ]
    })
    // Disable the <iframe> within the EmbeddedStackblitzComponent
    .overrideComponent(EmbeddedStackblitzComponent, {set: {template: 'NO IFRAME'}});

    testPath = defaultTestPath;
  });

  describe('when not embedded', () => {
    function getLiveExampleAnchor() { return getAnchors()[0]; }

    it('should create LiveExampleComponent', () => {
      testComponent(() => {
        expect(liveExampleComponent).withContext('LiveExampleComponent').toBeTruthy();
      });
    });

    it('should have expected stackblitz & download hrefs', () => {
      testPath = '/tutorial/tour-of-heroes/toh-pt1';
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain('/toh-pt1/stackblitz.html');
        expect(hrefs[1]).toContain('/toh-pt1/toh-pt1.zip');
      });
    });

    it('should have expected stackblitz & download hrefs even when path has # frag', () => {
      testPath = '/tutorial/tour-of-heroes/toh-pt1#somewhere';
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain('/toh-pt1/stackblitz.html');
        expect(hrefs[1]).toContain('/toh-pt1/toh-pt1.zip');
      });
    });

    it('should have expected stackblitz & download hrefs even when path has ? params', () => {
      testPath = '/tutorial/tour-of-heroes/toh-pt1?foo=1&bar="bar"';
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain('/toh-pt1/stackblitz.html');
        expect(hrefs[1]).toContain('/toh-pt1/toh-pt1.zip');
      });
    });

    it('should have expected stackblitz & download hrefs when has example directory (name)', () => {
      testPath = '/guide/somewhere';
      setHostTemplate('<live-example name="toh-pt1"></live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain('/toh-pt1/stackblitz.html');
        expect(hrefs[1]).toContain('/toh-pt1/toh-pt1.zip');
      });
    });

    it('should have expected stackblitz & download hrefs when has `stackblitz`', () => {
      testPath = '/testing';
      setHostTemplate('<live-example stackblitz="app-specs"></live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain('/testing/app-specs.stackblitz.html');
        expect(hrefs[1]).toContain('/testing/app-specs.testing.zip');
      });
    });

    it('should have expected stackblitz & download hrefs when has `name` & `stackblitz`', () => {
      testPath = '/guide/somewhere';
      setHostTemplate('<live-example name="testing" stackblitz="app-specs"></live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain('/testing/app-specs.stackblitz.html');
        expect(hrefs[1]).toContain('/testing/app-specs.testing.zip');
      });
    });

    it('should be embedded style by default', () => {
      setHostTemplate('<live-example></live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain(defaultTestPath + '/stackblitz.html');
      });
    });

    it('should not have a download link when `noDownload` attr present', () => {
      setHostTemplate('<live-example noDownload></live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs.length).withContext('only the stackblitz live-example anchor').toBe(1);
        expect(hrefs[0]).toContain('stackblitz.html');
      });
    });

    it('should only have a download link when `downloadOnly` attr present', () => {
      setHostTemplate('<live-example downloadOnly>download this</live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs.length).withContext('only the zip anchor').toBe(1);
        expect(hrefs[0]).toContain('.zip');      });
    });

    it('should have default title when no title attribute or content', () => {
      setHostTemplate('<live-example></live-example>');
      testComponent(() => {
        const expectedTitle = 'live example';
        const anchor = getLiveExampleAnchor();
        expect(anchor.textContent).withContext('anchor content').toBe(expectedTitle);
        expect(anchor.getAttribute('title')).withContext('title').toBe(expectedTitle);
      });
    });

    it('should add title when set `title` attribute', () => {
      const expectedTitle = 'Great Example';
      setHostTemplate(`<live-example title="${expectedTitle}"></live-example>`);
      testComponent(() => {
        const anchor = getLiveExampleAnchor();
        expect(anchor.textContent).withContext('anchor content').toBe(expectedTitle);
        expect(anchor.getAttribute('title')).withContext('title').toBe(expectedTitle);
      });
    });

    it('should add title from <live-example> body', () => {
      const expectedTitle = 'The Greatest Example';
      setHostTemplate(`<live-example title="ignore this title">${expectedTitle}</live-example>`);
      testComponent(() => {
        const anchor = getLiveExampleAnchor();
        expect(anchor.textContent).withContext('anchor content').toBe(expectedTitle);
        expect(anchor.getAttribute('title')).withContext('title').toBe(expectedTitle);
      });
    });

    it('should not duplicate the exampleDir on a zip when there is a / on the name', () => {
      setHostTemplate('<live-example name="testing/ts"></live-example>');
      testComponent(() => {
        const hrefs = getHrefs();
        expect(hrefs[0]).toContain('/testing/ts/stackblitz.html');
        expect(hrefs[1]).toContain('/testing/ts/testing.zip');
      });
    });
  });

  describe('when embedded', () => {

    function getDownloadAnchor() {
      const anchor = liveExampleDe.query(By.css('p > a'));
      return anchor && anchor.nativeElement as HTMLAnchorElement;
    }

    function getEmbeddedStackblitzComponent() {
      const compDe = liveExampleDe.query(By.directive(EmbeddedStackblitzComponent));
      return compDe && compDe.componentInstance as EmbeddedStackblitzComponent;
    }

    it('should have hidden, embedded stackblitz', () => {
      setHostTemplate('<live-example embedded></live-example>');
      testComponent(() => {
        expect(liveExampleComponent.mode).withContext('component is embedded').toBe('embedded');
        expect(getEmbeddedStackblitzComponent()).withContext('EmbeddedStackblitzComponent').toBeTruthy();
      });
    });

    it('should have download paragraph with expected anchor href', () => {
      testPath = '/tutorial/tour-of-heroes/toh-pt1';
      setHostTemplate('<live-example embedded></live-example>');
      testComponent(() => {
        expect(getDownloadAnchor().href).toContain('/toh-pt1/toh-pt1.zip');
      });
    });

    it('should not have download paragraph when has `nodownload`', () => {
      testPath = '/tutorial/tour-of-heroes/toh-pt1';
      setHostTemplate('<live-example embedded nodownload></live-example>');
      testComponent(() => {
        expect(getDownloadAnchor()).toBeNull();
      });
    });
  });
});
