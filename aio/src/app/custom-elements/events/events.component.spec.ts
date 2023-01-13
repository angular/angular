import { Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { AngularEvent, EventsComponent } from './events.component';
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
    expect(component.pastEvents.length).toEqual(0);
  });

  it('should have no upcoming when first created', () => {
    expect(component.upcomingEvents.length).toEqual(0);
  });

  describe('ngOnInit()', () => {
    beforeEach(() => {
      jasmine.clock().install();
      // End of day on June 15
      jasmine.clock().mockDate(new Date(Date.parse('2020-06-16') - 1));
      component.ngOnInit();
    });

    afterEach(() => jasmine.clock().uninstall());

    it('should separate past and upcoming events', () => {
      eventsService.events.next([
        createMockEvent('Upcoming event 1', {start: '2020-06-16'}),
        createMockEvent('Upcoming event 3', {start: '2222-01-01'}),
        createMockEvent('Past event 2', {start: '2020-06-13'}),
        createMockEvent('Upcoming event 2', {start: '2020-06-17'}),
        createMockEvent('Past event 1', {start: '2020-05-30'}),
        createMockEvent('Past event 3', {start: '2020-06-14'}),
      ]);

      expect(component.pastEvents.map(evt => evt.name)).toEqual(jasmine.arrayWithExactContents(
          ['Past event 1', 'Past event 2', 'Past event 3']));

      expect(component.upcomingEvents.map(evt => evt.name)).toEqual(jasmine.arrayWithExactContents(
          ['Upcoming event 1', 'Upcoming event 2', 'Upcoming event 3']));
    });

    it('should order past events in reverse chronological order', () => {
      eventsService.events.next([
        createMockEvent('Past event 2', {start: '1999-12-13'}),
        createMockEvent('Past event 4', {start: '2020-01-16'}),
        createMockEvent('Past event 3', {start: '2020-01-15'}),
        createMockEvent('Past event 1', {start: '1999-12-12'}),
      ]);

      expect(component.pastEvents.map(evt => evt.name)).toEqual(
          ['Past event 4', 'Past event 3', 'Past event 2', 'Past event 1']);
    });

    it('should order upcoming events in chronological order', () => {
      eventsService.events.next([
        createMockEvent('Upcoming event 2', {start: '2020-12-13'}),
        createMockEvent('Upcoming event 4', {start: '2021-01-16'}),
        createMockEvent('Upcoming event 3', {start: '2021-01-15'}),
        createMockEvent('Upcoming event 1', {start: '2020-12-12'}),
      ]);

      expect(component.upcomingEvents.map(evt => evt.name)).toEqual(
          ['Upcoming event 1', 'Upcoming event 2', 'Upcoming event 3', 'Upcoming event 4']);
    });

    it('should treat ongoing events as upcoming', () => {
      eventsService.events.next([
        createMockEvent('Ongoing event 1', {start: '2020-06-15'}),
      ]);

      expect(component.pastEvents).toEqual([]);
      expect(component.upcomingEvents.map(evt => evt.name)).toEqual(jasmine.arrayWithExactContents(
          ['Ongoing event 1']));
    });
  });

  // Helpers
  class TestEventsService {
    events = new Subject<AngularEvent[]>();
  }

  function createMockEvent(name: string, date: AngularEvent['date']): AngularEvent {
    return {
      name,
      linkUrl: '',
      date,
    };
  }
});
