import { ReflectiveInjector, NgZone } from '@angular/core';
import { SearchService } from './search.service';

describe('SearchService', () => {

  let injector: ReflectiveInjector;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
        SearchService,
        { provide: NgZone, useFactory: () => new NgZone({ enableLongStackTrace: false }) }
    ]);
  });

  describe('loadIndex', () => {
    it('should send a "load-index" message to the worker');
    it('should connect the `ready` property to the response to the "load-index" message');
  });

  describe('search', () => {
    it('should send a "query-index" message to the worker');
    it('should push the response to the `searchResults` observable');
  });
});
