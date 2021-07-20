import { AfterViewInit, Component, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
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
export class SearchBoxComponent implements AfterViewInit {

  private searchDebounce = 300;
  private searchSubject = new Subject<string>();

  @ViewChild('searchBox', { static: true }) searchBox: ElementRef;
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onSearch = this.searchSubject.pipe(distinctUntilChanged(), debounceTime(this.searchDebounce));
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onFocus = new EventEmitter<string>();

  constructor(private locationService: LocationService) { }

  /**
   * When we first show this search box we trigger a search if there is a search query in the URL
   */
  ngAfterViewInit() {
    const query = this.locationService.search().search;
    if (query) {
      this.query = this.decodeQuery(query);
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

  private decodeQuery(query: string): string {
    // `decodeURIComponent` does not handle `+` for spaces, replace via RexEx.
    return query.replace(/\+/g, ' ');
  }

  private get query() { return this.searchBox.nativeElement.value; }
  private set query(value: string) { this.searchBox.nativeElement.value = value; }
}
