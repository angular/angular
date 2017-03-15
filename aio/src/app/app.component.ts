import { Component, ViewChild, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { GaService } from 'app/shared/ga.service';
import { LocationService } from 'app/shared/location.service';
import { DocumentService, DocumentContents } from 'app/documents/document.service';
import { NavigationService, NavigationViews, NavigationNode } from 'app/navigation/navigation.service';
import { SearchService } from 'app/search/search.service';

@Component({
  selector: 'aio-shell',
  templateUrl: './app.component.html',
  styleUrls:  ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  readonly sideBySideWidth = 600;
  readonly homeImageUrl = 'assets/images/logos/angular2/angular_solidBlack.svg';

  isHamburgerVisible = true; // always ... for now
  isSideBySide = false;

  currentDocument: Observable<DocumentContents>;
  navigationViews: Observable<NavigationViews>;
  selectedNodes: Observable<NavigationNode[]>;

  constructor(
    documentService: DocumentService,
    gaService: GaService,
    locationService: LocationService,
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

  onResize(width) {
    this.isSideBySide = width > this.sideBySideWidth;
  }
}
