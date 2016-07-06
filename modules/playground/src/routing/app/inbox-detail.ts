/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, AppModule} from '@angular/core';
import {ROUTER_DIRECTIVES, ActivatedRoute, provideRoutes} from '@angular/router';
import {PromiseWrapper} from '@angular/core/src/facade/async';
import {InboxRecord, DbService} from './inbox-app';

@Component(
    {selector: 'inbox-detail', directives: ROUTER_DIRECTIVES, templateUrl: 'app/inbox-detail.html'})
export class InboxDetailCmp {
  private record: InboxRecord = new InboxRecord();
  private ready: boolean = false;

  constructor(db: DbService, route: ActivatedRoute) {
    route.params.forEach(p => {
      PromiseWrapper.then(db.email(p['id']), (data) => { this.record.setData(data); });
    });
  }
}

@AppModule({
  providers: [provideRoutes([{path: ':id', component: InboxDetailCmp}])],
  precompile: [InboxDetailCmp]
})
export default class InboxDetailModule {}