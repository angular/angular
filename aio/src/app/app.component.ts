import { Component, ElementRef, HostBinding, HostListener, OnInit,
         QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MdSidenav } from '@angular/material';

import { AutoScrollService } from 'app/shared/auto-scroll.service';
import { CurrentNode, NavigationService, NavigationViews, NavigationNode, VersionInfo } from 'app/navigation/navigation.service';
import { DocumentService, DocumentContents } from 'app/documents/document.service';
import { DocViewerComponent } from 'app/layout/doc-viewer/doc-viewer.component';
import { LocationService } from 'app/shared/location.service';
import { NavMenuComponent } from 'app/layout/nav-menu/nav-menu.component';
import { SearchResultsComponent } from 'app/search/search-results/search-results.component';
import { SwUpdateNotificationsService } from 'app/sw-updates/sw-update-notifications.service';

const sideNavView = 'SideNav';

@Component({
  selector: 'aio-shell',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

  currentDocument: DocumentContents;
  currentDocVersion: NavigationNode;
  currentNode: CurrentNode;
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
   * * `page-...`: computed from the current document id (e.g. news, guide-security, tutorial-toh-pt2)
   * * `folder-...`: computed from the top level folder for an id (e.g. guide, tutorial, etc)
   * * `view-...`: computef from the navigation view (e.g. SideNav, TopBar, etc)
   */
  @HostBinding('class')
  hostClasses = '';

  isStarting = true;
  isSideBySide = false;
  private isSideNavDoc = false;
  private previousNavView: string;

  private sideBySideWidth = 1032;
  sideNavNodes: NavigationNode[];
  topMenuNodes: NavigationNode[];
  tocMaxHeight: string;
  private tocMaxHeightOffset = 0;
  versionInfo: VersionInfo;

  get homeImageUrl() {
    return this.isSideBySide ?
      'assets/images/logos/standard/logo-nav@2x.png' :
      'assets/images/logos/standard/shield-large@2x.png';
  }
  get isOpened() { return this.isSideBySide && this.isSideNavDoc; }
  get mode() { return this.isSideBySide ? 'side' : 'over'; }

  // Need the doc-viewer element for scrolling the contents
  @ViewChild(DocViewerComponent, { read: ElementRef })
  docViewer: ElementRef;

  @ViewChildren('searchBox, searchResults', { read: ElementRef })
  searchElements: QueryList<ElementRef>;

  @ViewChild(SearchResultsComponent)
  searchResults: SearchResultsComponent;

  @ViewChild(MdSidenav)
  sidenav: MdSidenav;

  constructor(
    private autoScrollService: AutoScrollService,
    private documentService: DocumentService,
    private hostElement: ElementRef,
    private locationService: LocationService,
    private navigationService: NavigationService,
    private swUpdateNotifications: SwUpdateNotificationsService
  ) {  }

  ngOnInit() {
    this.onResize(window.innerWidth);

    /* No need to unsubscribe because this root component never dies */

    this.documentService.currentDocument.subscribe(doc => {
      this.currentDocument = doc;
      this.setPageId(doc.id);
      this.setFolderId(doc.id);
      this.updateHostClasses();
    });

    this.locationService.currentPath.subscribe(path => {
        if (this.currentPath && path === this.currentPath) {
          // scroll only if on same page (most likely a change to the hash)
          this.autoScroll();
        } else {
          // don't scroll; leave that to `onDocRendered`
          this.currentPath = path;
        }
      });

    this.navigationService.currentNode.subscribe(currentNode => {
      this.currentNode = currentNode;
      this.updateHostClasses();

      // Toggle the sidenav if side-by-side and the kind of view changed
      if (this.previousNavView === currentNode.view) { return; }
      this.previousNavView = currentNode.view;
      this.isSideNavDoc = currentNode.view === sideNavView;
      this.sideNavToggle(this.isSideNavDoc && this.isSideBySide);
    });

    this.navigationService.navigationViews.subscribe(views => {
      this.docVersions  = views['docVersions']  || [];
      this.footerNodes  = views['Footer']  || [];
      this.sideNavNodes = views['SideNav'] || [];
      this.topMenuNodes = views['TopBar']  || [];

      this.currentDocVersion = this.docVersions[0];
    });

    this.navigationService.versionInfo.subscribe( vi => this.versionInfo = vi );

    this.swUpdateNotifications.enable();
  }

  // Scroll to the anchor in the hash fragment or top of doc.
  autoScroll() {
    this.autoScrollService.scroll();
  }

  onDocRendered() {
    // Scroll after the doc-viewer has finished rendering the new doc
    this.autoScroll();
    this.isStarting = false;
  }

  onDocVersionChange(versionIndex: number) {
    const version = this.docVersions[versionIndex];
    if (version.url) {
      this.locationService.go(version.url);
    }
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width) {
    this.isSideBySide = width > this.sideBySideWidth;
  }

  @HostListener('click', ['$event.target', '$event.button', '$event.ctrlKey', '$event.metaKey', '$event.altKey'])
  onClick(eventTarget: HTMLElement, button: number, ctrlKey: boolean, metaKey: boolean, altKey: boolean): boolean {

    // Hide the search results if we clicked outside both the search box and the search results
    if (this.searchResults) {
      const hits = this.searchElements.filter(element => element.nativeElement.contains(eventTarget));
      if (hits.length === 0) {
        this.searchResults.hideResults();
      }
    }

    if (eventTarget.tagName === 'FOOTER' && metaKey && altKey) {
      this.dtOn = !this.dtOn;
      return false;
    }

    // Deal with anchor clicks; climb DOM tree until anchor found (or null)
    let target = eventTarget;
    while (target && !(target instanceof HTMLAnchorElement)) {
      target = target.parentElement;
    }
    if (target) {
      return this.locationService.handleAnchorClick(target as HTMLAnchorElement, button, ctrlKey, metaKey);
    }
    return true;
  }

  sideNavToggle(value?: boolean) {
    this.sidenav.toggle(value);
  }

  setPageId(id: string) {
    // Special case the home page
    this.pageId = (id === 'index') ? 'home' : id.replace('/', '-');
  }

  setFolderId(id: string) {
    // Special case the home page
    this.folderId = (id === 'index') ? 'home' : id.split('/', 1)[0];
  }

  updateHostClasses() {
    const pageClass = `page-${this.pageId}`;
    const folderClass = `folder-${this.folderId}`;
    const viewClass = `view-${this.currentNode && this.currentNode.view}`;

    this.hostClasses = `${pageClass} ${folderClass} ${viewClass}`;
  }

  // Dynamically change height of table of contents container
  @HostListener('window:scroll')
  onScroll() {
    if (!this.tocMaxHeightOffset) {
      // Must wait until now for md-toolbar to be measurable.
      const el = this.hostElement.nativeElement as Element;
      this.tocMaxHeightOffset =
          el.querySelector('footer').clientHeight +
          el.querySelector('md-toolbar.app-toolbar').clientHeight +
          44; //  margin
    }

    this.tocMaxHeight = (document.body.scrollHeight - window.pageYOffset - this.tocMaxHeightOffset).toFixed(2);
  }
}
