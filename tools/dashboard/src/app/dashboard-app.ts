import {Component} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';

// This import is only used to define a generic type. The current TypeScript version incorrectly
// considers such imports as unused (https://github.com/Microsoft/TypeScript/issues/14953)
// tslint:disable-next-line:no-unused-variable
import {PayloadResult, CoverageResult} from './data-definitions';

@Component({
  selector: 'dashboard-app',
  templateUrl: './dashboard-app.html',
  styleUrls: ['./dashboard-app.scss']
})
export class DashboardApp {

  /** Observable that emits all payload results from Firebase. */
  payloads: FirebaseListObservable<PayloadResult[]>;

  /** Observable that emits all coverage reports from Firebase. */
  coverage: FirebaseListObservable<CoverageResult[]>;

  constructor(database: AngularFireDatabase) {
    this.payloads = database.list(`payloads`);
    this.coverage = database.list(`coverage-reports`);
  }
}

