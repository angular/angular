import { DOCUMENT } from '@angular/common';
import { Injector } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { ScrollItem, ScrollSpyInfo, ScrollSpyService } from 'app/shared/scroll-spy.service';
import { TocItem, TocService } from './toc.service';

describe('TocService', () => {
  let injector: Injector;
  let scrollSpyService: MockScrollSpyService;
  let tocService: TocService;
  let lastTocList: TocItem[];

  // call TocService.genToc
  function callGenToc(html = '', docId = 'fizz/buzz'): HTMLDivElement {
    const el = document.createElement('div');
    el.innerHTML = html;
    tocService.genToc(el, docId);
    return el;
  }

  beforeEach(() => {
    injector = Injector.create({providers: [
      { provide: DomSanitizer, useClass: TestDomSanitizer, deps: [] },
      { provide: DOCUMENT, useValue: document },
      { provide: ScrollSpyService, useClass: MockScrollSpyService, deps: [] },
      { provide: TocService, deps: [DOCUMENT, DomSanitizer, ScrollSpyService] },
    ]});

    scrollSpyService = injector.get(ScrollSpyService) as unknown as MockScrollSpyService;
    tocService = injector.get(TocService);
    tocService.tocList.subscribe(tocList => lastTocList = tocList);
  });

  describe('tocList', () => {
    it('should emit the latest value to new subscribers', () => {
      const expectedValue1 = createTocItem('Heading A');
      const expectedValue2 = createTocItem('Heading B');
      let value1: TocItem[]|undefined;
      let value2: TocItem[]|undefined;

      tocService.tocList.next([]);
      tocService.tocList.subscribe(v => value1 = v);
      expect(value1).toEqual([]);

      tocService.tocList.next([expectedValue1, expectedValue2]);
      tocService.tocList.subscribe(v => value2 = v);
      expect(value2).toEqual([expectedValue1, expectedValue2]);
    });

    it('should emit the same values to all subscribers', () => {
      const expectedValue1 = createTocItem('Heading A');
      const expectedValue2 = createTocItem('Heading B');
      const emittedValues: TocItem[][] = [];

      tocService.tocList.subscribe(v => emittedValues.push(v));
      tocService.tocList.subscribe(v => emittedValues.push(v));
      tocService.tocList.next([expectedValue1, expectedValue2]);

      expect(emittedValues).toEqual([
        [expectedValue1, expectedValue2],
        [expectedValue1, expectedValue2]
      ]);
    });
  });

  describe('activeItemIndex', () => {
    it('should emit the active heading index (or null)', () => {
      const indices: (number | null)[] = [];

      tocService.activeItemIndex.subscribe(i => indices.push(i));
      callGenToc();

      scrollSpyService.$lastInfo.active.next({index: 42} as ScrollItem);
      scrollSpyService.$lastInfo.active.next({index: 0} as ScrollItem);
      scrollSpyService.$lastInfo.active.next(null);
      scrollSpyService.$lastInfo.active.next({index: 7} as ScrollItem);

      expect(indices).toEqual([null, 42, 0, null, 7]);
    });

    it('should reset athe active index (and unspy) when calling `reset()`', () => {
      const indices: (number | null)[] = [];

      tocService.activeItemIndex.subscribe(i => indices.push(i));

      callGenToc();
      const unspy = scrollSpyService.$lastInfo.unspy;
      scrollSpyService.$lastInfo.active.next({index: 42} as ScrollItem);

      expect(unspy).not.toHaveBeenCalled();
      expect(indices).toEqual([null, 42]);

      tocService.reset();

      expect(unspy).toHaveBeenCalled();
      expect(indices).toEqual([null, 42, null]);
    });

    it('should reset the active index (and unspy) when a new `tocList` is requested', () => {
      const indices: (number | null)[] = [];

      tocService.activeItemIndex.subscribe(i => indices.push(i));

      callGenToc();
      const unspy1 = scrollSpyService.$lastInfo.unspy;
      scrollSpyService.$lastInfo.active.next({index: 1} as ScrollItem);

      expect(unspy1).not.toHaveBeenCalled();
      expect(indices).toEqual([null, 1]);

      tocService.genToc();

      expect(unspy1).toHaveBeenCalled();
      expect(indices).toEqual([null, 1, null]);

      callGenToc();
      const unspy2 = scrollSpyService.$lastInfo.unspy;
      scrollSpyService.$lastInfo.active.next({index: 3} as ScrollItem);

      expect(unspy2).not.toHaveBeenCalled();
      expect(indices).toEqual([null, 1, null, null, 3]);

      callGenToc();
      scrollSpyService.$lastInfo.active.next({index: 4} as ScrollItem);

      expect(unspy2).toHaveBeenCalled();
      expect(indices).toEqual([null, 1, null, null, 3, null, 4]);
    });

    it('should emit the active index for the latest `tocList`', () => {
      const indices: (number | null)[] = [];

      tocService.activeItemIndex.subscribe(i => indices.push(i));

      callGenToc();
      const activeSubject1 = scrollSpyService.$lastInfo.active;
      activeSubject1.next({index: 1} as ScrollItem);
      activeSubject1.next({index: 2} as ScrollItem);

      callGenToc();
      const activeSubject2 = scrollSpyService.$lastInfo.active;
      activeSubject2.next({index: 3} as ScrollItem);
      activeSubject2.next({index: 4} as ScrollItem);

      expect(indices).toEqual([null, 1, 2, null, 3, 4]);
    });
  });

  describe('should clear tocList', () => {
    beforeEach(() => {
      // Start w/ dummy data from previous usage
      const expectedValue1 = createTocItem('Heading A');
      const expectedValue2 = createTocItem('Heading B');
      tocService.tocList.next([expectedValue1, expectedValue2]);
      expect(lastTocList).not.toEqual([]);
    });

    it('when reset()', () => {
      tocService.reset();
      expect(lastTocList).toEqual([]);
    });

    it('when given undefined doc element', () => {
      tocService.genToc(undefined);
      expect(lastTocList).toEqual([]);
    });

    it('when given doc element w/ no headings', () => {
      callGenToc('<p>This</p><p>and</p><p>that</p>');
      expect(lastTocList).toEqual([]);
    });

    it('when given doc element w/ headings other than h1, h2 & h3', () => {
      callGenToc('<h4>and</h4><h5>that</h5>');
      expect(lastTocList).toEqual([]);
    });

    it('when given doc element w/ no-toc headings', () => {
      // tolerates different spellings/casing of the no-toc class
      callGenToc(`
        <h2 class="no-toc">one</h2><p>some one</p>
        <h2 class="notoc">two</h2><p>some two</p>
        <h2 class="no-Toc">three</h2><p>some three</p>
        <h2 class="noToc">four</h2><p>some four</p>
      `);
      expect(lastTocList).toEqual([]);
    });
  });

  describe('when given many headings', () => {
    let docId: string;
    let docEl: HTMLDivElement;
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

      headings = docEl.querySelectorAll('h1,h2,h3,h4') as NodeListOf<HTMLHeadingElement>;
    });

    it('should have tocList with expect number of TocItems', () => {
      // should ignore h4, and the no-toc h2
      expect(lastTocList.length).toEqual(headings.length - 2);
    });

    it('should have href with docId and heading\'s id', () => {
      const tocItem = lastTocList.find(item => item.title === 'Heading one');
      expect(tocItem?.href).toEqual(`${docId}#heading-one-special-id`);
    });

    it('should have level "h1" for an <h1>', () => {
      const tocItem = lastTocList.find(item => item.title === 'Fun with TOC');
      expect(tocItem?.level).toEqual('h1');
    });

    it('should have level "h2" for an <h2>', () => {
      const tocItem = lastTocList.find(item => item.title === 'Heading one');
      expect(tocItem?.level).toEqual('h2');
    });

    it('should have level "h3" for an <h3>', () => {
      const tocItem = lastTocList.find(item => item.title === 'H3 3a');
      expect(tocItem?.level).toEqual('h3');
    });

    it('should have title which is heading\'s textContent ', () => {
      const heading = headings[3];
      const tocItem = lastTocList[3];
      expect(heading.textContent).toEqual(tocItem.title);
    });

    it('should have "SafeHtml" content which is heading\'s innerHTML ', () => {
      const heading = headings[3];
      const content = lastTocList[3].content;
      expect((content as TestSafeHtml).changingThisBreaksApplicationSecurity)
        .toEqual(heading.innerHTML);
    });

    it('should calculate and set id of heading without an id', () => {
      const id = headings[2].getAttribute('id');
      expect(id).toEqual('h2-two');
    });

    it('should have href with docId and calculated heading id', () => {
      const tocItem = lastTocList.find(item => item.title === 'H2 Two');
      expect(tocItem?.href).toEqual(`${docId}#h2-two`);
    });

    it('should ignore HTML in heading when calculating id', () => {
      const id = headings[3].getAttribute('id');
      const tocItem = lastTocList[3];
      expect(id).withContext('heading id').toEqual('h2-three');
      expect(tocItem.href).withContext('tocItem href').toEqual(`${docId}#h2-three`);
    });

    it('should avoid repeating an id when calculating', () => {
      const tocItems = lastTocList.filter(item => item.title === 'H2 4 repeat');
      expect(tocItems[0].href).withContext('first').toEqual(`${docId}#h2-4-repeat`);
      expect(tocItems[1].href).withContext('second').toEqual(`${docId}#h2-4-repeat-2`);
    });
  });

  describe('TocItem for an h2 with links and extra whitespace', () => {
    let docId: string;
    let tocItem: TocItem;

    beforeEach(() => {
      docId = 'fizz/buzz/';

      callGenToc(`
        <h2 id="setup-to-develop-locally">
          Setup to <a href="moo">develop</a> <i>locally</i>.
          <a class="header-link" href="tutorial/toh-pt1#setup-to-develop-locally" aria-hidden="true">
            <span class="icon">icon-link</span>
          </a>
          <div class="github-links">
            <a>GitHub</a>
            <a>links</a>
          </div>
        </h2>
      `, docId);

      tocItem = lastTocList[0];
    });

    it('should have expected href', () => {
      expect(tocItem.href).toEqual(`${docId}#setup-to-develop-locally`);
    });

    it('should have expected title', () => {
      expect(tocItem.title).toEqual('Setup to develop locally.');
    });

    it('should have removed anchor link and GitHub links from tocItem html content', () => {
      expect((tocItem.content as TestSafeHtml)
        .changingThisBreaksApplicationSecurity)
        .toEqual('Setup to develop <i>locally</i>.');
    });

    it('should have bypassed HTML sanitizing of heading\'s innerHTML ', () => {
      const domSanitizer: TestDomSanitizer = injector.get(DomSanitizer) as unknown as TestDomSanitizer;
      expect(domSanitizer.bypassSecurityTrustHtml)
        .toHaveBeenCalledWith('Setup to develop <i>locally</i>.');
    });
  });
});

interface TestSafeHtml extends SafeHtml {
  changingThisBreaksApplicationSecurity: string;
  getTypeName: () => string;
}

class TestDomSanitizer {
  bypassSecurityTrustHtml = jasmine.createSpy('bypassSecurityTrustHtml')
    .and.callFake((html: string) => ({
      changingThisBreaksApplicationSecurity: html,
      getTypeName: () => 'HTML',
    } as TestSafeHtml));
}

class MockScrollSpyService {
  private $$lastInfo: {
    active: Subject<ScrollItem | null>;
    unspy: jasmine.Spy;
  } | undefined;

  get $lastInfo() {
    if (!this.$$lastInfo) {
      throw new Error('$lastInfo is not yet defined. You must call `spyOn` first.');
    }
    return this.$$lastInfo;
  }

  spyOn(_headings: HTMLHeadingElement[]): ScrollSpyInfo {
    return this.$$lastInfo = {
      active: new Subject<ScrollItem | null>(),
      unspy: jasmine.createSpy('unspy'),
    };
  }
}

function createTocItem(title: string, level = 'h2', href = '', content = title) {
  return { title, href, level, content };
}

