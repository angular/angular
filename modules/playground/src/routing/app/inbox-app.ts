/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {Component, Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import * as db from './data';

export class InboxRecord {
  id: string = '';
  subject: string = '';
  content: string = '';
  email: string = '';
  firstName: string = '';
  lastName: string = '';
  date: string;
  draft: boolean = false;

  constructor(data: {
    id: string,
    subject: string,
    content: string,
    email: string,
    firstName: string,
    lastName: string,
    date: string,
    draft?: boolean
  } = null) {
    if (data) {
      this.setData(data);
    }
  }

  setData(record: {
    id: string,
    subject: string,
    content: string,
    email: string,
    firstName: string,
    lastName: string,
    date: string,
    draft?: boolean
  }) {
    this.id = record.id;
    this.subject = record.subject;
    this.content = record.content;
    this.email = record.email;
    this.firstName = record.firstName;
    this.lastName = record.lastName;
    this.date = record.date;
    this.draft = record.draft === true;
  }
}

@Injectable()
export class DbService {
  getData(): Promise<InboxRecord[]> {
    return Promise.resolve(db.data.map((entry: {[key: string]: any}) => new InboxRecord({
                                         id: entry['id'],
                                         subject: entry['subject'],
                                         content: entry['content'],
                                         email: entry['email'],
                                         firstName: entry['first-name'],
                                         lastName: entry['last-name'],
                                         date: entry['date'],
                                         draft: entry['draft'],
                                       })));
  }

  drafts(): Promise<InboxRecord[]> {
    return this.getData().then((data) => data.filter(record => record.draft));
  }

  emails(): Promise<InboxRecord[]> {
    return this.getData().then((data) => data.filter(record => !record.draft));
  }

  email(id: string): Promise<InboxRecord> {
    return this.getData().then((data) => data.find((entry) => entry.id == id));
  }
}

@Component({selector: 'inbox', templateUrl: './inbox.html'})
export class InboxCmp {
  items: InboxRecord[] = [];
  private ready: boolean = false;

  constructor(public router: Router, db: DbService, route: ActivatedRoute) {
    route.params.forEach(p => {
      const sortEmailsByDate = p['sort'] === 'date';

      db.emails().then((emails) => {
        this.ready = true;
        this.items = emails;

        if (sortEmailsByDate) {
          this.items.sort(
              (a, b) => new Date(a.date).getTime() < new Date(b.date).getTime() ? -1 : 1);
        }
      });
    });
  }
}


@Component({selector: 'drafts', templateUrl: './drafts.html'})
export class DraftsCmp {
  items: InboxRecord[] = [];
  private ready: boolean = false;

  constructor(private router: Router, db: DbService) {
    db.drafts().then((drafts) => {
      this.ready = true;
      this.items = drafts;
    });
  }
}

export const ROUTER_CONFIG = [
  {path: '', pathMatch: 'full', redirectTo: 'inbox'}, {path: 'inbox', component: InboxCmp},
  {path: 'drafts', component: DraftsCmp}, {path: 'detail', loadChildren: 'app/inbox-detail.js'}
];

@Component({selector: 'inbox-app', templateUrl: './inbox-app.html'})
export class InboxApp {
}
