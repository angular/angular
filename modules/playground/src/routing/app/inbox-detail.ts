/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {ActivatedRoute, RouterModule} from '@angular/router';

import {DbService, InboxRecord} from './inbox-app';

@Component({selector: 'inbox-detail', templateUrl: './inbox-detail.html'})
export class InboxDetailCmp {
  record: InboxRecord = new InboxRecord();
  private ready: boolean = false;

  constructor(db: DbService, route: ActivatedRoute) {
    route.paramMap.forEach(p => {
      db.email(p.get('id')).then((data) => {
        this.record.setData(data);
      });
    });
  }
}

@NgModule({
  declarations: [InboxDetailCmp],
  imports: [RouterModule.forChild([{path: ':id', component: InboxDetailCmp}])]
})
export default class InboxDetailModule {
}
