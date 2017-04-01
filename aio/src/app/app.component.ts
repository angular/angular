import { Component, ElementRef, HostListener, OnInit,
         QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MdSidenav } from '@angular/material/sidenav';

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
  pageId: string;
  currentDocument: DocumentContents;
  footerNodes: NavigationNode[];
  isSideBySide = false;
  private isSideNavDoc = false;
  private previousNavView: string;
  private readonly sideBySideWidth = 600;
  sideNavNodes: NavigationNode[];
  topMenuNodes: NavigationNode[];
  versionInfo: VersionInfo;

  get homeImageUrl() {
    return this.isSideBySide ?
      'assets/images/logos/standard/logo-nav@2x.png' :
      'assets/images/logos/standard/logo-nav-small.png';
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
    /* No need to unsubscribe because this root component never dies */

    this.documentService.currentDocument.subscribe(doc => this.currentDocument = doc);

    // scroll even if only the hash fragment changed
    this.locationService.currentUrl.subscribe(url => this.autoScroll());

    this.navigationService.currentNode.subscribe(currentNode => {
      this.currentNode = currentNode;
      this.pageId = this.currentNode.url.replace('/', '-') || 'home';

      // Toggle the sidenav if the kind of view changed
      if (this.previousNavView === currentNode.view) { return; }
      this.previousNavView = currentNode.view;
      this.isSideNavDoc = currentNode.view === sideNavView;
      this.sideNavToggle(this.isSideNavDoc);
    });

    this.navigationService.navigationViews.subscribe(views => {
      this.footerNodes  = views['Footer']  || [];
      this.sideNavNodes = views['SideNav'] || [];
      this.topMenuNodes = views['TopBar']  || [];
    });

    this.navigationService.versionInfo.subscribe( vi => this.versionInfo = vi );

    this.swUpdateNotifications.enable();

    this.onResize(window.innerWidth);
  }

  // Scroll to the anchor in the hash fragment.
  autoScroll() {
    this.autoScrollService.scroll(this.docViewer.nativeElement.offsetParent);
  }

  onDocRendered(doc: DocumentContents) {
    // This handler is needed because the subscription to the `currentUrl` in `ngOnInit`
    // gets triggered too early before the doc-viewer has finished rendering the doc
    this.autoScroll();
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(width) {
    this.isSideBySide = width > this.sideBySideWidth;
  }

  @HostListener('click', ['$event.target', '$event.button', '$event.ctrlKey', '$event.metaKey'])
  onClick(eventTarget: HTMLElement, button: number, ctrlKey: boolean, metaKey: boolean): boolean {

    // Hide the search results if we clicked outside both the search box and the search results
    if (this.searchResults) {
      const hits = this.searchElements.filter(element => element.nativeElement.contains(eventTarget));
      if (hits.length === 0) {
        this.searchResults.hideResults();
      }
    }

    // Deal with anchor clicks
    if (eventTarget instanceof HTMLImageElement) {
      eventTarget = eventTarget.parentElement; // assume image wrapped in Anchor
    }
    if (eventTarget instanceof HTMLAnchorElement) {
      return this.locationService.handleAnchorClick(eventTarget, button, ctrlKey, metaKey);
    }
    return true;
  }

  sideNavToggle(value?: boolean) {
    this.sidenav.toggle(value);
  }

}
