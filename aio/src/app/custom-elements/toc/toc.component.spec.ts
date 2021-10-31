import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { asapScheduler, BehaviorSubject } from 'rxjs';

import { ScrollService } from 'app/shared/scroll.service';
import { TocItem, TocService } from 'app/shared/toc.service';
import { TocComponent } from './toc.component';

describe('TocComponent', () => {
  let tocComponentDe: DebugElement;
  let tocComponent: TocComponent;
  let tocService: TestTocService;

  let page: {
    listItems: DebugElement[];
    tocHeading: DebugElement;
    tocHeadingButtonEmbedded: DebugElement;
    tocH1Heading: DebugElement;
    tocMoreButton: DebugElement;
  };

  function setPage(): typeof page {
    return {
      listItems: tocComponentDe.queryAll(By.css('ul.toc-list>li')),
      tocHeading: tocComponentDe.query(By.css('.toc-heading')),
      tocHeadingButtonEmbedded: tocComponentDe.query(By.css('button.toc-heading.embedded')),
      tocH1Heading: tocComponentDe.query(By.css('.h1')),
      tocMoreButton: tocComponentDe.query(By.css('button.toc-more-items')),
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ HostEmbeddedTocComponent, HostNotEmbeddedTocComponent, TocComponent ],
      providers: [
        { provide: ScrollService, useClass: TestScrollService },
        { provide: TocService, useClass: TestTocService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
  });

  describe('when embedded in doc body', () => {
    let fixture: ComponentFixture<HostEmbeddedTocComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(HostEmbeddedTocComponent);
      tocComponentDe = fixture.debugElement.children[0];
      tocComponent = tocComponentDe.componentInstance;
      tocService = TestBed.inject(TocService)  as unknown as TestTocService;
    });

    it('should create tocComponent', () => {
      expect(tocComponent).toBeTruthy();
    });

    it('should be in embedded state', () => {
      expect(tocComponent.isEmbedded).toEqual(true);
    });

    it('should not display a ToC initially', () => {
      expect(tocComponent.type).toEqual('None');
    });

    describe('(once the lifecycle hooks have run)', () => {
      beforeEach(() => fixture.detectChanges());

      it('should not display anything when no h2 or h3 TocItems', () => {
        tocService.tocList.next([tocItem('H1', 'h1')]);
        fixture.detectChanges();
        expect(tocComponentDe.children.length).toEqual(0);
      });

      it('should update when the TocItems are updated', () => {
        tocService.tocList.next([tocItem('Heading A')]);
        fixture.detectChanges();
        expect(tocComponentDe.queryAll(By.css('li')).length).toBe(1);

        tocService.tocList.next([tocItem('Heading A'), tocItem('Heading B'), tocItem('Heading C')]);
        fixture.detectChanges();
        expect(tocComponentDe.queryAll(By.css('li')).length).toBe(3);
      });

      it('should only display H2 and H3 TocItems', () => {
        tocService.tocList.next([tocItem('Heading A', 'h1'), tocItem('Heading B'), tocItem('Heading C', 'h3')]);
        fixture.detectChanges();

        const tocItems = tocComponentDe.queryAll(By.css('li'));
        const textContents = tocItems.map(item => item.nativeNode.textContent.trim());

        expect(tocItems.length).toBe(2);
        expect(textContents.find(text => text === 'Heading A')).toBeFalsy();
        expect(textContents.find(text => text === 'Heading B')).toBeTruthy();
        expect(textContents.find(text => text === 'Heading C')).toBeTruthy();
        expect(setPage().tocH1Heading).toBeFalsy();
      });

      it('should stop listening for TocItems once destroyed', () => {
        tocService.tocList.next([tocItem('Heading A')]);
        fixture.detectChanges();
        expect(tocComponentDe.queryAll(By.css('li')).length).toBe(1);

        tocComponent.ngOnDestroy();
        tocService.tocList.next([tocItem('Heading A', 'h1'), tocItem('Heading B'), tocItem('Heading C')]);
        fixture.detectChanges();
        expect(tocComponentDe.queryAll(By.css('li')).length).toBe(1);
      });

      describe('when fewer than `maxPrimary` TocItems', () => {

        beforeEach(() => {
          tocService.tocList.next(
            [ tocItem('Heading A'), tocItem('Heading B'), tocItem('Heading C'), tocItem('Heading D') ]
          );
          fixture.detectChanges();
          page = setPage();
        });

        it('should have four displayed items', () => {
          expect(page.listItems.length).toEqual(4);
        });

        it('should not have secondary items', () => {
          expect(tocComponent.type).toEqual('EmbeddedSimple');
          const aSecond = page.listItems.find(item => item.classes.secondary);
          expect(aSecond).withContext('should not find a secondary').toBeFalsy();
        });

        it('should not display expando buttons', () => {
          expect(page.tocHeadingButtonEmbedded).withContext('top expand/collapse button').toBeFalsy();
          expect(page.tocMoreButton).withContext('bottom more button').toBeFalsy();
        });
      });

      describe('when many TocItems', () => {
        let scrollToTopSpy: jasmine.Spy;

        beforeEach(() => {
          fixture.detectChanges();
          page = setPage();
          scrollToTopSpy = (TestBed.inject(ScrollService) as unknown as TestScrollService).scrollToTop;
        });

        it('should have more than 4 displayed items', () => {
          expect(page.listItems.length).toBeGreaterThan(4);
        });

        it('should not display the h1 item', () => {
          expect(page.listItems.find(item => item.classes.h1)).withContext('should not find h1 item').toBeFalsy();
        });

        it('should be in "collapsed" (not expanded) state at the start', () => {
          expect(tocComponent.isCollapsed).toBeTruthy();
        });

        it('should have "collapsed" class at the start', () => {
          expect(tocComponentDe.children[0].classes.collapsed).toEqual(true);
        });

        it('should display expando buttons', () => {
          expect(page.tocHeadingButtonEmbedded).withContext('top expand/collapse button').toBeTruthy();
          expect(page.tocMoreButton).withContext('bottom more button').toBeTruthy();
        });

        it('should have secondary items', () => {
          expect(tocComponent.type).toEqual('EmbeddedExpandable');
        });

        // CSS will hide items with the secondary class when collapsed
        it('should have secondary item with a secondary class', () => {
          const aSecondary = page.listItems.find(item => item.classes.secondary);
          expect(aSecondary).withContext('should find a secondary').toBeTruthy();
        });

        describe('after click tocHeading button', () => {

          beforeEach(() => {
            page.tocHeadingButtonEmbedded.nativeElement.click();
            fixture.detectChanges();
          });

          it('should not be "collapsed"', () => {
            expect(tocComponent.isCollapsed).toEqual(false);
          });

          it('should not have "collapsed" class', () => {
            expect(tocComponentDe.children[0].classes.collapsed).toBeFalsy();
          });

          it('should not scroll', () => {
            expect(scrollToTopSpy).not.toHaveBeenCalled();
          });

          it('should be "collapsed" after clicking again', () => {
            page.tocHeadingButtonEmbedded.nativeElement.click();
            fixture.detectChanges();
            expect(tocComponent.isCollapsed).toEqual(true);
          });

          it('should not scroll after clicking again', () => {
            page.tocHeadingButtonEmbedded.nativeElement.click();
            fixture.detectChanges();
            expect(scrollToTopSpy).not.toHaveBeenCalled();
          });
        });

        describe('after click tocMore button', () => {

          beforeEach(() => {
            page.tocMoreButton.nativeElement.click();
            fixture.detectChanges();
          });

          it('should not be "collapsed"', () => {
            expect(tocComponent.isCollapsed).toEqual(false);
          });

          it('should not have "collapsed" class', () => {
            expect(tocComponentDe.children[0].classes.collapsed).toBeFalsy();
          });

          it('should not scroll', () => {
            expect(scrollToTopSpy).not.toHaveBeenCalled();
          });

          it('should be "collapsed" after clicking again', () => {
            page.tocMoreButton.nativeElement.click();
            fixture.detectChanges();
            expect(tocComponent.isCollapsed).toEqual(true);
          });

          it('should be "collapsed" after clicking tocHeadingButton', () => {
            page.tocMoreButton.nativeElement.click();
            fixture.detectChanges();
            expect(tocComponent.isCollapsed).toEqual(true);
          });

          it('should scroll after clicking again', () => {
            page.tocMoreButton.nativeElement.click();
            fixture.detectChanges();
            expect(scrollToTopSpy).toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe('when in side panel (not embedded)', () => {
    let fixture: ComponentFixture<HostNotEmbeddedTocComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(HostNotEmbeddedTocComponent);

      tocComponentDe = fixture.debugElement.children[0];
      tocComponent = tocComponentDe.componentInstance;
      tocService = TestBed.inject(TocService)  as unknown as TestTocService;

      fixture.detectChanges();
      page = setPage();
    });

    it('should not be in embedded state', () => {
      expect(tocComponent.isEmbedded).toEqual(false);
      expect(tocComponent.type).toEqual('Floating');
    });

    it('should display all items (including h1s)', () => {
      expect(page.listItems.length).toEqual(getTestTocList().length);
    });

    it('should not have secondary items', () => {
      expect(tocComponent.type).toEqual('Floating');
      const aSecond = page.listItems.find(item => item.classes.secondary);
      expect(aSecond).withContext('should not find a secondary').toBeFalsy();
    });

    it('should not display expando buttons', () => {
      expect(page.tocHeadingButtonEmbedded).withContext('top expand/collapse button').toBeFalsy();
      expect(page.tocMoreButton).withContext('bottom more button').toBeFalsy();
    });

    it('should display H1 title', () => {
      expect(page.tocH1Heading).toBeTruthy();
    });

    describe('#activeIndex', () => {
      it('should keep track of `TocService`\'s `activeItemIndex`', () => {
        expect(tocComponent.activeIndex).toBeNull();

        tocService.setActiveIndex(42);
        expect(tocComponent.activeIndex).toBe(42);

        tocService.setActiveIndex(null);
        expect(tocComponent.activeIndex).toBeNull();
      });

      it('should stop tracking `activeItemIndex` once destroyed', () => {
        tocService.setActiveIndex(42);
        expect(tocComponent.activeIndex).toBe(42);

        tocComponent.ngOnDestroy();

        tocService.setActiveIndex(43);
        expect(tocComponent.activeIndex).toBe(42);

        tocService.setActiveIndex(null);
        expect(tocComponent.activeIndex).toBe(42);
      });

      it('should set the `active` class to the active anchor (and only that)', () => {
        expect(page.listItems.findIndex(By.css('.active'))).toBe(-1);

        tocComponent.activeIndex = 1;
        fixture.detectChanges();
        expect(page.listItems.filter(By.css('.active')).length).toBe(1);
        expect(page.listItems.findIndex(By.css('.active'))).toBe(1);

        tocComponent.activeIndex = null;
        fixture.detectChanges();
        expect(page.listItems.filter(By.css('.active')).length).toBe(0);
        expect(page.listItems.findIndex(By.css('.active'))).toBe(-1);

        tocComponent.activeIndex = 0;
        fixture.detectChanges();
        expect(page.listItems.filter(By.css('.active')).length).toBe(1);
        expect(page.listItems.findIndex(By.css('.active'))).toBe(0);

        tocComponent.activeIndex = 1337;
        fixture.detectChanges();
        expect(page.listItems.filter(By.css('.active')).length).toBe(0);
        expect(page.listItems.findIndex(By.css('.active'))).toBe(-1);

        tocComponent.activeIndex = page.listItems.length - 1;
        fixture.detectChanges();
        expect(page.listItems.filter(By.css('.active')).length).toBe(1);
        expect(page.listItems.findIndex(By.css('.active'))).toBe(page.listItems.length - 1);
      });

      it('should re-apply the `active` class when the list elements change', () => {
        const getActiveTextContent = () =>
            page.listItems.find(By.css('.active'))?.nativeElement.textContent.trim();

        tocComponent.activeIndex = 1;
        fixture.detectChanges();
        expect(getActiveTextContent()).toBe('Heading one');

        tocComponent.tocList = [tocItem('New 1'), tocItem('New 2')];
        fixture.detectChanges();
        page = setPage();
        expect(getActiveTextContent()).toBe('New 2');

        tocComponent.tocList.unshift(tocItem('New 0'));
        fixture.detectChanges();
        page = setPage();
        expect(getActiveTextContent()).toBe('New 1');

        tocComponent.tocList = [tocItem('Very New 1')];
        fixture.detectChanges();
        page = setPage();
        expect(page.listItems.findIndex(By.css('.active'))).toBe(-1);

        tocComponent.activeIndex = 0;
        fixture.detectChanges();
        expect(getActiveTextContent()).toBe('Very New 1');
      });

      describe('should scroll the active ToC item into viewport (if not already visible)', () => {
        let parentScrollTop: number;

        beforeEach(() => {
          const hostElem = fixture.nativeElement;
          const firstItem = page.listItems[0].nativeElement;

          Object.assign(hostElem.style, {
            display: 'block',
            maxHeight: `${hostElem.clientHeight - firstItem.clientHeight}px`,
            overflow: 'auto',
            position: 'relative',
          });
          Object.defineProperty(hostElem, 'scrollTop', {
            get: () => parentScrollTop,
            set: v => parentScrollTop = v,
          });

          parentScrollTop = 0;
        });

        it('when the `activeIndex` changes', () => {
          tocService.setActiveIndex(0);
          fixture.detectChanges();

          expect(parentScrollTop).toBe(0);

          tocService.setActiveIndex(1);
          fixture.detectChanges();

          expect(parentScrollTop).toBe(0);

          tocService.setActiveIndex(page.listItems.length - 1);
          fixture.detectChanges();

          expect(parentScrollTop).toBeGreaterThan(0);
        });

        it('when the `tocList` changes', () => {
          const tocList = tocComponent.tocList;

          tocComponent.tocList = [];
          fixture.detectChanges();

          expect(parentScrollTop).toBe(0);

          tocService.setActiveIndex(tocList.length - 1);
          fixture.detectChanges();

          expect(parentScrollTop).toBe(0);

          tocComponent.tocList = tocList;
          fixture.detectChanges();

          expect(parentScrollTop).toBeGreaterThan(0);
        });

        it('not after it has been destroyed', () => {
          const tocList = tocComponent.tocList;
          tocComponent.ngOnDestroy();

          tocService.setActiveIndex(page.listItems.length - 1);
          fixture.detectChanges();

          expect(parentScrollTop).toBe(0);

          tocComponent.tocList = [];
          fixture.detectChanges();

          expect(parentScrollTop).toBe(0);

          tocComponent.tocList = tocList;
          fixture.detectChanges();

          expect(parentScrollTop).toBe(0);
        });
      });
    });
  });

});

//// helpers ////
@Component({
  selector: 'aio-embedded-host',
  template: '<aio-toc class="embedded"></aio-toc>'
})
class HostEmbeddedTocComponent {}

@Component({
  selector: 'aio-not-embedded-host',
  template: '<aio-toc></aio-toc>'
})
class HostNotEmbeddedTocComponent {}

class TestScrollService {
  scrollToTop = jasmine.createSpy('scrollToTop');
}

class TestTocService {
  tocList = new BehaviorSubject<TocItem[]>(getTestTocList());
  activeItemIndex = new BehaviorSubject<number | null>(null);

  setActiveIndex(index: number|null) {
    this.activeItemIndex.next(index);
    if (asapScheduler.actions.length > 0) {
      asapScheduler.flush();
    }
  }
}

function tocItem(title: string, level = 'h2', href = '', content = title) {
  return { title, href, level, content };
}

function getTestTocList() {
  return [
    tocItem('Title',       'h1', 'fizz/buzz#title',                  'Title'),
    tocItem('Heading one', 'h2', 'fizz/buzz#heading-one-special-id', 'Heading one'),
    tocItem('H2 Two',      'h2', 'fizz/buzz#h2-two',                 'H2 Two'),
    tocItem('H2 Three',    'h2', 'fizz/buzz#h2-three',               'H2 <b>Three</b>'),
    tocItem('H3 3a',       'h3', 'fizz/buzz#h3-3a',                  'H3 3a'),
    tocItem('H3 3b',       'h3', 'fizz/buzz#h3-3b',                  'H3 3b'),
    tocItem('H2 4',        'h2', 'fizz/buzz#h2-four',                '<i>H2 <b>four</b></i>'),
  ];
}
