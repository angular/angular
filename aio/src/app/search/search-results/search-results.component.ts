import { Component, ChangeDetectionStrategy, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import { SearchResult, SearchResults, SearchService } from '../search.service';

export interface SearchArea {
  name: string;
  pages: SearchResult[];
  priorityPages: SearchResult[];
}

/**
 * A component to display the search results
 */
@Component({
  selector: 'aio-search-results',
  templateUrl: './search-results.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultsComponent implements OnInit {

  readonly defaultArea = 'other';
  readonly topLevelFolders = ['guide', 'tutorial'];

  notFound = false;

  @Output()
  resultSelected = new EventEmitter<SearchResult>();

  /**
   * A mapping of the search results grouped into areas
   */
  searchAreas = new ReplaySubject<SearchArea[]>(1);
  hasAreas = this.searchAreas.map(areas => areas.length > 0);

  constructor(private searchService: SearchService) {}

  ngOnInit() {
    this.searchService.searchResults.subscribe(search => this.searchAreas.next(this.processSearchResults(search)));
  }

  onResultSelected(result: SearchResult) {
    this.resultSelected.emit(result);
    this.hideResults();
  }

  @HostListener('document:keyup', ['$event.which'])
  onKeyUp(keyCode: number) {
    if (keyCode === 27) {
      this.hideResults();
    }
  }

  hideResults() {
    this.searchAreas.next([]);
    this.notFound = false;
  }

  // Map the search results into groups by area
  private processSearchResults(search: SearchResults) {
    this.notFound = search.query.trim() && search.results.length === 0;
    const searchAreaMap = {};
    search.results.forEach(result => {
      if (!result.title) { return; } // bad data; should fix
      const areaName = this.computeAreaName(result) || this.defaultArea;
      const area = searchAreaMap[areaName] = searchAreaMap[areaName] || [];
      area.push(result);
    });
    const keys = Object.keys(searchAreaMap).sort((l, r) => l > r ? 1 : -1);
    return keys.map(name => {
      let pages = searchAreaMap[name];
      const priorityPages = pages.length > 10 ? searchAreaMap[name].slice(0, 5) : [];
      pages = pages.sort(compareResults);
      return { name, pages, priorityPages };
  });
  }

  // Split the search result path and use the top level folder, if there is one, as the area name.
  private computeAreaName(result: SearchResult) {
    if (this.topLevelFolders.indexOf(result.path) !== -1) {
      return result.path;
    }
    const [areaName, rest] = result.path.split('/', 2);
    return rest && areaName;
  }
}

function compareResults(l: {title: string}, r: {title: string}) {
  return l.title.toUpperCase() > r.title.toUpperCase() ? 1 : -1;
}
