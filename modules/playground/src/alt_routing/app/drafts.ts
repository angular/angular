import {Component} from '@angular/core';
import {
  Routes,
  ROUTER_DIRECTIVES,
} from '@angular/router';
import { DbService, InboxRecord } from './inbox-app';

@Component({selector: 'drafts', templateUrl: 'app/drafts.html', directives: ROUTER_DIRECTIVES})
export default class DraftsCmp {
  items: InboxRecord[] = [];
  ready: boolean = false;

  constructor(db: DbService) {
    db.drafts().then((drafts: any[]) => {
      this.ready = true;
      this.items = drafts.map(data => new InboxRecord(data));
    });
  }
}