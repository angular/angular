import { ReflectiveInjector, NgZone } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { SearchService } from './search.service';
import { WebWorkerClient } from 'app/shared/web-worker';

describe('SearchService', () => {

  let injector: ReflectiveInjector;
  let service: SearchService;
  let sendMessageSpy: jasmine.Spy;
  let mockWorker: WebWorkerClient;

  beforeEach(() => {
    sendMessageSpy = jasmine.createSpy('sendMessage').and.returnValue(Observable.of({}));
    mockWorker = { sendMessage: sendMessageSpy } as any;
    spyOn(WebWorkerClient, 'create').and.returnValue(mockWorker);

    injector = ReflectiveInjector.resolveAndCreate([
        SearchService,
        { provide: NgZone, useFactory: () => new NgZone({ enableLongStackTrace: false }) }
    ]);
    service = injector.get(SearchService);
  });

  describe('initWorker', () => {
    it('should create the worker and load the index after the specified delay', fakeAsync(() => {
      service.initWorker('some/url', 100);
      expect(WebWorkerClient.create).not.toHaveBeenCalled();
      expect(mockWorker.sendMessage).not.toHaveBeenCalled();
      tick(100);
      expect(WebWorkerClient.create).toHaveBeenCalledWith('some/url', jasmine.any(NgZone));
      expect(mockWorker.sendMessage).toHaveBeenCalledWith('load-index');
    }));
  });

  describe('search', () => {
    beforeEach(() => {
      // We must initialize the service before calling search
      service.initWorker('some/url', 100);
    });

    it('should trigger a `loadIndex` synchronously', () => {
      service.search('some query');
      expect(mockWorker.sendMessage).toHaveBeenCalledWith('load-index');
    });

    it('should send a "query-index" message to the worker', () => {
      service.search('some query');
      expect(mockWorker.sendMessage).toHaveBeenCalledWith('query-index', 'some query');
    });

    it('should push the response to the `searchResults` observable', () => {
      const mockSearchResults = { results: ['a', 'b'] };
      (mockWorker.sendMessage as jasmine.Spy).and.returnValue(Observable.of(mockSearchResults));
      let searchResults: any;
      service.searchResults.subscribe(results => searchResults = results);
      service.search('some query');
      expect(searchResults).toEqual(mockSearchResults);
    });
  });
});
