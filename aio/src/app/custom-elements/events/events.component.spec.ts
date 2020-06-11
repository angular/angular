import { EventsComponent } from './events.component';
import { EventsService } from './events.service';
import { Event } from './events.component';
import { ReflectiveInjector } from '@angular/core';
import { Subject } from 'rxjs';

describe('EventsComponent', () => {
  let component: EventsComponent;
  let injector: ReflectiveInjector;
  let eventsService: TestEventService;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
      EventsComponent,
      {provide: EventsService, useClass: TestEventService },
    ]);
    eventsService = injector.get(EventsService) as any;
    component = injector.get(EventsComponent);
    component.ngOnInit();
  });

  it('should have no pastEvents when first created', () => {
    expect(component.pastEvents).toBeUndefined();
  });

  it('should have no upcoming when first created', () => {
    expect(component.upcomingEvents).toBeUndefined();
  });

  describe('ngOnInit', () => {
    it('should have 2 upcoming events', () => {
      eventsService.events.next([{
        'location': 'Oslo, Norway',
        'tooltip': 'ngVikings',
        'linkUrl': 'https://ngvikings.org/',
        'name': 'ngVikings',
        'date': {
          'start': '2099-07-25',
          'end': '2099-07-26'
        },
        'workshopsDate': {
          'start': '2099-07-27',
          'end': '2099-07-27'
        }
      },
      {
        'location': 'Salt Lake City, Utah',
        'tooltip': 'ng-conf',
        'linkUrl': 'https://ng-conf.org/',
        'name': 'ng-conf  ',
        'date': {
          'start': '2099-06-20',
          'end': '2099-06-20'
        }
      },
      {
        'location': 'Delhi, India',
        'tooltip': 'ngIndia',
        'linkUrl': 'https://www.ng-ind.com/',
        'name': 'ngIndia',
        'date': {
          'start': '2020-02-29',
          'end': '2020-02-29'
        }
      }]);
      expect(component.upcomingEvents.length).toEqual(2);
    });

    it('should have 4 past events', () => {
      eventsService.events.next([
      {
        'location': 'Salt Lake City, Utah',
        'tooltip': 'ng-conf',
        'linkUrl': 'https://ng-conf.org/',
        'name': 'ng-conf  ',
        'date': {
          'start': '2099-06-20',
          'end': '2099-06-20'
        }
      },
      {
        'location': 'Rome, Italy',
        'tooltip': 'NG Rome MMXIX - The Italian Angular Conference',
        'linkUrl': 'https://ngrome.io',
        'name': 'NG Rome MMXIX',
        'date': {
          'start': '2019-10-07',
          'end': '2019-10-07'
        },
        'workshopsDate': {
          'start': '2019-10-06',
          'end': '2019-10-06'
        }
      },
      {
        'location': 'London, UK',
        'tooltip': 'AngularConnect',
        'linkUrl': 'https://www.angularconnect.com/?utm_source=angular.io&utm_medium=referral',
        'name': 'AngularConnect',
        'date': {
          'start': '2019-09-19',
          'end': '2019-09-20'
        }
      },
      {
        'location': 'Berlin, Germany',
        'tooltip': 'NG-DE',
        'linkUrl': 'https://ng-de.org/',
        'name': 'NG-DE',
        'date': {
          'start': '2019-08-30',
          'end': '2019-08-31'
        },
        'workshopsDate': {
          'start': '2019-08-29',
          'end': '2019-08-29'
        }
      },
      {
        'location': 'Oslo, Norway',
        'tooltip': 'ngVikings',
        'linkUrl': 'https://ngvikings.org/',
        'name': 'ngVikings',
        'date': {
          'start': '2018-07-26',
          'end': '2018-07-26'
        },
        'workshopsDate': {
          'start': '2018-07-27',
          'end': '2018-07-27'
        }
      }]);
      expect(component.pastEvents.length).toEqual(4);
    });
  });

  describe('Getting event dates if no workshop date', () => {
    it('should return only conference date', () => {
      const datestring = component.getEventDates({
            'location': 'Salt Lake City, Utah',
            'tooltip': 'ng-conf',
            'linkUrl': 'https://ng-conf.org/',
            'name': 'ng-conf  ',
            'date': {
              'start': '2020-06-20',
              'end': '2020-06-20'
            }
          });
      expect(datestring).toEqual('June 20, 2020');
    });

    it('should return only conference date with changing months if date is in two diffrent months', () => {
      const datestring = component.getEventDates({
        'location': 'Prague, Czech Republic',
        'tooltip': 'ReactiveConf',
        'linkUrl': 'https://reactiveconf.com/',
        'name': 'ReactiveConf',
        'date': {
          'start': '2019-10-30',
          'end': '2019-11-01'
        }
      });
      expect(datestring).toEqual('October 30 - November 1, 2019');
    });

    it('should return only conference date with "- lastdate" if conference over multiple days', () => {
      const datestring = component.getEventDates({
        'location': 'London, UK',
        'tooltip': 'AngularConnect',
        'linkUrl': 'https://www.angularconnect.com/?utm_source=angular.io&utm_medium=referral',
        'name': 'AngularConnect',
        'date': {
          'start': '2019-09-19',
          'end': '2019-09-20'
        }
      });
      expect(datestring).toEqual('September 19-20, 2019');
    });
  });

  describe('Getting event dates if workshop date', () => {
    it('should return conference date with different days, workshopdate', () => {
      const datestring = component.getEventDates({
            'location': 'Oslo, Norway',
            'tooltip': 'ngVikings',
            'linkUrl': 'https://ngvikings.org/',
            'name': 'ngVikings',
            'date': {
              'start': '2020-07-25',
              'end': '2020-07-26'
            },
            'workshopsDate': {
              'start': '2020-07-27',
              'end': '2020-07-27'
            }
          });
      expect(datestring).toEqual('July 25-26 (conference), July 27 (workshops), 2020');
    });

    it('should return workshop date, conference date if workshop before conf date', () => {
      const datestring = component.getEventDates({
        'location': 'Rome, Italy',
        'tooltip': 'NG Rome MMXIX - The Italian Angular Conference',
        'linkUrl': 'https://ngrome.io',
        'name': 'NG Rome MMXIX',
        'date': {
          'start': '2019-10-07',
          'end': '2019-10-07'
        },
        'workshopsDate': {
          'start': '2019-10-06',
          'end': '2019-10-06'
        }
      });
      expect(datestring).toEqual('October 6 (workshops), October 7 (conference), 2019');
    });

    it('should return workshop date, conference date if workshop before conference date', () => {
      const datestring = component.getEventDates({
        'location': 'Berlin, Germany',
        'tooltip': 'NG-DE',
        'linkUrl': 'https://ng-de.org/',
        'name': 'NG-DE',
        'date': {
          'start': '2019-08-30',
          'end': '2019-08-31'
        },
        'workshopsDate': {
          'start': '2019-08-29',
          'end': '2019-08-29'
        }
      });
      expect(datestring).toEqual('August 29 (workshops), August 30-31 (conference), 2019');
    });

    it('should return only conference date, wokshop date if workshop after conference', () => {
      const datestring = component.getEventDates({
        'location': 'Oslo, Norway',
        'tooltip': 'ngVikings',
        'linkUrl': 'https://ngvikings.org/',
        'name': 'ngVikings',
        'date': {
          'start': '2018-07-26',
          'end': '2018-07-26'
        },
        'workshopsDate': {
          'start': '2018-07-27',
          'end': '2018-07-27'
        }
      });
      expect(datestring).toEqual('July 26 (conference), July 27 (workshops), 2018');
    });

    it('should return conference date and workshop date with different days and months, starting with confrence date', () => {
      const datestring = component.getEventDates({
            'location': 'Oslo, Norway',
            'tooltip': 'ngVikings',
            'linkUrl': 'https://ngvikings.org/',
            'name': 'ngVikings',
            'date': {
              'start': '2020-07-30',
              'end': '2020-07-31'
            },
            'workshopsDate': {
              'start': '2020-08-01',
              'end': '2020-08-02'
            }
          });
      expect(datestring).toEqual('July 30-31 (conference), August 1-2 (workshops), 2020');
    });

    it('should return conference date and workshop date with different days and months, starting with workshopdate', () => {
      const datestring = component.getEventDates({
            'location': 'Oslo, Norway',
            'tooltip': 'ngVikings',
            'linkUrl': 'https://ngvikings.org/',
            'name': 'ngVikings',
            'date': {
              'start': '2020-08-01',
              'end': '2020-08-02'
            },
            'workshopsDate': {
              'start': '2020-07-30',
              'end': '2020-07-31'
            }
          });
      expect(datestring).toEqual('July 30-31 (workshops), August 1-2 (conference), 2020');
    });

  });
});

class TestEventService {
  events = new Subject<Event[]>();
}
