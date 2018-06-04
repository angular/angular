import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { LocationService } from 'app/shared/location.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
    type="search"
    aria-label="search"
    placeholder="Search"
    (input)="doSearch()"
    (keyup)="doSearch()"
    (focus)="doFocus()"
    (click)="doSearch()">`
})
export class SearchBoxComponent implements OnInit {

  private searchDebounce = 300;
  private searchSubject = new Subject<string>();

  @ViewChild('searchBox') searchBox: ElementRef;
  @Output() onSearch = this.searchSubject.pipe(distinctUntilChanged(), debounceTime(this.searchDebounce));
  @Output() onFocus = new EventEmitter<string>();

  constructor(private locationService: LocationService) { }

  /**
   * When we first show this search box we trigger a search if there is a search query in the URL
   */
  ngOnInit() {
    const query = this.locationService.search()['search'];
    if (query) {
      this.query = query;
      this.doSearch();
    }
  }

  doSearch() {
    this.searchSubject.next(this.query);
  }

  doFocus() {
    this.onFocus.emit(this.query);
  }

  focus() {
    this.searchBox.nativeElement.focus();
  }

  private get query() { return this.searchBox.nativeElement.value; }
  private set query(value: string) { this.searchBox.nativeElement.value = value; }
}
