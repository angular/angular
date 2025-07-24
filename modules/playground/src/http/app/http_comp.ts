/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpClient} from '@angular/common/http';
import {Component} from '@angular/core';

@Component({
  selector: 'http-app',
  template: `
    <h1>people</h1>
    <ul class="people">
      <li *ngFor="let person of people">hello, {{ person.name }}</li>
    </ul>
  `,
  standalone: false,
})
export class HttpCmp {
  people: {name: string}[] = [];
  constructor(http: HttpClient) {
    http
      .get('./people.json')
      .subscribe((people: unknown) => (this.people = people as {name: string}[]));
  }
}
