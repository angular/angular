import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { GaService } from 'app/shared/ga.service';
import { LocationService } from 'app/shared/location.service';
import { DocumentService, DocumentContents } from 'app/documents/document.service';
import { NavigationService, NavigationViews, NavigationNode } from 'app/navigation/navigation.service';
import { SearchService } from 'app/search/search.service';
import { SearchResultsComponent } from 'app/search/search-results/search-results.component';

@Component({
  selector: 'aio-shell',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  readonly sideBySideWidth = 600;
  readonly homeImageUrl = 'assets/images/logos/standard/logo-nav.png';

  isHamburgerVisible = true; // always ... for now
  isSideBySide = false;

  currentDocument: Observable<DocumentContents>;
  navigationViews: Observable<NavigationViews>;
  selectedNodes: Observable<NavigationNode[]>;

  @ViewChildren('searchBox, searchResults', { read: ElementRef })
  searchElements: QueryList<ElementRef>;

  @ViewChild(SearchResultsComponent)
  searchResults: SearchResultsComponent;

  constructor(
      documentService: DocumentService,
      gaService: GaService,
      private locationService: LocationService,
      navigationService: NavigationService,
      private searchService: SearchService) {
    this.currentDocument = documentService.currentDocument;
    locationService.currentUrl.subscribe(url => gaService.locationChanged(url));
    this.navigationViews = navigationService.navigationViews;
    this.selectedNodes = navigationService.selectedNodes;
  }

  ngOnInit() {
    this.searchService.initWorker('app/search/search-worker.js');
    this.searchService.loadIndex();

    this.onResize(window.innerWidth);
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
