import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { EventsService } from './events.service';
import { Logger } from 'app/shared/logger.service';
import { MockLogger } from 'testing/logger.service';

describe('EventsService', () => {

  let injector: Injector;
  let eventsService: EventsService;
  let httpMock: HttpTestingController;
  let mockLogger: MockLogger;

  beforeEach(() => {
    injector = TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EventsService,
        { provide: Logger, useClass: MockLogger }
      ]
    });

    eventsService = injector.get<EventsService>(EventsService);
    mockLogger = injector.get(Logger) as any;
    httpMock = injector.get(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should make a single connection to the server', () => {
    eventsService.events.subscribe();
    eventsService.events.subscribe();
    httpMock.expectOne('generated/events.json');
    expect().nothing();  // Prevent jasmine from complaining about no expectations.
  });

  it('should handle a failed request for `events.json`', () => {
    const request = httpMock.expectOne('generated/events.json');
    request.error(new ProgressEvent('404'));
    expect(mockLogger.output.error).toEqual([
      [jasmine.any(Error)]
    ]);
    expect(mockLogger.output.error[0][0].message).toMatch(/^generated\/events\.json request failed:/);
  });

  it('should return an empty array on a failed request for `events.json`', done => {
    const request = httpMock.expectOne('generated/events.json');
    request.error(new ProgressEvent('404'));
    eventsService.events.subscribe(results => {
      expect(results).toEqual([]);
      done();
    });
  });
});
