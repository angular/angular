/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

export interface Person {
  name: string;
  age: number;
}

@Component({
  template: `
    <div *ngFor="let person of ~{people_1}people_1~{people_1-end}">
      <span>{{person.name}}</span>
    </div>`,
})
export class UnknownPeople {
}

@Component({
  template: `
    <div ~{even_1}*ngFor="let person of people; let e = even_1"~{even_1-end}>
      <span>{{person.name}}</span>
    </div>`,
})
export class UnknownEven {
  people: Person[];
}

@Component({
  template: `
    <div *ngFor="let person of people; trackBy ~{trackBy_1}trackBy_1~{trackBy_1-end}">
      <span>{{person.name}}</span>
    </div>`,
})
export class UnknownTrackBy {
  people: Person[];
}
