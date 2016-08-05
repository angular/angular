/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {PromiseWrapper} from '@angular/core/src/facade/async';
import {ActivatedRoute, RouterModule} from '@angular/router';

import {DbService, InboxRecord} from './inbox-app';

@Component({selector: 'inbox-detail', templateUrl: 'app/inbox-detail.html'})
export class InboxDetailCmp {
  private record: InboxRecord = new InboxRecord();
  private ready: boolean = false;

  constructor(db: DbService, route: ActivatedRoute) {
    route.params.forEach(
        p => { PromiseWrapper.then(db.email(p['id']), (data) => { this.record.setData(data); }); });
  }
}

@NgModule({
  declarations: [InboxDetailCmp],
  imports: [RouterModule.forChild([{path: ':id', component: InboxDetailCmp}])]
})
export default class InboxDetailModule {
}
