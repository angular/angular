import { ReflectiveInjector, NgZone } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { SearchService } from './search.service';
import { WebWorkerClient } from 'app/shared/web-worker';

describe('SearchService', () => {

  let injector: ReflectiveInjector;
  let service: SearchService;
  let sendMessageSpy: jasmine.Spy;
  let mockWorker: WebWorkerClient;

  beforeEach(() => {
    sendMessageSpy = jasmine.createSpy('sendMessage').and.returnValue(of({}));
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
      // We must initialize the service before calling connectSearches
      service.initWorker('some/url', 1000);
      // Simulate the index being ready so that searches get sent to the worker
      (service as any).ready = of(true);
    });

    it('should trigger a `loadIndex` synchronously (not waiting for the delay)', () => {
      expect(mockWorker.sendMessage).not.toHaveBeenCalled();
      service.search('some query').subscribe();
      expect(mockWorker.sendMessage).toHaveBeenCalledWith('load-index');
    });

    it('should send a "query-index" message to the worker', () => {
      service.search('some query').subscribe();
      expect(mockWorker.sendMessage).toHaveBeenCalledWith('query-index', 'some query');
    });

    it('should push the response to the returned observable', () => {
      const mockSearchResults = { results: ['a', 'b'] };
      let actualSearchResults: any;
      (mockWorker.sendMessage as jasmine.Spy).and.returnValue(of(mockSearchResults));
      service.search('some query').subscribe(results => actualSearchResults = results);
      expect(actualSearchResults).toEqual(mockSearchResults);
    });
  });
});
