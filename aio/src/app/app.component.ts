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

  currentNode: CurrentNode;
  currentPath: string;
  dtOn = false;
  pageId: string;
  currentDocument: DocumentContents;
  footerNodes: NavigationNode[];

  @HostBinding('class.marketing')
  isMarketing = false;

  isStarting = true;
  isSideBySide = false;
  private isSideNavDoc = false;
  private previousNavView: string;

  private sideBySideWidth = 1032;
  sideNavNodes: NavigationNode[];
  topMenuNodes: NavigationNode[];

  currentDocVersion: NavigationNode;
  docVersions: NavigationNode[];
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
    private locationService: LocationService,
    private navigationService: NavigationService,
    private swUpdateNotifications: SwUpdateNotificationsService
  ) { }

  ngOnInit() {
    this.onResize(window.innerWidth);

    /* No need to unsubscribe because this root component never dies */

    this.documentService.currentDocument.subscribe(doc => {
      this.currentDocument = doc;
      this.setPageId(doc.id);
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

      // Toggle the sidenav if side-by-side and the kind of view changed
      if (this.previousNavView === currentNode.view) { return; }
      this.previousNavView = currentNode.view;
      this.isSideNavDoc = currentNode.view === sideNavView;
      this.isMarketing = !this.isSideNavDoc;
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
}
