/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpClient} from '@angular/common/http';
import {Component} from '@angular/core';

@Component({
  selector: 'jsonp-app',
  template: `
    <h1>people</h1>
    <ul class="people">
      <li *ngFor="let person of people">
        hello, {{person.name}}
      </li>
    </ul>
  `
})
export class JsonpCmp {
  people: Object;
  constructor(http: HttpClient) {
    http.jsonp<Object>('./people.json', 'callback').subscribe((res: Object) => this.people = res);
  }
}
