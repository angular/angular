import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/operator/map';

import { AutoScrollService } from 'app/shared/auto-scroll.service';
import { DocumentService, DocumentContents } from 'app/documents/document.service';
import { DocViewerComponent } from 'app/layout/doc-viewer/doc-viewer.component';
import { LocationService } from 'app/shared/location.service';
import { NavMenuComponent } from 'app/layout/nav-menu/nav-menu.component';
import { SearchService } from 'app/search/search.service';
import { SearchResultsComponent } from 'app/search/search-results/search-results.component';

@Component({
  selector: 'aio-shell',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  private readonly sideBySideWidth = 600;

  isHamburgerVisible = true; // always ... for now
  isSideBySide = false;

  get mode() { return this.isSideBySide ? 'side' : 'over'; }
  get isOpened() { return this.isSideBySide && this.navMenu.isSideNavDoc; }

  currentDocument: Observable<DocumentContents>;

  @ViewChildren('searchBox, searchResults', { read: ElementRef })
  searchElements: QueryList<ElementRef>;

  @ViewChild(SearchResultsComponent)
  searchResults: SearchResultsComponent;

  @ViewChild(NavMenuComponent)
  navMenu: NavMenuComponent;

  // Need the doc-viewer element for scrolling the contents
  @ViewChild(DocViewerComponent, { read: ElementRef })
  docViewer: ElementRef;

  constructor(documentService: DocumentService,
              private autoScrollService: AutoScrollService,
              private locationService: LocationService,
              private searchService: SearchService) {
    this.currentDocument = documentService.currentDocument;
  }

  ngOnInit() {
    this.searchService.initWorker('app/search/search-worker.js');
    this.searchService.loadIndex();

    this.onResize(window.innerWidth);

    this.locationService.currentUrl.subscribe(url => {
      this.autoScroll(); // scroll even if only the hash fragment changed
    });
  }

  onDocRendered(doc: DocumentContents) {
    // This handler is needed because the subscription to the `currentUrl` in `ngOnInit`
    // gets triggered too early before the doc-viewer has finished rendering the doc
    this.autoScroll();
  }

  // Scroll to the anchor in the hash fragment.
  autoScroll() {
    this.autoScrollService.scroll(this.docViewer.nativeElement.offsetParent);
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
    if (eventTarget instanceof HTMLAnchorElement) {
      return this.locationService.handleAnchorClick(eventTarget, button, ctrlKey, metaKey);
    }
    return true;
  }
}
