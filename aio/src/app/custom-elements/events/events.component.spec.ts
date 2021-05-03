import { Injector } from '@angular/core';
import { Subject } from 'rxjs';
import * as tzMock from 'timezone-mock';
import { Duration, Event, EventsComponent } from './events.component';
import { EventsService } from './events.service';

describe('EventsComponent', () => {
  let component: EventsComponent;
  let injector: Injector;
  let eventsService: TestEventsService;

  beforeEach(() => {
    injector = Injector.create({
      providers: [
        { provide: EventsComponent, deps: [EventsService] } ,
        { provide: EventsService, useClass: TestEventsService, deps: [] },
      ]
    });
    eventsService = injector.get(EventsService) as unknown as TestEventsService;
    component = injector.get(EventsComponent) as unknown as EventsComponent;
  });

  it('should have no pastEvents when first created', () => {
    expect(component.pastEvents).toBeUndefined();
  });

  it('should have no upcoming when first created', () => {
    expect(component.upcomingEvents).toBeUndefined();
  });

  describe('ngOnInit()', () => {
    beforeEach(() => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2020, 5, 15, 23, 59, 59));
      component.ngOnInit();
    });

    afterEach(() => jasmine.clock().uninstall());

    it('should separate past and upcoming events', () => {
      eventsService.events.next([
        createMockEvent(
            'Upcoming event 1',
            {start: '2020-06-16', end: '2020-06-17'},
            {start: '2020-06-18', end: '2020-06-18'}),
        createMockEvent(
            'Upcoming event 3',
            {start: '2222-01-01', end: '2222-01-02'}),
        createMockEvent(
            'Past event 2',
            {start: '2020-06-13', end: '2020-06-14'}),
        createMockEvent(
            'Upcoming event 2',
            {start: '2020-06-17', end: '2020-06-18'},
            {start: '2020-06-16', end: '2020-06-16'}),
        createMockEvent(
            'Past event 1',
            {start: '2020-05-30', end: '2020-05-31'}),
        createMockEvent(
            'Past event 3',
            {start: '2020-06-14', end: '2020-06-14'},
            {start: '2020-06-16', end: '2020-06-17'}),
      ]);

      expect(component.pastEvents.map(evt => evt.name)).toEqual(jasmine.arrayWithExactContents(
          ['Past event 1', 'Past event 2', 'Past event 3']));

      expect(component.upcomingEvents.map(evt => evt.name)).toEqual(jasmine.arrayWithExactContents(
          ['Upcoming event 1', 'Upcoming event 2', 'Upcoming event 3']));
    });

    it('should order past events in reverse chronological order (ignoring workshops dates)', () => {
      eventsService.events.next([
        createMockEvent(
            'Past event 2',
            {start: '1999-12-13', end: '1999-12-14'},
            {start: '1999-12-11', end: '1999-12-11'}),
        createMockEvent(
            'Past event 4',
            {start: '2020-01-16', end: '2020-01-17'},
            {start: '2020-01-14', end: '2020-01-15'}),
        createMockEvent(
            'Past event 3',
            {start: '2020-01-15', end: '2020-01-16'},
            {start: '2020-01-17', end: '2020-01-18'}),
        createMockEvent(
            'Past event 1',
            {start: '1999-12-12', end: '1999-12-15'}),
      ]);

      expect(component.pastEvents.map(evt => evt.name)).toEqual(
          ['Past event 4', 'Past event 3', 'Past event 2', 'Past event 1']);
    });

    it('should order upcoming events in chronological order (ignoring workshops dates)', () => {
      eventsService.events.next([
        createMockEvent(
            'Upcoming event 2',
            {start: '2020-12-13', end: '2020-12-14'},
            {start: '2020-12-11', end: '2020-12-11'}),
        createMockEvent(
            'Upcoming event 4',
            {start: '2021-01-16', end: '2021-01-17'},
            {start: '2021-01-14', end: '2021-01-15'}),
        createMockEvent(
            'Upcoming event 3',
            {start: '2021-01-15', end: '2021-01-16'},
            {start: '2021-01-17', end: '2021-01-18'}),
        createMockEvent(
            'Upcoming event 1',
            {start: '2020-12-12', end: '2020-12-15'}),
      ]);

      expect(component.upcomingEvents.map(evt => evt.name)).toEqual(
          ['Upcoming event 1', 'Upcoming event 2', 'Upcoming event 3', 'Upcoming event 4']);
    });

    it('should treat ongoing events as upcoming', () => {
      eventsService.events.next([
        createMockEvent(
            'Ongoing event 1',
            {start: '2020-06-14', end: '2020-06-16'}),
        createMockEvent(
            'Ongoing event 2',
            {start: '2020-06-14', end: '2020-06-15'},
            {start: '2020-06-13', end: '2020-06-13'}),
      ]);

      expect(component.pastEvents).toEqual([]);
      expect(component.upcomingEvents.map(evt => evt.name)).toEqual(jasmine.arrayWithExactContents(
          ['Ongoing event 1', 'Ongoing event 2']));
    });
  });

  describe('getEventDates()', () => {
    // Test on different timezones to ensure that event dates are processed correctly regardless of
    // the user's local time.
    const timezones: tzMock.TimeZone[] = [
      'Australia/Adelaide',  // UTC+9.5/10.5
      'Brazil/East',         // UTC-3
      'UTC',                 // UTC
    ];

    for (const tz of timezones) {
      describe(`on timezone ${tz}`, () => {
        // NOTE: `timezone-mock` does not work correctly if used together with Jasmine's mock clock.
        beforeEach(() => tzMock.register(tz));
        afterEach(() => tzMock.unregister());

        describe('(without workshops)', () => {
          it('should correctly format the main event date', () => {
            const testEvent = createMockEvent('Test', {start: '2020-06-20', end: '2020-06-20'});
            expect(component.getEventDates(testEvent)).toBe('June 20, 2020');
          });

          it('should correctly format the main event date spanning mupliple days', () => {
            const testEvent = createMockEvent('Test', {start: '2019-09-19', end: '2019-09-21'});
            expect(component.getEventDates(testEvent)).toBe('September 19-21, 2019');
          });

          it('should correctly format the main event date spanning mupliple months', () => {
            const testEvent = createMockEvent('Test', {start: '2019-10-30', end: '2019-11-01'});
            expect(component.getEventDates(testEvent)).toBe('October 30 - November 1, 2019');
          });

          it('should correctly format event dates at the beginning/end of the year', () => {
            const testEvent = createMockEvent('Test', {start: '2021-01-01', end: '2021-12-31'});
            expect(component.getEventDates(testEvent)).toBe('January 1 - December 31, 2021');
          });
        });

        describe('(with workshops)', () => {
          it('should correctly format event dates with workshops after main event', () => {
            const testEvent = createMockEvent(
                'Test',
                {start: '2020-07-25', end: '2020-07-26'},
                {start: '2020-07-27', end: '2020-07-27'});

            expect(component.getEventDates(testEvent))
                .toBe('July 25-26 (conference), July 27 (workshops), 2020');
          });

          it('should correctly format event dates with workshops before main event', () => {
            const testEvent = createMockEvent(
                'Test',
                {start: '2019-10-07', end: '2019-10-07'},
                {start: '2019-10-06', end: '2019-10-06'});

            expect(component.getEventDates(testEvent))
                .toBe('October 6 (workshops), October 7 (conference), 2019');
          });

          it('should correctly format event dates spanning multiple days', () => {
            const testEvent = createMockEvent(
                'Test',
                {start: '2019-08-30', end: '2019-08-31'},
                {start: '2019-08-28', end: '2019-08-29'});

            expect(component.getEventDates(testEvent))
                .toBe('August 28-29 (workshops), August 30-31 (conference), 2019');
          });

          it('should correctly format event dates with workshops on different month before the main event',
            () => {
              const testEvent = createMockEvent(
                  'Test',
                  {start: '2020-08-01', end: '2020-08-02'},
                  {start: '2020-07-30', end: '2020-07-31'});

              expect(component.getEventDates(testEvent))
                  .toBe('July 30-31 (workshops), August 1-2 (conference), 2020');
            });

          it('should correctly format event dates with workshops on different month after the main event',
            () => {
              const testEvent = createMockEvent(
                  'Test',
                  {start: '2020-07-30', end: '2020-07-31'},
                  {start: '2020-08-01', end: '2020-08-02'});

              expect(component.getEventDates(testEvent))
                  .toBe('July 30-31 (conference), August 1-2 (workshops), 2020');
            });

          it('should correctly format event dates spanning multiple months', () => {
            const testEvent = createMockEvent(
                'Test',
                {start: '2020-07-31', end: '2020-08-01'},
                {start: '2020-07-30', end: '2020-08-01'});

            expect(component.getEventDates(testEvent))
                .toBe('July 30 - August 1 (workshops), July 31 - August 1 (conference), 2020');
          });
        });
      });
    }
  });

  // Helpers
  class TestEventsService {
    events = new Subject<Event[]>();
  }

  function createMockEvent(name: string, date: Duration, workshopsDate?: Duration): Event {
    return {
      name,
      location: '',
      linkUrl: '',
      date,
      workshopsDate,
    };
  }
});
