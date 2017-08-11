import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injector } from '@angular/core';
import { TestBed, inject } from '@angular/core/testing';

import { Logger } from 'app/shared/logger.service';

import { ApiService } from './api.service';

describe('ApiService', () => {

  let injector: Injector;
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    injector = TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        { provide: Logger, useClass: TestLogger }
      ]
    });

    service = injector.get(ApiService);
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should not immediately connect to the server', () => {
    httpMock.expectNone({});
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

      // Stop `httpMock.verify()` from complaining.
      httpMock.expectOne({});
  });

  describe('#sections', () => {

    it('first subscriber should fetch sections', () => {
      const data = [{name: 'a', title: 'A', items: []}, {name: 'b', title: 'B', items: []}];

      service.sections.subscribe(sections => {
        expect(sections).toEqual(data);
      });

      httpMock.expectOne({}).flush(data);
    });

    it('second subscriber should get previous sections and NOT trigger refetch', () => {
      const data = [{name: 'a', title: 'A', items: []}, {name: 'b', title: 'B', items: []}];
      let subscriptions = 0;

      service.sections.subscribe(sections => {
        subscriptions++;
        expect(sections).toEqual(data);
      });

      service.sections.subscribe(sections => {
        subscriptions++;
        expect(sections).toEqual(data);
      });

      httpMock.expectOne({}).flush(data);
    });
  });

  describe('#fetchSections', () => {

    it('should connect to the server w/ expected URL', () => {
      service.fetchSections();
      httpMock.expectOne('generated/docs/api/api-list.json');
    });

    it('should refresh the #sections observable w/ new content on second call', () => {

      let call = 0;

      let data = [{name: 'a', title: 'A', items: []}, {name: 'b', title: 'B', items: []}];

      service.sections.subscribe(sections => {
        // called twice during this test
        // (1) during subscribe
        // (2) after refresh
        expect(sections).toEqual(data, 'call ' + call++);
      });

      httpMock.expectOne({}).flush(data);

      // refresh/refetch
      data = [{name: 'c', title: 'C', items: []}];
      service.fetchSections();
      httpMock.expectOne({}).flush(data);

      expect(call).toBe(2, 'should be called twice');
    });
  });
});

class TestLogger {
  log = jasmine.createSpy('log');
  error = jasmine.createSpy('error');
}
