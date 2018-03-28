import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LocationService } from 'app/shared/location.service';
import { SearchResults } from 'app/search/interfaces';
import { SearchService } from 'app/search/search.service';

@Component({
  selector: 'aio-file-not-found-search',
  template:
  `<p>Let's see if any of these search results help...</p>
  <aio-search-results class="embedded" [searchResults]="searchResults | async"></aio-search-results>`
})
export class FileNotFoundSearchComponent implements OnInit {
  searchResults: Observable<SearchResults>;
  constructor(private location: LocationService, private search: SearchService) {}

  ngOnInit() {
    this.searchResults = this.location.currentPath.pipe(switchMap(path => {
      const query = path.split(/\W+/).join(' ');
      return this.search.search(query);
    }));
  }
}
