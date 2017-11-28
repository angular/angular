import {Component} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {CoverageResult, PayloadResult} from './data-definitions';

@Component({
  selector: 'dashboard-app',
  templateUrl: './dashboard-app.html',
  styleUrls: ['./dashboard-app.scss']
})
export class DashboardApp {

  /** Observable that emits all payload results from Firebase. */
  payloads: Observable<PayloadResult[]>;

  /** Observable that emits all coverage reports from Firebase. */
  coverage: Observable<CoverageResult[]>;

  constructor(database: AngularFireDatabase) {
    this.payloads = database.list<PayloadResult>('payloads').valueChanges();
    this.coverage = database.list<CoverageResult>('coverage-reports').valueChanges();
  }
}

