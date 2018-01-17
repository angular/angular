import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SearchResult, SearchResults, SearchArea } from 'app/search/interfaces';

/**
 * A component to display search results in groups
 */
@Component({
  selector: 'aio-search-results',
  templateUrl: './search-results.component.html',
})
export class SearchResultsComponent implements OnChanges {

  /**
   * The results to display
   */
  @Input()
  searchResults: SearchResults;

  /**
   * Emitted when the user selects a search result
   */
  @Output()
  resultSelected = new EventEmitter<SearchResult>();

  readonly defaultArea = 'other';
  notFoundMessage = 'Searching ...';
  readonly topLevelFolders = ['guide', 'tutorial'];
  searchAreas: SearchArea[] = [];

  ngOnChanges(changes: SimpleChanges) {
    this.searchAreas = this.processSearchResults(this.searchResults);
  }

  onResultSelected(page: SearchResult, event: MouseEvent) {
    // Emit a `resultSelected` event if the result is to be displayed on this page.
    if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
      this.resultSelected.emit(page);
    }
  }

  // Map the search results into groups by area
  private processSearchResults(search: SearchResults) {
    if (!search) {
      return [];
    }
    this.notFoundMessage = 'No results found.';
    const searchAreaMap: { [key: string]: SearchResult[] } = {};
    search.results.forEach(result => {
      if (!result.title) { return; } // bad data; should fix
      const areaName = this.computeAreaName(result) || this.defaultArea;
      const area = searchAreaMap[areaName] = searchAreaMap[areaName] || [];
      area.push(result);
    });
    const keys = Object.keys(searchAreaMap).sort((l, r) => l > r ? 1 : -1);
    return keys.map(name => {
      let pages: SearchResult[] = searchAreaMap[name];

      // Extract the top 5 most relevant results as priorityPages
      const priorityPages = pages.splice(0, 5);
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

function compareResults(l: SearchResult, r: SearchResult) {
  return l.title.toUpperCase() > r.title.toUpperCase() ? 1 : -1;
}
