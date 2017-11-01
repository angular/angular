// #docregion
// #docplaster
// #docregion testing-1
import { TestBed } from '@angular/core/testing';
import { EventAggregatorService, AppEvent } from './event-aggregator.service';

describe('Event Aggregator Service', () => {
  let eventService: EventAggregatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventAggregatorService
      ]
    });

    eventService = TestBed.get(EventAggregatorService);
  });
// #enddocregion testing-1
// #docregion testing-2
  it('should start with an empty array', () => {
    eventService.events$.subscribe(events => {
      expect(events.length).toBe(0);
    });
  });
// #enddocregion testing-2
// #docregion testing-3
  it('should append new events to the array when add() is called', () => {
    const event: AppEvent = {
      type: 'Event',
      message: 'An event occurred'
    };

    eventService.add(event);

    eventService.events$.subscribe(events => {
      expect(events.length).toBe(1);
      expect(events[0]).toEqual(event);
    });
  });
// #enddocregion testing-3
// #docregion testing-1
});
// #enddocregion testing-1
