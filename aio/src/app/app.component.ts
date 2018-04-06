import { Component, ElementRef, HostBinding, HostListener, OnInit,
         QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

import { CurrentNodes, NavigationService, NavigationNode, VersionInfo } from 'app/navigation/navigation.service';
import { DocumentService, DocumentContents } from 'app/documents/document.service';
import { Deployment } from 'app/shared/deployment.service';
import { LocationService } from 'app/shared/location.service';
import { NotificationComponent } from 'app/layout/notification/notification.component';
import { ScrollService } from 'app/shared/scroll.service';
import { SearchBoxComponent } from 'app/search/search-box/search-box.component';
import { SearchResults } from 'app/search/interfaces';
import { SearchService } from 'app/search/search.service';
import { TocService } from 'app/shared/toc.service';

import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

const sideNavView = 'SideNav';

@Component({
  selector: 'aio-shell',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

  currentDocument: DocumentContents;
  currentDocVersion: NavigationNode;
  currentNodes: CurrentNodes = {};
  currentPath: string;
  docVersions: NavigationNode[];
  dtOn = false;
  footerNodes: NavigationNode[];

  /**
   * An HTML friendly identifier for the currently displayed page.
   * This is computed from the `currentDocument.id` by replacing `/` with `-`
   */
  pageId: string;
  /**
   * An HTML friendly identifer for the "folder" of the currently displayed page.
   * This is computed by taking everything up to the first `/` in the `currentDocument.id`
   */
  folderId: string;
  /**
   * These CSS classes are computed from the current state of the application
   * (e.g. what document is being viewed) to allow for fine grain control over
   * the styling of individual pages.
   * You will get three classes:
   *
   * * `page-...`: computed from the current document id (e.g. events, guide-security, tutorial-toh-pt2)
   * * `folder-...`: computed from the top level folder for an id (e.g. guide, tutorial, etc)
   * * `view-...`: computef from the navigation view (e.g. SideNav, TopBar, etc)
   */
  @HostBinding('class')
  hostClasses = '';

  // Disable all Angular animations for the initial render.
  @HostBinding('@.disabled')
  isStarting = true;
  isTransitioning = true;
  isFetching = false;
  isSideBySide = false;
  private isFetchingTimeout: any;
  private isSideNavDoc = false;

  private sideBySideWidth = 992;
  sideNavNodes: NavigationNode[];
  topMenuNodes: NavigationNode[];
  topMenuNarrowNodes: NavigationNode[];

  hasFloatingToc = true;
  private showFloatingToc = new BehaviorSubject(false);
  private showFloatingTocWidth = 800;
  tocMaxHeight: string;
  private tocMaxHeightOffset = 0;

  versionInfo: VersionInfo;

  get isOpened() { return this.isSideBySide && this.isSideNavDoc; }
  get mode() { return this.isSideBySide ? 'side' : 'over'; }

  // Search related properties
  showSearchResults = false;
  searchResults: Observable<SearchResults>;
  @ViewChildren('searchBox, searchResultsView', { read: ElementRef })
  searchElements: QueryList<ElementRef>;
  @ViewChild(SearchBoxComponent)
  searchBox: SearchBoxComponent;

  @ViewChild(MatSidenav)
  sidenav: MatSidenav;

  @ViewChild(NotificationComponent)
  notification: NotificationComponent;
  notificationAnimating = false;

  constructor(
    public deployment: Deployment,
    private documentService: DocumentService,
    private hostElement: ElementRef,
    private locationService: LocationService,
    private navigationService: NavigationService,
    private scrollService: ScrollService,
    private searchService: SearchService,
    private tocService: TocService
  ) { }

  ngOnInit() {
    // Do not initialize the search on browsers that lack web worker support
    if ('Worker' in window) {
      // Delay initialization by up to 2 seconds
      this.searchService.initWorker('app/search/search-worker.js', 2000);
    }

    this.onResize(window.innerWidth);

    /* No need to unsubscribe because this root component never dies */

    this.documentService.currentDocument.subscribe(doc => this.currentDocument = doc);

    this.locationService.currentPath.subscribe(path => {
      // Redirect to docs if we are in archive mode and are not hitting a docs page
      // (i.e. we have arrived at a marketing page)
      if (this.deployment.mode === 'archive' && !/^(docs$|api|guide|tutorial)/.test(path)) {
        this.locationService.replace('docs');
      }
      if (path === this.currentPath) {
        // scroll only if on same page (most likely a change to the hash)
        this.autoScroll();
      } else {
        // don't scroll; leave that to `onDocRendered`
        this.currentPath = path;

        // Start progress bar if doc not rendered within brief time
        clearTimeout(this.isFetchingTimeout);
        this.isFetchingTimeout = setTimeout(() => this.isFetching = true, 200);
      }
    });

    this.navigationService.currentNodes.subscribe(currentNodes => this.currentNodes = currentNodes);

    // Compute the version picker list from the current version and the versions in the navigation map
    combineLatest(
      this.navigationService.versionInfo,
      this.navigationService.navigationViews.pipe(map(views => views['docVersions'])))
      .subscribe(([versionInfo, versions]) => {
        // TODO(pbd): consider whether we can lookup the stable and next versions from the internet
        const computedVersions: NavigationNode[] = [
          { title: 'next', url: 'https://next.angular.io' },
          { title: 'stable', url: 'https://angular.io' },
        ];
        if (this.deployment.mode === 'archive') {
          computedVersions.push({ title: `v${versionInfo.major}` });
        }
        this.docVersions = [...computedVersions, ...versions];

        // Find the current version - eithers title matches the current deployment mode
        // or its title matches the major version of the current version info
        this.currentDocVersion = this.docVersions.find(version =>
          version.title === this.deployment.mode || version.title === `v${versionInfo.major}`)!;
        this.currentDocVersion.title += ` (v${versionInfo.raw})`;
      });

    this.navigationService.navigationViews.subscribe(views => {
      this.footerNodes  = views['Footer']  || [];
      this.sideNavNodes = views['SideNav'] || [];
      this.topMenuNodes = views['TopBar']  || [];
      this.topMenuNarrowNodes = views['TopBarNarrow'] || this.topMenuNodes;
    });

    this.navigationService.versionInfo.subscribe(vi => this.versionInfo = vi);

    const hasNonEmptyToc = this.tocService.tocList.pipe(map(tocList => tocList.length > 0));
    combineLatest(hasNonEmptyToc, this.showFloatingToc)
        .subscribe(([hasToc, showFloatingToc]) => this.hasFloatingToc = hasToc && showFloatingToc);

    // Generally, we want to delay updating the shell (e.g. host classes, sidenav state) for the new
    // document, until after the leaving document has been removed (to avoid having the styles for
    // the new document applied prematurely).
    // For the first document, though, (when we know there is no previous document), we want to
    // ensure the styles are applied as soon as possible to avoid flicker.
    combineLatest(
      this.documentService.currentDocument,  // ...needed to determine host classes
      this.navigationService.currentNodes)   // ...needed to determine `sidenav` state
      .pipe(first())
      .subscribe(() => this.updateShell());
  }

  // Scroll to the anchor in the hash fragment or top of doc.
  autoScroll() {
    this.scrollService.scroll();
  }

  onDocReady() {
    // About to transition to new view.
    this.isTransitioning = true;

    // Stop fetching timeout (which, when render is fast, means progress bar never shown)
    clearTimeout(this.isFetchingTimeout);

    // If progress bar has been shown, keep it for at least 500ms (to avoid flashing).
    setTimeout(() => this.isFetching = false, 500);
  }

  onDocRemoved() {
    // The previous document has been removed.
    // Scroll to top to restore a clean visual state for the new document.
    this.scrollService.scrollToTop();
  }

  onDocInserted() {
    // Update the shell (host classes, sidenav state) to match the new document.
    // This may be called as a result of actions initiated by view updates.
    // In order to avoid errors (e.g. `ExpressionChangedAfterItHasBeenChecked`), updating the view
    // (e.g. sidenav, host classes) needs to happen asynchronously.
    setTimeout(() => this.updateShell());

    // Scroll 500ms after the new document has been inserted into the doc-viewer.
    // The delay is to allow time for async layout to complete.
    setTimeout(() => this.autoScroll(), 500);
  }

  onDocRendered() {
    if (this.isStarting) {
      // In order to ensure that the initial sidenav-content left margin
      // adjustment happens without animation, we need to ensure that
      // `isStarting` remains `true` until the margin change is triggered.
      // (Apparently, this happens with a slight delay.)
      setTimeout(() => this.isStarting = false, 100);
    }

    this.isTransitioning = false;
  }

  onDocVersionChange(versionIndex: number) {
    const version = this.docVersions[versionIndex];
    if (version.url) {
      this.locationService.go(version.url);
    }
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width: number) {
    this.isSideBySide = width > this.sideBySideWidth;
    this.showFloatingToc.next(width > this.showFloatingTocWidth);

    if (this.isSideBySide && !this.isSideNavDoc) {
      // If this is a non-sidenav doc and the screen is wide enough so that we can display menu
      // items in the top-bar, ensure the sidenav is closed.
      // (This condition can only be met when the resize event changes the value of `isSideBySide`
      //  from `false` to `true` while on a non-sidenav doc.)
      this.sidenav.toggle(false);
    }
  }

  @HostListener('click', ['$event.target', '$event.button', '$event.ctrlKey', '$event.metaKey', '$event.altKey'])
  onClick(eventTarget: HTMLElement, button: number, ctrlKey: boolean, metaKey: boolean, altKey: boolean): boolean {

    // Hide the search results if we clicked outside both the "search box" and the "search results"
    if (!this.searchElements.some(element => element.nativeElement.contains(eventTarget))) {
      this.hideSearchResults();
    }

    // Show developer source view if the footer is clicked while holding the meta and alt keys
    if (eventTarget.tagName === 'FOOTER' && metaKey && altKey) {
      this.dtOn = !this.dtOn;
      return false;
    }

    // Deal with anchor clicks; climb DOM tree until anchor found (or null)
    let target: HTMLElement|null = eventTarget;
    while (target && !(target instanceof HTMLAnchorElement)) {
      target = target.parentElement;
    }
    if (target instanceof HTMLAnchorElement) {
      return this.locationService.handleAnchorClick(target, button, ctrlKey, metaKey);
    }

    // Allow the click to pass through
    return true;
  }

  setPageId(id: string) {
    // Special case the home page
    this.pageId = (id === 'index') ? 'home' : id.replace('/', '-');
  }

  setFolderId(id: string) {
    // Special case the home page
    this.folderId = (id === 'index') ? 'home' : id.split('/', 1)[0];
  }

  notificationDismissed() {
    this.notificationAnimating = true;
      // this should be kept in sync with the animation durations in:
      // - aio/src/styles/2-modules/_notification.scss
      // - aio/src/app/layout/notification/notification.component.ts
      setTimeout(() => this.notificationAnimating = false, 250);
    this.updateHostClasses();
  }

  updateHostClasses() {
    const mode = `mode-${this.deployment.mode}`;
    const sideNavOpen = `sidenav-${this.sidenav.opened ? 'open' : 'closed'}`;
    const pageClass = `page-${this.pageId}`;
    const folderClass = `folder-${this.folderId}`;
    const viewClasses = Object.keys(this.currentNodes).map(view => `view-${view}`).join(' ');
    const notificationClass = `aio-notification-${this.notification.showNotification}`;
    const notificationAnimatingClass = this.notificationAnimating ? 'aio-notification-animating' : '';

    this.hostClasses = [
      mode,
      sideNavOpen,
      pageClass,
      folderClass,
      viewClasses,
      notificationClass,
      notificationAnimatingClass
    ].join(' ');
  }

  updateShell() {
    // Update the SideNav state (if necessary).
    this.updateSideNav();

    // Update the host classes.
    this.setPageId(this.currentDocument.id);
    this.setFolderId(this.currentDocument.id);
    this.updateHostClasses();
  }

  updateSideNav() {
    // Preserve current sidenav open state by default.
    let openSideNav = this.sidenav.opened;
    const isSideNavDoc = !!this.currentNodes[sideNavView];

    if (this.isSideNavDoc !== isSideNavDoc) {
      // View type changed. Is it now a sidenav view (e.g, guide or tutorial)?
      // Open if changed to a sidenav doc; close if changed to a marketing doc.
      openSideNav = this.isSideNavDoc = isSideNavDoc;
    }

    // May be open or closed when wide; always closed when narrow.
    this.sidenav.toggle(this.isSideBySide && openSideNav);
  }

  // Dynamically change height of table of contents container
  @HostListener('window:scroll')
  onScroll() {
    if (!this.tocMaxHeightOffset) {
      // Must wait until now for mat-toolbar to be measurable.
      const el = this.hostElement.nativeElement as Element;
      this.tocMaxHeightOffset =
          el.querySelector('footer')!.clientHeight +
          el.querySelector('.app-toolbar')!.clientHeight +
          24; //  fudge margin
    }

    this.tocMaxHeight = (document.body.scrollHeight - window.pageYOffset - this.tocMaxHeightOffset).toFixed(2);
  }

  // Restrain scrolling inside an element, when the cursor is over it
  restrainScrolling(evt: WheelEvent) {
    const elem = evt.currentTarget as Element;
    const scrollTop = elem.scrollTop;

    if (evt.deltaY < 0) {
      // Trying to scroll up: Prevent scrolling if already at the top.
      if (scrollTop < 1) {
        evt.preventDefault();
      }
    } else {
      // Trying to scroll down: Prevent scrolling if already at the bottom.
      const maxScrollTop = elem.scrollHeight - elem.clientHeight;
      if (maxScrollTop - scrollTop < 1) {
        evt.preventDefault();
      }
    }
  }


  // Search related methods and handlers

  hideSearchResults() {
    this.showSearchResults = false;
  }

  focusSearchBox() {
    if (this.searchBox) {
      this.searchBox.focus();
    }
  }

  doSearch(query: string) {
    this.searchResults = this.searchService.search(query);
    this.showSearchResults = !!query;
  }

  @HostListener('document:keyup', ['$event.key', '$event.which'])
  onKeyUp(key: string, keyCode: number) {
    // forward slash "/"
    if (key === '/' || keyCode === 191) {
      this.focusSearchBox();
    }
    if (key === 'Escape' || keyCode === 27 ) {
      // escape key
      if (this.showSearchResults) {
        this.hideSearchResults();
        this.focusSearchBox();
      }
    }
  }
}
