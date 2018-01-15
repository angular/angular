import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { inject, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatProgressBar, MatSidenav } from '@angular/material';
import { By } from '@angular/platform-browser';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { DocViewerComponent } from 'app/layout/doc-viewer/doc-viewer.component';
import { Deployment } from 'app/shared/deployment.service';
import { EmbedComponentsService } from 'app/embed-components/embed-components.service';
import { GaService } from 'app/shared/ga.service';
import { LocationService } from 'app/shared/location.service';
import { Logger } from 'app/shared/logger.service';
import { MockLocationService } from 'testing/location.service';
import { MockLogger } from 'testing/logger.service';
import { MockSearchService } from 'testing/search.service';
import { NavigationNode } from 'app/navigation/navigation.service';
import { ScrollService } from 'app/shared/scroll.service';
import { SearchBoxComponent } from 'app/search/search-box/search-box.component';
import { SearchResultsComponent } from 'app/shared/search-results/search-results.component';
import { SearchService } from 'app/search/search.service';
import { SelectComponent } from 'app/shared/select/select.component';
import { TocComponent } from 'app/layout/toc/toc.component';
import { TocItem, TocService } from 'app/shared/toc.service';

const sideBySideBreakPoint = 992;
const hideToCBreakPoint = 800;

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let docViewer: HTMLElement;
  let hamburger: HTMLButtonElement;
  let locationService: MockLocationService;
  let sidenav: MatSidenav;
  let tocService: TocService;

  const initializeTest = () => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
    component.onResize(sideBySideBreakPoint + 1); // wide by default

    const de = fixture.debugElement;
    docViewer = de.query(By.css('aio-doc-viewer')).nativeElement;
    hamburger = de.query(By.css('.hamburger')).nativeElement;
    locationService = de.injector.get(LocationService) as any as MockLocationService;
    sidenav = de.query(By.directive(MatSidenav)).componentInstance;
    tocService = de.injector.get(TocService);
  };


  describe('with proper DocViewer', () => {

    beforeEach(() => {
      DocViewerComponent.animationsEnabled = false;

      createTestingModule('a/b');
      initializeTest();
    });

    afterEach(() => DocViewerComponent.animationsEnabled = true);

    it('should create', () => {
      expect(component).toBeDefined();
    });

    describe('hasFloatingToc', () => {
      it('should initially be true', () => {
        const fixture2 = TestBed.createComponent(AppComponent);
        const component2 = fixture2.componentInstance;

        expect(component2.hasFloatingToc).toBe(true);
      });

      it('should be false on narrow screens', () => {
        component.onResize(hideToCBreakPoint - 1);

        tocService.tocList.next([{}, {}, {}] as TocItem[]);
        expect(component.hasFloatingToc).toBe(false);

        tocService.tocList.next([]);
        expect(component.hasFloatingToc).toBe(false);

        tocService.tocList.next([{}, {}, {}] as TocItem[]);
        expect(component.hasFloatingToc).toBe(false);
      });

      it('should be true on wide screens unless the toc is empty', () => {
        component.onResize(hideToCBreakPoint + 1);

        tocService.tocList.next([{}, {}, {}] as TocItem[]);
        expect(component.hasFloatingToc).toBe(true);

        tocService.tocList.next([]);
        expect(component.hasFloatingToc).toBe(false);

        tocService.tocList.next([{}, {}, {}] as TocItem[]);
        expect(component.hasFloatingToc).toBe(true);
      });

      it('should be false when toc is empty', () => {
        tocService.tocList.next([]);

        component.onResize(hideToCBreakPoint + 1);
        expect(component.hasFloatingToc).toBe(false);

        component.onResize(hideToCBreakPoint - 1);
        expect(component.hasFloatingToc).toBe(false);

        component.onResize(hideToCBreakPoint + 1);
        expect(component.hasFloatingToc).toBe(false);
      });

      it('should be true when toc is not empty unless the screen is narrow', () => {
        tocService.tocList.next([{}, {}, {}] as TocItem[]);

        component.onResize(hideToCBreakPoint + 1);
        expect(component.hasFloatingToc).toBe(true);

        component.onResize(hideToCBreakPoint - 1);
        expect(component.hasFloatingToc).toBe(false);

        component.onResize(hideToCBreakPoint + 1);
        expect(component.hasFloatingToc).toBe(true);
      });
    });

    describe('isSideBySide', () => {
      it('should be updated on resize', () => {
        component.onResize(sideBySideBreakPoint - 1);
        expect(component.isSideBySide).toBe(false);

        component.onResize(sideBySideBreakPoint + 1);
        expect(component.isSideBySide).toBe(true);
      });
    });

    describe('onScroll', () => {
      it('should update `tocMaxHeight` accordingly', () => {
        expect(component.tocMaxHeight).toBeUndefined();

        component.onScroll();
        expect(component.tocMaxHeight).toBeGreaterThan(0);
      });
    });

    describe('SideNav', () => {
      const navigateTo = (path: string) => {
        locationService.go(path);
        component.updateSideNav();
        fixture.detectChanges();
      };
      const resizeTo = (width: number) => {
        component.onResize(width);
        fixture.detectChanges();
      };
      const toggleSidenav = () => {
        hamburger.click();
        fixture.detectChanges();
      };

      describe('when side-by-side (wide)', () => {
        beforeEach(() => resizeTo(sideBySideBreakPoint + 1));  // side-by-side

        it('should open when navigating to a guide page (guide/pipes)', () => {
          navigateTo('guide/pipes');
          expect(sidenav.opened).toBe(true);
        });

        it('should open when navigating to an api page', () => {
          navigateTo('api/a/b/c/d');
          expect(sidenav.opened).toBe(true);
        });

        it('should be closed when navigating to a marketing page (features)', () => {
          navigateTo('features');
          expect(sidenav.opened).toBe(false);
        });

        describe('when manually closed', () => {

          beforeEach(() => {
            navigateTo('guide/pipes');
            toggleSidenav();
          });

          it('should be closed', () => {
            expect(sidenav.opened).toBe(false);
          });

          it('should stay closed when navigating from one guide page to another', () => {
            navigateTo('guide/bags');
            expect(sidenav.opened).toBe(false);
          });

          it('should stay closed when navigating from a guide page to api page', () => {
            navigateTo('api');
            expect(sidenav.opened).toBe(false);
          });

          it('should reopen when navigating to market page and back to guide page', () => {
            navigateTo('features');
            navigateTo('guide/bags');
            expect(sidenav.opened).toBe(true);
          });
        });
      });

      describe('when NOT side-by-side (narrow)', () => {
        beforeEach(() => resizeTo(sideBySideBreakPoint - 1)); // NOT side-by-side

        it('should be closed when navigating to a guide page (guide/pipes)', () => {
          navigateTo('guide/pipes');
          expect(sidenav.opened).toBe(false);
        });

        it('should be closed when navigating to an api page', () => {
          navigateTo('api/a/b/c/d');
          expect(sidenav.opened).toBe(false);
        });

        it('should be closed when navigating to a marketing page (features)', () => {
          navigateTo('features');
          expect(sidenav.opened).toBe(false);
        });

        describe('when manually opened', () => {

          beforeEach(() => {
            navigateTo('guide/pipes');
            toggleSidenav();
          });

          it('should be open', () => {
            expect(sidenav.opened).toBe(true);
          });

          it('should close when clicking in gray content area overlay', () => {
            const sidenavBackdrop = fixture.debugElement.query(By.css('.mat-drawer-backdrop')).nativeElement;
            sidenavBackdrop.click();
            fixture.detectChanges();
            expect(sidenav.opened).toBe(false);
          });

          it('should close when navigating to another guide page', () => {
            navigateTo('guide/bags');
            expect(sidenav.opened).toBe(false);
          });

          it('should close when navigating to api page', () => {
            navigateTo('api');
            expect(sidenav.opened).toBe(false);
          });

          it('should close again when navigating to market page', () => {
            navigateTo('features');
            expect(sidenav.opened).toBe(false);
          });

        });
      });

      describe('when changing side-by-side (narrow --> wide)', () => {
        const sidenavDocs = ['api/a/b/c/d', 'guide/pipes'];
        const nonSidenavDocs = ['features', 'about'];

        sidenavDocs.forEach(doc => {
          it(`should open when on a sidenav doc (${doc})`, () => {
            resizeTo(sideBySideBreakPoint - 1);

            navigateTo(doc);
            expect(sidenav.opened).toBe(false);

            resizeTo(sideBySideBreakPoint + 1);
            expect(sidenav.opened).toBe(true);
          });
        });

        nonSidenavDocs.forEach(doc => {
          it(`should remain closed when on a non-sidenav doc (${doc})`, () => {
            resizeTo(sideBySideBreakPoint - 1);

            navigateTo(doc);
            expect(sidenav.opened).toBe(false);

            resizeTo(sideBySideBreakPoint + 1);
            expect(sidenav.opened).toBe(false);
          });
        });

        describe('when manually opened', () => {
          sidenavDocs.forEach(doc => {
            it(`should remain opened when on a sidenav doc (${doc})`, () => {
              resizeTo(sideBySideBreakPoint - 1);

              navigateTo(doc);
              toggleSidenav();
              expect(sidenav.opened).toBe(true);

              resizeTo(sideBySideBreakPoint + 1);
              expect(sidenav.opened).toBe(true);
            });
          });

          nonSidenavDocs.forEach(doc => {
            it(`should close when on a non-sidenav doc (${doc})`, () => {
              resizeTo(sideBySideBreakPoint - 1);

              navigateTo(doc);
              toggleSidenav();
              expect(sidenav.opened).toBe(true);

              resizeTo(sideBySideBreakPoint + 1);
              expect(sidenav.opened).toBe(false);
            });
          });
        });
      });

      describe('when changing side-by-side (wide --> narrow)', () => {
        const sidenavDocs = ['api/a/b/c/d', 'guide/pipes'];
        const nonSidenavDocs = ['features', 'about'];

        sidenavDocs.forEach(doc => {
          it(`should close when on a sidenav doc (${doc})`, () => {
            navigateTo(doc);
            expect(sidenav.opened).toBe(true);

            resizeTo(sideBySideBreakPoint - 1);
            expect(sidenav.opened).toBe(false);
          });
        });

        nonSidenavDocs.forEach(doc => {
          it(`should remain closed when on a non-sidenav doc (${doc})`, () => {
            navigateTo(doc);
            expect(sidenav.opened).toBe(false);

            resizeTo(sideBySideBreakPoint - 1);
            expect(sidenav.opened).toBe(false);
          });
        });
      });
    });

    describe('SideNav version selector', () => {
      let selectElement: DebugElement;
      let selectComponent: SelectComponent;

      function setupSelectorForTesting(mode?: string) {
        createTestingModule('a/b', mode);
        initializeTest();
        component.onResize(sideBySideBreakPoint + 1); // side-by-side
        selectElement = fixture.debugElement.query(By.directive(SelectComponent));
        selectComponent = selectElement.componentInstance;
      }

      it('should select the version that matches the deploy mode', () => {
        setupSelectorForTesting();
        expect(selectComponent.selected.title).toContain('stable');
        setupSelectorForTesting('next');
        expect(selectComponent.selected.title).toContain('next');
        setupSelectorForTesting('archive');
        expect(selectComponent.selected.title).toContain('v4');
      });

      it('should add the current raw version string to the selected version', () => {
        setupSelectorForTesting();
        expect(selectComponent.selected.title).toContain(`(v${component.versionInfo.raw})`);
        setupSelectorForTesting('next');
        expect(selectComponent.selected.title).toContain(`(v${component.versionInfo.raw})`);
        setupSelectorForTesting('archive');
        expect(selectComponent.selected.title).toContain(`(v${component.versionInfo.raw})`);
      });

      // Older docs versions have an href
      it('should navigate when change to a version with a url', () => {
        setupSelectorForTesting();
        const versionWithUrlIndex = component.docVersions.findIndex(v => !!v.url);
        const versionWithUrl = component.docVersions[versionWithUrlIndex];
        selectElement.triggerEventHandler('change', { option: versionWithUrl, index: versionWithUrlIndex});
        expect(locationService.go).toHaveBeenCalledWith(versionWithUrl.url);
      });

      it('should not navigate when change to a version without a url', () => {
        setupSelectorForTesting();
        const versionWithoutUrlIndex = component.docVersions.length;
        const versionWithoutUrl = component.docVersions[versionWithoutUrlIndex] = { title: 'foo' };
        selectElement.triggerEventHandler('change', { option: versionWithoutUrl, index: versionWithoutUrlIndex });
        expect(locationService.go).not.toHaveBeenCalled();
      });
    });

    describe('currentDocument', () => {
      it('should display a guide page (guide/pipes)', () => {
        locationService.go('guide/pipes');
        fixture.detectChanges();
        expect(docViewer.textContent).toMatch(/Pipes/i);
      });

      it('should display the api page', () => {
        locationService.go('api');
        fixture.detectChanges();
        expect(docViewer.textContent).toMatch(/API/i);
      });

      it('should display a marketing page', () => {
        locationService.go('features');
        fixture.detectChanges();
        expect(docViewer.textContent).toMatch(/Features/i);
      });

      it('should update the document title', () => {
        const titleService = TestBed.get(Title);
        spyOn(titleService, 'setTitle');
        locationService.go('guide/pipes');
        fixture.detectChanges();
        expect(titleService.setTitle).toHaveBeenCalledWith('Angular - Pipes');
      });

      it('should update the document title, with a default value if the document has no title', () => {
        const titleService = TestBed.get(Title);
        spyOn(titleService, 'setTitle');
        locationService.go('no-title');
        fixture.detectChanges();
        expect(titleService.setTitle).toHaveBeenCalledWith('Angular');
      });
    });

    describe('auto-scrolling', () => {
      const scrollDelay = 500;
      let scrollService: ScrollService;
      let scrollSpy: jasmine.Spy;
      let scrollToTopSpy: jasmine.Spy;

      beforeEach(() => {
        scrollService = fixture.debugElement.injector.get(ScrollService);
        scrollSpy = spyOn(scrollService, 'scroll');
        scrollToTopSpy = spyOn(scrollService, 'scrollToTop');
      });

      it('should not scroll immediately when the docId (path) changes', () => {
        locationService.go('guide/pipes');
        // deliberately not calling `fixture.detectChanges` because don't want `onDocInserted`
        expect(scrollSpy).not.toHaveBeenCalled();
        expect(scrollToTopSpy).not.toHaveBeenCalled();
      });

      it('should scroll when just the hash changes (# alone)', () => {
        locationService.go('guide/pipes');
        locationService.go('guide/pipes#somewhere');
        expect(scrollSpy).toHaveBeenCalled();
      });

      it('should scroll when just the hash changes (/#)', () => {
        locationService.go('guide/pipes');
        locationService.go('guide/pipes/#somewhere');
        expect(scrollSpy).toHaveBeenCalled();
      });

      it('should scroll again when navigating to the same hash twice in succession', () => {
        locationService.go('guide/pipes');
        locationService.go('guide/pipes#somewhere');
        locationService.go('guide/pipes#somewhere');
        expect(scrollSpy.calls.count()).toBe(2);
      });

      it('should scroll when navigating to the same path', () => {
        locationService.go('guide/pipes');
        scrollSpy.calls.reset();

        locationService.go('guide/pipes');
        expect(scrollSpy).toHaveBeenCalledTimes(1);
      });

      it('should scroll when re-nav to the empty path', () => {
        locationService.go('');
        scrollSpy.calls.reset();

        locationService.go('');
        expect(scrollSpy).toHaveBeenCalledTimes(1);
      });

      it('should scroll to top when call `onDocRemoved` directly', () => {
        scrollToTopSpy.calls.reset();

        component.onDocRemoved();
        expect(scrollToTopSpy).toHaveBeenCalled();
      });

      it('should scroll after a delay when call `onDocInserted` directly', fakeAsync(() => {
        component.onDocInserted();
        expect(scrollSpy).not.toHaveBeenCalled();

        tick(scrollDelay);
        expect(scrollSpy).toHaveBeenCalled();
      }));

      it('should scroll (via `onDocInserted`) when finish navigating to a new doc', fakeAsync(() => {
        expect(scrollToTopSpy).not.toHaveBeenCalled();

        locationService.go('guide/pipes');
        fixture.detectChanges(); // triggers the event that calls `onDocInserted`
        expect(scrollToTopSpy).toHaveBeenCalled();
        expect(scrollSpy).not.toHaveBeenCalled();

        tick(scrollDelay);
        expect(scrollSpy).toHaveBeenCalled();
      }));
    });

    describe('click intercepting', () => {
      it('should intercept clicks on anchors and call `location.handleAnchorClick()`',
              inject([LocationService], (location: LocationService) => {

        const el = fixture.nativeElement as Element;
        el.innerHTML = '<a href="some/local/url">click me</a>';
        const anchorElement = el.getElementsByTagName('a')[0];
        anchorElement.click();
        expect(location.handleAnchorClick).toHaveBeenCalledWith(anchorElement, 0, false, false);
      }));

      it('should intercept clicks on elements deep within an anchor tag',
              inject([LocationService], (location: LocationService) => {

        const el = fixture.nativeElement as Element;
        el.innerHTML = '<a href="some/local/url"><div><img></div></a>';
        const imageElement  = el.getElementsByTagName('img')[0];
        const anchorElement = el.getElementsByTagName('a')[0];
        imageElement.click();
        expect(location.handleAnchorClick).toHaveBeenCalledWith(anchorElement, 0, false, false);
      }));

      it('should ignore clicks on elements without an anchor ancestor',
              inject([LocationService], (location: LocationService) => {

        const el = fixture.nativeElement as Element;
        el.innerHTML = '<div><p><div><img></div></p></div>';
        const imageElement  = el.getElementsByTagName('img')[0];
        imageElement.click();
        expect(location.handleAnchorClick).not.toHaveBeenCalled();
      }));
    });

    describe('restrainScrolling()', () => {
      const preventedScrolling = (currentTarget: object, deltaY: number) => {
        const evt = {
          deltaY,
          currentTarget,
          defaultPrevented: false,
          preventDefault() { this.defaultPrevented = true; }
        } as any as WheelEvent;

        component.restrainScrolling(evt);

        return evt.defaultPrevented;
      };

      it('should prevent scrolling up if already at the top', () => {
        const elem = {scrollTop: 0};

        expect(preventedScrolling(elem, -100)).toBe(true);
        expect(preventedScrolling(elem, +100)).toBe(false);
        expect(preventedScrolling(elem, -10)).toBe(true);
      });

      it('should prevent scrolling down if already at the bottom', () => {
        const elem = {scrollTop: 100, scrollHeight: 150, clientHeight: 50};

        expect(preventedScrolling(elem, +10)).toBe(true);
        expect(preventedScrolling(elem, -10)).toBe(false);
        expect(preventedScrolling(elem, +5)).toBe(true);

        elem.clientHeight -= 10;
        expect(preventedScrolling(elem, +5)).toBe(false);

        elem.scrollHeight -= 20;
        expect(preventedScrolling(elem, +5)).toBe(true);

        elem.scrollTop -= 30;
        expect(preventedScrolling(elem, +5)).toBe(false);
      });

      it('should not prevent scrolling if neither at the top nor at the bottom', () => {
        const elem = {scrollTop: 50, scrollHeight: 150, clientHeight: 50};

        expect(preventedScrolling(elem, +100)).toBe(false);
        expect(preventedScrolling(elem, -100)).toBe(false);
      });
    });

    describe('aio-toc', () => {
      let tocDebugElement: DebugElement;
      let tocContainer: DebugElement|null;

      const setHasFloatingToc = (hasFloatingToc: boolean) => {
        component.hasFloatingToc = hasFloatingToc;
        fixture.detectChanges();

        tocDebugElement = fixture.debugElement.query(By.directive(TocComponent));
        tocContainer = tocDebugElement && tocDebugElement.parent;
      };

      beforeEach(() => setHasFloatingToc(true));


      it('should show/hide `<aio-toc>` based on `hasFloatingToc`', () => {
        expect(tocDebugElement).toBeTruthy();
        expect(tocContainer).toBeTruthy();

        setHasFloatingToc(false);
        expect(tocDebugElement).toBeFalsy();
        expect(tocContainer).toBeFalsy();

        setHasFloatingToc(true);
        expect(tocDebugElement).toBeTruthy();
        expect(tocContainer).toBeTruthy();
      });

      it('should have a non-embedded `<aio-toc>` element', () => {
        expect(tocDebugElement.classes['embedded']).toBeFalsy();
      });

      it('should update the TOC container\'s `maxHeight` based on `tocMaxHeight`', () => {
        expect(tocContainer!.styles['max-height']).toBeNull();

        component.tocMaxHeight = '100';
        fixture.detectChanges();

        expect(tocContainer!.styles['max-height']).toBe('100px');
      });

      it('should restrain scrolling inside the ToC container', () => {
        const restrainScrolling = spyOn(component, 'restrainScrolling');
        const evt = {};

        expect(restrainScrolling).not.toHaveBeenCalled();

        tocContainer!.triggerEventHandler('mousewheel', evt);
        expect(restrainScrolling).toHaveBeenCalledWith(evt);
      });
    });

    describe('footer', () => {
      it('should have version number', () => {
        const versionEl: HTMLElement = fixture.debugElement.query(By.css('aio-footer')).nativeElement;
        expect(versionEl.textContent).toContain(TestHttpClient.versionInfo.full);
      });
    });

    describe('deployment banner', () => {
      it('should show a message if the deployment mode is "archive"', () => {
        createTestingModule('a/b', 'archive');
        initializeTest();
        fixture.detectChanges();
        const banner: HTMLElement = fixture.debugElement.query(By.css('aio-mode-banner')).nativeElement;
        expect(banner.textContent).toContain('archived documentation for Angular v4');
      });

      it('should show no message if the deployment mode is not "archive"', () => {
        createTestingModule('a/b', 'stable');
        initializeTest();
        fixture.detectChanges();
        const banner: HTMLElement = fixture.debugElement.query(By.css('aio-mode-banner')).nativeElement;
        expect(banner.textContent!.trim()).toEqual('');
      });
    });

    describe('search', () => {
      describe('initialization', () => {
        it('should initialize the search worker', inject([SearchService], (searchService: SearchService) => {
          fixture.detectChanges(); // triggers ngOnInit
          expect(searchService.initWorker).toHaveBeenCalled();
        }));
      });

      describe('click handling', () => {
        it('should intercept clicks not on the search elements and hide the search results', () => {
          component.showSearchResults = true;
          fixture.detectChanges();
          // docViewer is a commonly-clicked, non-search element
          docViewer.click();
          expect(component.showSearchResults).toBe(false);
        });

        it('should not intercept clicks on the searchResults', () => {
          component.showSearchResults = true;
          fixture.detectChanges();

          const searchResults = fixture.debugElement.query(By.directive(SearchResultsComponent));
          searchResults.nativeElement.click();
          fixture.detectChanges();

          expect(component.showSearchResults).toBe(true);
        });

        it('should not intercept clicks om the searchBox', () => {
          component.showSearchResults = true;
          fixture.detectChanges();

          const searchBox = fixture.debugElement.query(By.directive(SearchBoxComponent));
          searchBox.nativeElement.click();
          fixture.detectChanges();

          expect(component.showSearchResults).toBe(true);
        });
      });

      describe('keyup handling', () => {
        it('should grab focus when the / key is pressed', () => {
          const searchBox: SearchBoxComponent = fixture.debugElement.query(By.directive(SearchBoxComponent)).componentInstance;
          spyOn(searchBox, 'focus');
          window.document.dispatchEvent(new KeyboardEvent('keyup', { 'key': '/' }));
          fixture.detectChanges();
          expect(searchBox.focus).toHaveBeenCalled();
        });

        it('should set focus back to the search box when the search results are displayed and the escape key is pressed', () => {
          const searchBox: SearchBoxComponent = fixture.debugElement.query(By.directive(SearchBoxComponent)).componentInstance;
          spyOn(searchBox, 'focus');
          component.showSearchResults = true;
          window.document.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'Escape' }));
          fixture.detectChanges();
          expect(searchBox.focus).toHaveBeenCalled();
        });
      });

      describe('showing search results', () => {
        it('should not display search results when query is empty', () => {
          const searchService: MockSearchService = TestBed.get(SearchService);
          searchService.searchResults.next({ query: '', results: [] });
          fixture.detectChanges();
          expect(component.showSearchResults).toBe(false);
        });

        it('should hide the results when a search result is selected', () => {
          const searchService: MockSearchService = TestBed.get(SearchService);

          const results = [
            { path: 'news', title: 'News', type: 'marketing', keywords: '', titleWords: '' }
          ];

          searchService.searchResults.next({ query: 'something', results: results });
          component.showSearchResults = true;
          fixture.detectChanges();

          const searchResultsComponent = fixture.debugElement.query(By.directive(SearchResultsComponent));
          searchResultsComponent.triggerEventHandler('resultSelected', {});
          fixture.detectChanges();
          expect(component.showSearchResults).toBe(false);
        });

        it('should re-run the search when the search box regains focus', () => {
          const doSearchSpy = spyOn(component, 'doSearch');
          const searchBox = fixture.debugElement.query(By.directive(SearchBoxComponent));
          searchBox.triggerEventHandler('onFocus', 'some query');
          expect(doSearchSpy).toHaveBeenCalledWith('some query');
        });
      });
    });

    describe('archive redirection', () => {
      it('should redirect to `docs` if deployment mode is `archive` and not at a docs page', () => {
        createTestingModule('', 'archive');
        initializeTest();
        expect(TestBed.get(LocationService).replace).toHaveBeenCalledWith('docs');

        createTestingModule('resources', 'archive');
        initializeTest();
        expect(TestBed.get(LocationService).replace).toHaveBeenCalledWith('docs');

        createTestingModule('guide/aot-compiler', 'archive');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('tutorial', 'archive');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('tutorial/toh-pt1', 'archive');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('docs', 'archive');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('api', 'archive');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('api/core/getPlatform', 'archive');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();
      });

      it('should not redirect if deployment mode is `next`', () => {
        createTestingModule('', 'next');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('resources', 'next');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('guide/aot-compiler', 'next');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('tutorial', 'next');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('tutorial/toh-pt1', 'next');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('docs', 'next');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('api', 'next');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('api/core/getPlatform', 'next');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();
      });

      it('should not redirect to `docs` if deployment mode is `stable`', () => {
        createTestingModule('', 'stable');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('resources', 'stable');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('guide/aot-compiler', 'stable');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('tutorial', 'stable');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('tutorial/toh-pt1', 'stable');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('docs', 'stable');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('api', 'stable');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();

        createTestingModule('api/core/getPlatform', 'stable');
        initializeTest();
        expect(TestBed.get(LocationService).replace).not.toHaveBeenCalled();
      });
    });
  });

  describe('with mocked DocViewer', () => {
    const getDocViewer = () => fixture.debugElement.query(By.css('aio-doc-viewer'));
    const triggerDocViewerEvent =
        (evt: 'docReady' | 'docRemoved' | 'docInserted' | 'docRendered') =>
          getDocViewer().triggerEventHandler(evt, undefined);

    beforeEach(() => {
      createTestingModule('a/b');
      // Remove the DocViewer for this test and hide the missing component message
      TestBed.overrideModule(AppModule, {
        remove: { declarations: [DocViewerComponent] },
        add: { schemas: [NO_ERRORS_SCHEMA] }
      });
    });

    describe('initial rendering', () => {
      it('should initially add the starting class until a document is rendered', () => {
        const getSidenavContainer = () => fixture.debugElement.query(By.css('mat-sidenav-container'));

        initializeTest();

        expect(component.isStarting).toBe(true);
        expect(getSidenavContainer().classes['starting']).toBe(true);

        triggerDocViewerEvent('docRendered');
        fixture.detectChanges();
        expect(component.isStarting).toBe(false);
        expect(getSidenavContainer().classes['starting']).toBe(false);
      });

      it('should initially disable animations on the DocViewer for the first rendering', () => {
        initializeTest();

        expect(component.isStarting).toBe(true);
        expect(docViewer.classList.contains('no-animations')).toBe(true);

        triggerDocViewerEvent('docRendered');
        fixture.detectChanges();
        expect(component.isStarting).toBe(false);
        expect(docViewer.classList.contains('no-animations')).toBe(false);
      });
    });

    describe('subsequent rendering', () => {
      beforeEach(jasmine.clock().install);
      afterEach(jasmine.clock().uninstall);

      it('should set the transitioning class on `.app-toolbar` while a document is being rendered', () => {
        const getToolbar = () => fixture.debugElement.query(By.css('.app-toolbar'));

        initializeTest();

        // Initially, `isTransitoning` is true.
        expect(component.isTransitioning).toBe(true);
        expect(getToolbar().classes['transitioning']).toBe(true);

        triggerDocViewerEvent('docRendered');
        fixture.detectChanges();
        expect(component.isTransitioning).toBe(false);
        expect(getToolbar().classes['transitioning']).toBe(false);

        // While a document is being rendered, `isTransitoning` is set to true.
        triggerDocViewerEvent('docReady');
        fixture.detectChanges();
        expect(component.isTransitioning).toBe(true);
        expect(getToolbar().classes['transitioning']).toBe(true);

        triggerDocViewerEvent('docRendered');
        fixture.detectChanges();
        expect(component.isTransitioning).toBe(false);
        expect(getToolbar().classes['transitioning']).toBe(false);
      });

      it('should update the sidenav state as soon as a new document is inserted', () => {
        initializeTest();
        const updateSideNavSpy = spyOn(component, 'updateSideNav');

        triggerDocViewerEvent('docInserted');
        jasmine.clock().tick(0);
        expect(updateSideNavSpy).toHaveBeenCalledTimes(1);

        triggerDocViewerEvent('docInserted');
        jasmine.clock().tick(0);
        expect(updateSideNavSpy).toHaveBeenCalledTimes(2);
      });
    });

    describe('pageId', () => {
      const navigateTo = (path: string) => {
        locationService.go(path);
        triggerDocViewerEvent('docInserted');
        jasmine.clock().tick(0);
        fixture.detectChanges();
      };

      beforeEach(jasmine.clock().install);
      afterEach(jasmine.clock().uninstall);

      it('should set the id of the doc viewer container based on the current doc', () => {
        initializeTest();
        const container = fixture.debugElement.query(By.css('section.sidenav-content'));

        navigateTo('guide/pipes');
        expect(component.pageId).toEqual('guide-pipes');
        expect(container.properties['id']).toEqual('guide-pipes');

        navigateTo('news');
        expect(component.pageId).toEqual('news');
        expect(container.properties['id']).toEqual('news');

        navigateTo('');
        expect(component.pageId).toEqual('home');
        expect(container.properties['id']).toEqual('home');
      });

      it('should not be affected by changes to the query', () => {
        initializeTest();
        const container = fixture.debugElement.query(By.css('section.sidenav-content'));

        navigateTo('guide/pipes');
        navigateTo('guide/other?search=http');

        expect(component.pageId).toEqual('guide-other');
        expect(container.properties['id']).toEqual('guide-other');
      });
    });

    describe('hostClasses', () => {
      const triggerUpdateHostClasses = () => {
        triggerDocViewerEvent('docInserted');
        jasmine.clock().tick(0);
        fixture.detectChanges();
      };
      const navigateTo = (path: string) => {
        locationService.go(path);
        triggerUpdateHostClasses();
      };

      beforeEach(jasmine.clock().install);
      afterEach(jasmine.clock().uninstall);

      it('should set the css classes of the host container based on the current doc and navigation view', () => {
        initializeTest();

        navigateTo('guide/pipes');
        checkHostClass('page', 'guide-pipes');
        checkHostClass('folder', 'guide');
        checkHostClass('view', 'SideNav');

        navigateTo('features');
        checkHostClass('page', 'features');
        checkHostClass('folder', 'features');
        checkHostClass('view', 'TopBar');

        navigateTo('');
        checkHostClass('page', 'home');
        checkHostClass('folder', 'home');
        checkHostClass('view', '');
      });

      it('should set the css class of the host container based on the open/closed state of the side nav', async () => {
        initializeTest();

        navigateTo('guide/pipes');
        checkHostClass('sidenav', 'open');

        sidenav.close();
        await waitForEmit(sidenav.onClose);
        fixture.detectChanges();
        checkHostClass('sidenav', 'closed');

        sidenav.open();
        await waitForEmit(sidenav.onOpen);
        fixture.detectChanges();
        checkHostClass('sidenav', 'open');

        function waitForEmit(emitter: Observable<void>): Promise<void> {
          return new Promise(resolve => {
            emitter.subscribe(resolve);
            fixture.detectChanges();
          });
        }
      });

      it('should set the css class of the host container based on the initial deployment mode', () => {
        createTestingModule('a/b', 'archive');
        initializeTest();

        triggerUpdateHostClasses();
        checkHostClass('mode', 'archive');
      });

      function checkHostClass(type: string, value: string) {
        const host = fixture.debugElement;
        const classes: string = host.properties['className'];
        const classArray = classes.split(' ').filter(c => c.indexOf(`${type}-`) === 0);
        expect(classArray.length).toBeLessThanOrEqual(1, `"${classes}" should have only one class matching ${type}-*`);
        expect(classArray).toEqual([`${type}-${value}`], `"${classes}" should contain ${type}-${value}`);
      }
    });

    describe('progress bar', () => {
      const SHOW_DELAY = 200;
      const HIDE_DELAY = 500;
      const getProgressBar = () => fixture.debugElement.query(By.directive(MatProgressBar));
      const initializeAndCompleteNavigation = () => {
        initializeTest();
        triggerDocViewerEvent('docReady');
        tick(HIDE_DELAY);
      };

      it('should initially be hidden', () => {
        initializeTest();
        expect(getProgressBar()).toBeFalsy();
      });

      it('should be shown (after a delay) when the path changes', fakeAsync(() => {
        initializeAndCompleteNavigation();
        locationService.urlSubject.next('c/d');

        fixture.detectChanges();
        expect(getProgressBar()).toBeFalsy();

        tick(SHOW_DELAY - 1);
        fixture.detectChanges();
        expect(getProgressBar()).toBeFalsy();

        tick(1);
        fixture.detectChanges();
        expect(getProgressBar()).toBeTruthy();
      }));

      it('should not be shown when the URL changes but the path remains the same', fakeAsync(() => {
        initializeAndCompleteNavigation();
        locationService.urlSubject.next('a/b');

        tick(SHOW_DELAY);
        fixture.detectChanges();
        expect(getProgressBar()).toBeFalsy();
      }));

      it('should not be shown when re-navigating to the empty path', fakeAsync(() => {
        initializeAndCompleteNavigation();
        locationService.urlSubject.next('');
        triggerDocViewerEvent('docReady');

        locationService.urlSubject.next('');

        tick(SHOW_DELAY);
        fixture.detectChanges();
        expect(getProgressBar()).toBeFalsy();

        tick(HIDE_DELAY);   // Fire the remaining timer or `fakeAsync()` complains.
      }));

      it('should not be shown if the doc is prepared quickly', fakeAsync(() => {
        initializeAndCompleteNavigation();
        locationService.urlSubject.next('c/d');

        tick(SHOW_DELAY - 1);
        triggerDocViewerEvent('docReady');

        tick(1);
        fixture.detectChanges();
        expect(getProgressBar()).toBeFalsy();

        tick(HIDE_DELAY);   // Fire the remaining timer or `fakeAsync()` complains.
      }));

      it('should be shown if preparing the doc takes too long', fakeAsync(() => {
        initializeAndCompleteNavigation();
        locationService.urlSubject.next('c/d');

        tick(SHOW_DELAY);
        triggerDocViewerEvent('docReady');

        fixture.detectChanges();
        expect(getProgressBar()).toBeTruthy();

        tick(HIDE_DELAY);   // Fire the remaining timer or `fakeAsync()` complains.
      }));

      it('should be hidden (after a delay) once the doc has been prepared', fakeAsync(() => {
        initializeAndCompleteNavigation();
        locationService.urlSubject.next('c/d');

        tick(SHOW_DELAY);
        triggerDocViewerEvent('docReady');

        fixture.detectChanges();
        expect(getProgressBar()).toBeTruthy();

        tick(HIDE_DELAY - 1);
        fixture.detectChanges();
        expect(getProgressBar()).toBeTruthy();

        tick(1);
        fixture.detectChanges();
        expect(getProgressBar()).toBeFalsy();
      }));

      it('should only take the latest request into account', fakeAsync(() => {
        initializeAndCompleteNavigation();
        locationService.urlSubject.next('c/d');   // The URL changes.
        locationService.urlSubject.next('e/f');   // The URL changes again before `onDocReady()`.

        tick(SHOW_DELAY - 1);               // `onDocReady()` is triggered (for the last doc),
        triggerDocViewerEvent('docReady');  // before the progress bar is shown.

        tick(1);
        fixture.detectChanges();
        expect(getProgressBar()).toBeFalsy();

        tick(HIDE_DELAY);   // Fire the remaining timer or `fakeAsync()` complains.
      }));
    });

  });

});

//// test helpers ////

function createTestingModule(initialUrl: string, mode: string = 'stable') {
  const mockLocationService = new MockLocationService(initialUrl);
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [ AppModule ],
    providers: [
      { provide: APP_BASE_HREF, useValue: '/' },
      { provide: EmbedComponentsService, useClass: TestEmbedComponentsService },
      { provide: GaService, useClass: TestGaService },
      { provide: HttpClient, useClass: TestHttpClient },
      { provide: LocationService, useFactory: () => mockLocationService },
      { provide: Logger, useClass: MockLogger },
      { provide: SearchService, useClass: MockSearchService },
      { provide: Deployment, useFactory: () => {
        const deployment = new Deployment(mockLocationService as any);
        deployment.mode = mode;
        return deployment;
      }},
    ]
  });
}

class TestEmbedComponentsService {
  embedInto = jasmine.createSpy('embedInto').and.returnValue(of([]));
}

class TestGaService {
  locationChanged = jasmine.createSpy('locationChanged');
}

class TestHttpClient {

  static versionInfo = {
    raw: '4.0.0-rc.6',
    major: 4,
    minor: 0,
    patch: 0,
    prerelease: [ 'local' ],
    build: 'sha.73808dd',
    version: '4.0.0-local',
    codeName: 'snapshot',
    isSnapshot: true,
    full: '4.0.0-local+sha.73808dd',
    branch: 'master',
    commitSHA: '73808dd38b5ccd729404936834d1568bd066de81'
  };

  static docVersions: NavigationNode[] = [
    { title: 'v2', url: 'https://v2.angular.io' }
  ];

  // tslint:disable:quotemark
  navJson = {
    "TopBar": [
      {
        "url": "features",
        "title": "Features"
      },
      {
        "url": "no-title",
        "title": "No Title"
      },
    ],
    "SideNav": [
      {
      "title": "Core",
      "tooltip": "Learn the core capabilities of Angular",
      "children": [
          {
            "url": "guide/pipes",
            "title": "Pipes",
            "tooltip": "Pipes transform displayed values within a template."
          },
          {
            "url": "guide/bags",
            "title": "Bags",
            "tooltip": "Pack your bags for a code adventure."
          }
        ]
      },
      {
        "url": "api",
        "title": "API",
        "tooltip": "Details of the Angular classes and values."
      }
    ],
    "docVersions": TestHttpClient.docVersions,

    "__versionInfo": TestHttpClient.versionInfo,
  };

  get(url: string) {
    let data;
    if (/navigation\.json/.test(url)) {
      data = this.navJson;
    } else {
      const match = /generated\/docs\/(.+)\.json/.exec(url)!;
      const id = match[1]!;
      // Make up a title for test purposes
      const title = id.split('/').pop()!.replace(/^([a-z])/, (_, letter) => letter.toUpperCase());
      const h1 = (id === 'no-title') ? '' : `<h1>${title}</h1>`;
      const contents = `${h1}<h2 id="#somewhere">Some heading</h2>`;
      data = { id, contents };
    }
    return of(data);
  }
}
