import {Component, Injectable} from 'angular2/core';
import {RouterLink, RouteConfig, Router, Route, RouterOutlet, RouteParams} from 'angular2/router';
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

@Component({selector: 'inbox-detail', directives: [RouterLink], templateUrl: 'inbox-detail.html'})
class InboxDetailCmp {
  record: InboxRecord = new InboxRecord();
  ready: boolean = false;

  constructor(db: DbService, params: RouteParams) {
    var id = params.get('id');
    PromiseWrapper.then(db.email(id), (data) => { this.record.setData(data); });
  }
}

@Component({selector: 'inbox', templateUrl: 'inbox.html', directives: [RouterLink]})
class InboxCmp {
  items: InboxRecord[] = [];
  ready: boolean = false;

  constructor(public router: Router, db: DbService, params: RouteParams) {
    var sortType = params.get('sort');
    var sortEmailsByDate = isPresent(sortType) && sortType == "date";

    PromiseWrapper.then(db.emails(), (emails: any[]) => {
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


@Component({selector: 'drafts', templateUrl: 'drafts.html', directives: [RouterLink]})
class DraftsCmp {
  items: InboxRecord[] = [];
  ready: boolean = false;

  constructor(public router: Router, db: DbService) {
    PromiseWrapper.then(db.drafts(), (drafts: any[]) => {
      this.ready = true;
      this.items = drafts.map(data => new InboxRecord(data));
    });
  }
}

@Component({
  selector: 'inbox-app',
  viewProviders: [DbService],
  templateUrl: 'inbox-app.html',
  directives: [RouterOutlet, RouterLink]
})
@RouteConfig([
  new Route({path: '/', component: InboxCmp, name: 'Inbox'}),
  new Route({path: '/drafts', component: DraftsCmp, name: 'Drafts'}),
  new Route({path: '/detail/:id', component: InboxDetailCmp, name: 'DetailPage'})
])
export class InboxApp {
  router: Router;
  location: Location;
  constructor(router: Router, location: Location) {
    this.router = router;
    this.location = location;
  }
  inboxPageActive() { return this.location.path() == ''; }
  draftsPageActive() { return this.location.path() == '/drafts'; }
}
