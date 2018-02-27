// #docplaster
// #docregion
import { Injectable, OnDestroy } from '@angular/core';

import { Observable, of } from 'rxjs';
import { delay }      from 'rxjs/operators';

export class Contact {
  constructor(public id: number, public name: string) { }
}

const CONTACTS: Contact[] = [
  new Contact(21, 'Sam Spade'),
  new Contact(22, 'Nick Danger'),
  new Contact(23, 'Nancy Drew')
];

const FETCH_LATENCY = 500;

/** Simulate a data service that retrieves contacts from a server */
@Injectable()
export class ContactService implements OnDestroy {
// #enddocregion
  constructor() { console.log('ContactService instance created.'); }
  ngOnDestroy() { console.log('ContactService instance destroyed.'); }

// #docregion
  getContacts(): Observable<Contact[]> {
    return of(CONTACTS).pipe(delay(FETCH_LATENCY));
  }

  getContact(id: number | string): Observable<Contact> {
    return of(CONTACTS.find(contact => contact.id === +id))
      .pipe(delay(FETCH_LATENCY));
  }
}
// #enddocregion
