import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class MockLocationService {
  urlSubject = new BehaviorSubject<string>(this.initialUrl);
  currentUrl = this.urlSubject.asObservable();
  search = jasmine.createSpy('search').and.returnValue({});
  setSearch = jasmine.createSpy('setSearch');
  constructor(private initialUrl) {}
}

