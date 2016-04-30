import {Component, Injectable} from 'angular2/core';
import {
  Routes,
  Route,
  Router,
  ROUTER_DIRECTIVES,
  ROUTER_PROVIDERS,
  OnActivate,
  RouteSegment,
  Tree,
} from 'angular2/alt_router';
import * as db from './data';
import {Location} from 'angular2/platform/common';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {isPresent, DateWrapper} from 'angular2/src/facade/lang';
import {PromiseCompleter} from 'angular2/src/facade/promise';

class InboxRecord {
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
    date: string, draft?: boolean
  } = null) {
    if (isPresent(data)) {
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
    date: string, draft?: boolean
  }) {
    this.id = record['id'];
    this.subject = record['subject'];
    this.content = record['content'];
    this.email = record['email'];
    this.firstName = record['first-name'];
    this.lastName = record['last-name'];
    this.date = record['date'];
    this.draft = record['draft'] == true;
  }
}

@Injectable()
class DbService {
  getData(): Promise<any[]> {
    var p = new PromiseCompleter<any[]>();
    p.resolve(db.data);
    return p.promise;
  }

  drafts(): Promise<any[]> {
    return this.getData().then(
        (data: any[]): any[] =>
            data.filter(record => isPresent(record['draft']) && record['draft'] == true));
  }

  emails(): Promise<any[]> {
    return this.getData().then((data: any[]): any[] =>
                                   data.filter(record => !isPresent(record['draft'])));
  }

  email(id): Promise<any> {
    return PromiseWrapper.then(this.getData(), (data: any[]) => {
      for (var i = 0; i < data.length; i++) {
        var entry = data[i];
        if (entry['id'] == id) {
          return entry;
        }
      }
      return null;
    });
  }
}

@Component(
    {selector: 'inbox-detail', directives: ROUTER_DIRECTIVES, templateUrl: 'inbox-detail.html'})
class InboxDetailCmp implements OnActivate {
  record: InboxRecord = new InboxRecord();
  ready: boolean = false;

  constructor(private _db: DbService) {}

  routerOnActivate(curr: RouteSegment, prev?: RouteSegment, currTree?: Tree<RouteSegment>,
                   prevTree?: Tree<RouteSegment>): void {
    let id = curr.getParam("id");
    this._db.email(id).then(data => this.record.setData(data));
  }
}

@Component({selector: 'inbox', templateUrl: 'inbox.html', directives: ROUTER_DIRECTIVES})
class InboxCmp implements OnActivate {
  items: InboxRecord[] = [];
  ready: boolean = false;

  constructor(private _db: DbService) {}

  routerOnActivate(curr: RouteSegment, prev?: RouteSegment, currTree?: Tree<RouteSegment>,
                   prevTree?: Tree<RouteSegment>): void {
    var sortType = curr.getParam('sort');
    var sortEmailsByDate = isPresent(sortType) && sortType == "date";

    PromiseWrapper.then(this._db.emails(), (emails: any[]) => {
      this.ready = true;
      this.items = emails.map(data => new InboxRecord(data));

      if (sortEmailsByDate) {
        this.items.sort((a: InboxRecord, b: InboxRecord) =>
                            DateWrapper.toMillis(DateWrapper.fromISOString(a.date)) <
                                    DateWrapper.toMillis(DateWrapper.fromISOString(b.date)) ?
                                -1 :
                                1);
      }
    });
  }
}


@Component({selector: 'drafts', templateUrl: 'drafts.html', directives: ROUTER_DIRECTIVES})
class DraftsCmp {
  items: InboxRecord[] = [];
  ready: boolean = false;

  constructor(db: DbService) {
    PromiseWrapper.then(db.drafts(), (drafts: any[]) => {
      this.ready = true;
      this.items = drafts.map(data => new InboxRecord(data));
    });
  }
}

@Component({
  selector: 'inbox-app',
  providers: [DbService, ROUTER_PROVIDERS],
  templateUrl: 'inbox-app.html',
  directives: ROUTER_DIRECTIVES,
})
@Routes([
  new Route({path: '/', component: InboxCmp}),
  new Route({path: '/drafts', component: DraftsCmp}),
  new Route({path: '/detail/:id', component: InboxDetailCmp})
])
export class InboxApp {
  constructor(private _location: Location) {}
  inboxPageActive() { return this._location.path() == ''; }
  draftsPageActive() { return this._location.path() == '/drafts'; }
}
