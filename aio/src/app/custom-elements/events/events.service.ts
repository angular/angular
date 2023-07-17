import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {AsyncSubject, connectable, Observable, of} from 'rxjs';
import {catchError} from 'rxjs/operators';

import {AngularEvent} from './events.component';
import {CONTENT_URL_PREFIX} from 'app/documents/document.service';
import {Logger} from 'app/shared/logger.service';

const eventsPath = CONTENT_URL_PREFIX + 'events.json';

@Injectable()
export class EventsService {
  events: Observable<AngularEvent[]>;

  constructor(private http: HttpClient, private logger: Logger) {
    this.events = this.getEvents();
  }

  private getEvents() {
    const eventsSource = this.http.get<any>(eventsPath).pipe(
      catchError((error) => {
        this.logger.error(new Error(`${eventsPath} request failed: ${error.message}`));
        return of([]);
      })
    );
    const events = connectable(eventsSource, {
      connector: () => new AsyncSubject(),
      resetOnDisconnect: false,
    });
    events.connect();
    return events;
  }
}
