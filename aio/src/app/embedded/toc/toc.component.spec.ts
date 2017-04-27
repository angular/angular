import { Component, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By, DOCUMENT } from '@angular/platform-browser';

import { TocComponent } from './toc.component';
import { TocItem, TocService } from 'app/shared/toc.service';

describe('TocComponent', () => {
  let tocComponentDe: DebugElement;
  let tocComponent: TocComponent;
  let tocService: TestTocService;

  let page: {
    listItems: DebugElement[];
    tocHeading: DebugElement;
    tocHeadingButton: DebugElement;
    tocMoreButton: DebugElement;
  };

  function setPage(): typeof page {
    return {
      listItems: tocComponentDe.queryAll(By.css('ul.toc-list>li')),
      tocHeading: tocComponentDe.query(By.css('.toc-heading')),
      tocHeadingButton: tocComponentDe.query(By.css('.toc-heading button')),
      tocMoreButton: tocComponentDe.query(By.css('button.toc-more-items')),
    };
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HostEmbeddedTocComponent, HostNotEmbeddedTocComponent, TocComponent ],
      providers: [
        { provide: TocService, useClass: TestTocService }
      ]
    })
    .compileComponents();
  }));

  describe('when embedded in doc body', () => {
    let fixture: ComponentFixture<HostEmbeddedTocComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(HostEmbeddedTocComponent);
      tocComponentDe = fixture.debugElement.children[0];
      tocComponent = tocComponentDe.componentInstance;
      tocService = TestBed.get(TocService);
    });

    it('should create tocComponent', () => {
      expect(tocComponent).toBeTruthy();
    });

    it('should be in embedded state', () => {
      expect(tocComponent.isEmbedded).toEqual(true);
    });

    it('should not display anything when no TocItems', () => {
      tocService.tocList = [];
      fixture.detectChanges();
      expect(tocComponentDe.children.length).toEqual(0);
    });

    describe('when four TocItems', () => {

      beforeEach(() => {
        tocService.tocList.length = 4;
        fixture.detectChanges();
        page = setPage();
      });

      it('should have four displayed items', () => {
        expect(page.listItems.length).toEqual(4);
      });

      it('should not have secondary items', () => {
        expect(tocComponent.hasSecondary).toEqual(false, 'hasSecondary flag');
        const aSecond = page.listItems.find(item => item.classes.secondary);
        expect(aSecond).toBeFalsy('should not find a secondary');
      });

      it('should not display expando buttons', () => {
        expect(page.tocHeadingButton).toBeFalsy('top expand/collapse button');
        expect(page.tocMoreButton).toBeFalsy('bottom more button');
      });
    });

    describe('when many TocItems', () => {

      beforeEach(() => {
        fixture.detectChanges();
        page = setPage();
      });

      it('should have more than 4 displayed items', () => {
        expect(page.listItems.length).toBeGreaterThan(4);
        expect(page.listItems.length).toEqual(tocService.tocList.length);
      });

      it('should be in "closed" (not expanded) state at the start', () => {
        expect(tocComponent.isClosed).toBeTruthy();
      });

      it('should have "closed" class at the start', () => {
        expect(tocComponentDe.children[0].classes.closed).toEqual(true);
      });

      it('should display expando buttons', () => {
        expect(page.tocHeadingButton).toBeTruthy('top expand/collapse button');
        expect(page.tocMoreButton).toBeTruthy('bottom more button');
      });

      it('should have secondary items', () => {
        expect(tocComponent.hasSecondary).toEqual(true, 'hasSecondary flag');
      });

      // CSS should hide items with the secondary class when closed
      it('should have secondary item with a secondary class', () => {
        const aSecondary = page.listItems.find(item => item.classes.secondary);
        expect(aSecondary).toBeTruthy('should find a secondary');
        expect(aSecondary.classes.secondary).toEqual(true, 'has secondary class');
      });

      describe('after click expando button', () => {

        beforeEach(() => {
          page.tocHeadingButton.nativeElement.click();
          fixture.detectChanges();
        });

        it('should not be "closed"', () => {
          expect(tocComponent.isClosed).toEqual(false);
        });

        it('should not have "closed" class', () => {
          expect(tocComponentDe.children[0].classes.closed).toBeFalsy();
        });
      });
    });
  });

  describe('when in side panel (not embedded))', () => {
    let fixture: ComponentFixture<HostNotEmbeddedTocComponent>;

    beforeEach(() => {
      fixture = TestBed.createComponent(HostNotEmbeddedTocComponent);
      tocComponentDe = fixture.debugElement.children[0];
      tocComponent = tocComponentDe.componentInstance;
      fixture.detectChanges();
      page = setPage();
    });

    it('should not be in embedded state', () => {
      expect(tocComponent.isEmbedded).toEqual(false);
    });

    it('should display all items', () => {
      expect(page.listItems.length).toEqual(tocService.tocList.length);
    });

    it('should not have secondary items', () => {
      expect(tocComponent.hasSecondary).toEqual(false, 'hasSecondary flag');
      const aSecond = page.listItems.find(item => item.classes.secondary);
      expect(aSecond).toBeFalsy('should not find a secondary');
    });

    it('should not display expando buttons', () => {
      expect(page.tocHeadingButton).toBeFalsy('top expand/collapse button');
      expect(page.tocMoreButton).toBeFalsy('bottom more button');
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

class TestTocService {
  tocList: TocItem[] = getTestTocList();
}

// tslint:disable:quotemark

function getTestTocList() {
  return [
    {
      "content": "Heading one",
      "href": "fizz/buzz#heading-one-special-id",
      "level": "h2",
      "title": "Heading one"
    },
    {
      "content": "H2 Two",
      "href": "fizz/buzz#h2-two",
      "level": "h2",
      "title": "H2 Two"
    },
    {
      "content": "H2 <b>Three</b>",
      "href": "fizz/buzz#h2-three",
      "level": "h2",
      "title": "H2 Three"
    },
    {
      "content": "H3 3a",
      "href": "fizz/buzz#h3-3a",
      "level": "h3",
      "title": "H3 3a"
    },
    {
      "content": "H3 3b",
      "href": "fizz/buzz#h3-3b",
      "level": "h3",
      "title": "H3 3b"
    },
    {
      "content": "<i>H2 <b>four</b></i>",
      "href": "fizz/buzz#h2-four",
      "level": "h2",
      "title": "H2 4"
    }
  ];
}
