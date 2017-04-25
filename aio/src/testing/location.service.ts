import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class MockLocationService {
  urlSubject = new BehaviorSubject<string>(this.initialUrl);
  currentUrl = this.urlSubject.asObservable().map(url => this.stripSlashes(url));
  // strip off query and hash
  currentPath = this.currentUrl.map(url => url.match(/[^?#]*/)[0]);
  search = jasmine.createSpy('search').and.returnValue({});
  setSearch = jasmine.createSpy('setSearch');
  go = jasmine.createSpy('Location.go').and
              .callFake((url: string) => this.urlSubject.next(url));
  goExternal = jasmine.createSpy('Location.goExternal');
  handleAnchorClick = jasmine.createSpy('Location.handleAnchorClick')
      .and.returnValue(false); // prevent click from causing a browser navigation

  constructor(private initialUrl) {}

  private stripSlashes(url: string) {
    return url.replace(/^\/+/, '').replace(/\/+(\?|#|$)/, '$1');
  }
}

