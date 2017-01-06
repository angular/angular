/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'rxjs/add/operator/map';

import {Component} from '@angular/core';
import {Http, Response} from '@angular/http';

@Component({
  selector: 'http-app',
  template: `
    <h1>people</h1>
    <ul class="people">
      <li *ngFor="let person of people">
        hello, {{person['name']}}
      </li>
    </ul>
  `
})
export class HttpCmp {
  people: Object[];
  constructor(http: Http) {
    http.get('./people.json')
        .map((res: Response) => res.json())
        .subscribe((people: Array<Object>) => this.people = people);
  }
}
