import { ReflectiveInjector } from '@angular/core';

import { FileLoaderService } from 'app/shared/file-loader.service';
import { TestConnection, TestFileLoaderService } from 'testing/file-loader.service';

import { Logger } from 'app/shared/logger.service';

import { ApiService } from './api.service';

describe('ApiService', () => {

  let injector: ReflectiveInjector;
  let service: ApiService;
  let loader: TestFileLoaderService;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
      ApiService,
      { provide: FileLoaderService, useClass: TestFileLoaderService },
      { provide: Logger, useClass: TestLogger }
    ]);
  });

  beforeEach(() => {
    loader = injector.get(FileLoaderService);
    service = injector.get(ApiService);
  });

  it('should be creatable', () => {
    expect(service).toBeTruthy();
  });

  it('should not immediately connect to the server', () => {
    expect(loader.connectionsArray.length).toEqual(0);
  });

  it('subscribers should be completed/unsubscribed when service destroyed', () => {
      let completed = false;

      service.sections.subscribe(
        null,
        null,
        () => completed = true
      );

      service.ngOnDestroy();
      expect(completed).toBe(true);
  });

  describe('#sections', () => {
    it('first subscriber should fetch sections', () => {
      const data = [{name: 'a'}, {name: 'b'}];

      service.sections.subscribe(sections => {
        expect(sections).toEqual(data);
      });

      loader.connectionsArray[0].mockRespond(data);
    });

    it('second subscriber should get previous sections and NOT trigger refetch', () => {
      const data = [{name: 'a'}, {name: 'b'}];
      let subscriptions = 0;

      service.sections.subscribe(sections => {
        subscriptions++;
        expect(sections).toEqual(data);
      });

      service.sections.subscribe(sections => {
        subscriptions++;
        expect(sections).toEqual(data);
      });

      loader.connectionsArray[0].mockRespond(data);

      expect(loader.connectionsArray.length).toBe(1, 'server connections');
      expect(subscriptions).toBe(2, 'subscriptions');
    });

  });

  describe('#fetchSections', () => {

    it('should connect to the server w/ expected URL', () => {
      service.fetchSections();
      expect(loader.connectionsArray.length).toEqual(1);
      expect(loader.connectionsArray[0].url).toEqual('docs/api/api-list.json');
    });

    it('should refresh the #sections observable w/ new content on second call', () => {

      let call = 0;
      let connection: TestConnection;
      loader.connections.subscribe(c => connection = c);

      let data = [{name: 'a'}, {name: 'b'}];

      service.sections.subscribe(sections => {
        // called twice during this test
        // (1) during subscribe
        // (2) after refresh
        expect(sections).toEqual(data, 'call ' + call++);
      });
      connection.mockRespond(data);

      // refresh/refetch
      data = [{name: 'c'}];
      service.fetchSections();
      connection.mockRespond(data);

      expect(call).toBe(2, 'should be called twice');
    });
  });
});

class TestLogger {
  log = jasmine.createSpy('log');
  error = jasmine.createSpy('error');
}
