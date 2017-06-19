import {Component} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import {PayloadResult} from './data-definitions';

@Component({
  selector: 'dashboard-app',
  templateUrl: './dashboard-app.html',
  styleUrls: ['./dashboard-app.css']
})
export class DashboardApp {

  /** Observable that emits all payload results from Firebase. */
  payloads: FirebaseListObservable<PayloadResult[]>;

  constructor(database: AngularFireDatabase) {
    this.payloads = database.list(`payloads`);
  }
}

