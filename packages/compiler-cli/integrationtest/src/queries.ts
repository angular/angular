/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, QueryList, ViewChild, ViewChildren} from '@angular/core';

@Component({selector: 'comp-for-child-query', template: 'child'})
export class CompForChildQuery {
}

@Component(
    {selector: 'comp-with-child-query', template: '<comp-for-child-query></comp-for-child-query>'})
export class CompWithChildQuery {
  @ViewChild(CompForChildQuery, {static: true}) child: CompForChildQuery;
  @ViewChildren(CompForChildQuery) children: QueryList<CompForChildQuery>;
}

@Directive({selector: '[directive-for-query]'})
export class DirectiveForQuery {
}

@Component({
  selector: 'comp-with-directive-child',
  template: `<div>
     <div *ngFor="let data of divData" directive-for-query>{{data}}</div>
  </div>`
})
export class CompWithDirectiveChild {
  @ViewChildren(DirectiveForQuery) children: QueryList<DirectiveForQuery>;

  divData: string[];
}
