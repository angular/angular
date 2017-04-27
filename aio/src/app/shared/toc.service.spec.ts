import { ReflectiveInjector, SecurityContext } from '@angular/core';
import { DOCUMENT, DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { TocItem, TocService } from './toc.service';

describe('TocService', () => {
  let injector: ReflectiveInjector;
  let tocService: TocService;

  // call TocService.genToc
  function callGenToc(html = '', docId = 'fizz/buzz'): HTMLDivElement {
    const el = document.createElement('div');
    el.innerHTML = html;
    tocService.genToc(el, docId);
    return el;
  }

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
      { provide: DomSanitizer, useClass: TestDomSanitizer },
      { provide: DOCUMENT, useValue: document },
      TocService,
    ]);
    tocService = injector.get(TocService);
  });

  it('should be creatable', () => {
    expect(tocService).toBeTruthy();
  });

  describe('should clear tocList', () => {
    // Start w/ dummy data from previous usage
    beforeEach(() => tocService.tocList = [{}, {}] as TocItem[]);

    it('when reset()', () => {
      tocService.reset();
      expect(tocService.tocList.length).toEqual(0);
    });

    it('when given undefined doc element', () => {
      tocService.genToc(undefined);
      expect(tocService.tocList.length).toEqual(0);
    });

    it('when given doc element w/ no headings', () => {
      callGenToc('<p>This</p><p>and</p><p>that</p>');
      expect(tocService.tocList.length).toEqual(0);
    });

    it('when given doc element w/ headings other than h2 & h3', () => {
      callGenToc('<h1>This</h1><h4>and</h4><h5>that</h5>');
      expect(tocService.tocList.length).toEqual(0);
    });

    it('when given doc element w/ no-toc headings', () => {
      // tolerates different spellings/casing of the no-toc class
      callGenToc(`
        <h2 class="no-toc">one</h2><p>some one</p>
        <h2 class="notoc">two</h2><p>some two</p>
        <h2 class="no-Toc">three</h2><p>some three</p>
        <h2 class="noToc">four</h2><p>some four</p>
      `);
      expect(tocService.tocList.length).toEqual(0);
    });
  });

  describe('when given many headings', () => {
    let docId: string;
    let docEl: HTMLDivElement;
    let tocList: TocItem[];
    let headings: NodeListOf<HTMLHeadingElement>;

    beforeEach(() => {
      docId = 'fizz/buzz';

      docEl = callGenToc(`
        <h1>Fun with TOC</h1>

        <h2 id="heading-one-special-id">Heading one</h2>
          <p>h2 toc 0</p>

        <h2>H2 Two</h2>
          <p>h2 toc 1</p>

        <h2>H2 <b>Three</b></h2>
          <p>h2 toc 2</p>
          <h3 id="h3-3a">H3 3a</h3> <p>h3 toc 3</p>
          <h3 id="h3-3b">H3 3b</h3> <p>h3 toc 4</p>

            <!-- h4 shouldn't be in TOC -->
            <h4 id="h4-3b">H4 of h3-3b</h4> <p>an h4</p>

        <h2><i>H2 4 <b>repeat</b></i></h2>
          <p>h2 toc 5</p>

        <h2><b>H2 4 <i>repeat</i></b></h2>
          <p>h2 toc 6</p>

        <h2 class="no-toc" id="skippy">Skippy</h2>
          <p>Skip this header</p>

        <h2 id="h2-6">H2 6</h2>
          <p>h2 toc 7</p>
          <h3 id="h3-6a">H3 6a</h3> <p>h3 toc 8</p>
      `, docId);

      tocList = tocService.tocList;
      headings = docEl.querySelectorAll('h1,h2,h3,h4') as NodeListOf<HTMLHeadingElement>;
    });

    it('should have tocList with expect number of TocItems', () => {
      // should ignore h1, h4, and the no-toc h2
      expect(tocList.length).toEqual(headings.length - 3);
    });

    it('should have href with docId and heading\'s id', () => {
      const tocItem = tocList[0];
      expect(tocItem.href).toEqual(`${docId}#heading-one-special-id`);
    });

    it('should have level "h2" for an <h2>', () => {
      const tocItem = tocList[0];
      expect(tocItem.level).toEqual('h2');
    });

    it('should have level "h3" for an <h3>', () => {
      const tocItem = tocList[3];
      expect(tocItem.level).toEqual('h3');
    });

    it('should have title which is heading\'s innerText ', () => {
      const heading = headings[3];
      const tocItem = tocList[2];
      expect(heading.innerText).toEqual(tocItem.title);
    });

    it('should have "SafeHtml" content which is heading\'s innerHTML ', () => {
      const heading = headings[3];
      const content = tocList[2].content;
      expect((<TestSafeHtml>content).changingThisBreaksApplicationSecurity)
        .toEqual(heading.innerHTML);
    });

    it('should calculate and set id of heading without an id', () => {
      const id = headings[2].getAttribute('id');
      expect(id).toEqual('h2-two');
    });

    it('should have href with docId and calculated heading id', () => {
      const tocItem = tocList[1];
      expect(tocItem.href).toEqual(`${docId}#h2-two`);
    });

    it('should ignore HTML in heading when calculating id', () => {
      const id = headings[3].getAttribute('id');
      const tocItem = tocList[2];
      expect(id).toEqual('h2-three', 'heading id');
      expect(tocItem.href).toEqual(`${docId}#h2-three`, 'tocItem href');
    });

    it('should avoid repeating an id when calculating', () => {
      const tocItem4a = tocList[5];
      const tocItem4b = tocList[6];
      expect(tocItem4a.href).toEqual(`${docId}#h2-4-repeat`, 'first');
      expect(tocItem4b.href).toEqual(`${docId}#h2-4-repeat-2`, 'second');
    });
  });

  describe('TocItem for an h2 with anchor link and extra whitespace', () => {
    let docId: string;
    let docEl: HTMLDivElement;
    let tocItem: TocItem;
    let expectedTocContent: string;

    beforeEach(() => {
      docId = 'fizz/buzz/';
     expectedTocContent = 'Setup to develop <i>locally</i>.';

      // An almost-actual <h2> ... with extra whitespace
      docEl = callGenToc(`
        <h2 id="setup-to-develop-locally">
          <a href="tutorial/toh-pt1#setup-to-develop-locally" aria-hidden="true">
            <span class="icon icon-link"></span>
          </a>
          ${expectedTocContent}
        </h2>
      `, docId);

      tocItem = tocService.tocList[0];
    });

    it('should have expected href', () => {
      expect(tocItem.href).toEqual(`${docId}#setup-to-develop-locally`);
    });

    it('should have expected title', () => {
      expect(tocItem.title).toEqual('Setup to develop locally.');
    });

    it('should have removed anchor link from tocItem html content', () => {
      expect((<TestSafeHtml>tocItem.content)
        .changingThisBreaksApplicationSecurity)
        .toEqual('Setup to develop <i>locally</i>.');
    });

    it('should have bypassed HTML sanitizing of heading\'s innerHTML ', () => {
      const domSanitizer: TestDomSanitizer = injector.get(DomSanitizer);
      expect(domSanitizer.bypassSecurityTrustHtml)
        .toHaveBeenCalledWith(expectedTocContent);
    });
  });
});

interface TestSafeHtml extends SafeHtml {
  changingThisBreaksApplicationSecurity: string;
  getTypeName: () => string;
}

class TestDomSanitizer {
  bypassSecurityTrustHtml = jasmine.createSpy('bypassSecurityTrustHtml')
    .and.callFake(html => {
      return {
        changingThisBreaksApplicationSecurity: html,
        getTypeName: () => 'HTML',
      } as TestSafeHtml;
    });
}
