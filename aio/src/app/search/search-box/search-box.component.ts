import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { LocationService } from 'app/shared/location.service';

/**
 * This component provides a text box to type a search query that will be sent to the SearchService.
 *
 * When you arrive at a page containing this component, it will retrieve the `query` from the browser
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
    (keyup)="onSearch($event.target.value)"
    (focus)="onSearch($event.target.value)"
    (click)="onSearch($event.target.value)">`
})
export class SearchBoxComponent implements OnInit {

  @ViewChild('searchBox') searchBox: ElementRef;
  @Output() search = new EventEmitter<string>();

  constructor(private locationService: LocationService) { }

  /**
   * When we first show this search box we trigger a search if there is a search query in the URL
   */
  ngOnInit() {
    const query = this.locationService.search()['search'];
    if (query) {
      this.searchBox.nativeElement.value = query;
      this.onSearch(query);
    }
  }

  onSearch(query: string) {
    this.search.emit(query);
  }

  focus() {
    this.searchBox.nativeElement.focus();
  }
}
