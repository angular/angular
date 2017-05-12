import { Subject } from 'rxjs/Subject';
import { SearchResults } from 'app/search/search.service';

export class MockSearchService {
  searchResults = new Subject<SearchResults>();
  initWorker = jasmine.createSpy('initWorker');
  loadIndex = jasmine.createSpy('loadIndex');
  search = jasmine.createSpy('search');
}
