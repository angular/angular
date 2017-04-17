import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SearchService } from 'app/search/search.service';
import { LocationService } from 'app/shared/location.service';

/**
 * This component provides a text box to type a search query that will be sent to the SearchService.
 *
 * Whatever is typed in this box will be placed in the browser address bar as `?search=...`.
 *
 * When you arrive at a page containing this component, it will retrieve the query from the browser
 * address bar. If there is a query then this will be made.
 *
 * Focussing on the input box will resend whatever query is there. This can be useful if the search
 * results had been hidden for some reason.
 *
 */
@Component({
  selector: 'aio-search-box',
  template: `<input #searchBox
    aria-label="search"
    placeholder="Search"
    (keyup)="onSearch($event.target.value, $event.which)"
    (focus)="onSearch($event.target.value)"
    (click)="onSearch($event.target.value)">`
})
export class SearchBoxComponent implements OnInit {

  @ViewChild('searchBox') searchBox: ElementRef;

  constructor(private searchService: SearchService, private locationService: LocationService) { }

  ngOnInit() {
    this.searchService.initWorker('app/search/search-worker.js');
    this.searchService.loadIndex();

    const query = this.locationService.search()['search'];
    if (query) {
      this.searchBox.nativeElement.value = query;
      this.onSearch(query);
    }
  }

  onSearch(query: string, keyCode?: number) {
    if (keyCode === 27) {
      // Ignore escape key
      return;
    }
    this.locationService.setSearch('Full Text Search', { search: query });
    this.searchService.search(query);
  }
}
