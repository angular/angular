/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/

import {Component, OnInit, NgZone } from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import {QueryResults, SearchWorkerClient} from './search-worker-client';


@Component({
  selector: 'my-app',
  template: `
    <h1>Angular Docs Search</h1>
    <div class="search-bar"><input [formControl]="searchInput"></div>
    <div class="search-results">
      <div *ngIf="!(indexReady | async)">Waiting...</div>
      <ul>
      <li *ngFor="let result of (searchResult$ | async)">
        <a href="{{result.path}}">{{ result.title }} ({{result.type}})</a>
      </li>
      </ul>
    </div>
  `
})
export class AppComponent implements OnInit {
  searchResult$: Observable<QueryResults>;
  indexReady: Promise<boolean>;
  searchInput: FormControl;

  constructor(private zone: NgZone) {}

  ngOnInit() {
    const searchWorker = new SearchWorkerClient('app/search-worker.js', this.zone);
    this.indexReady = searchWorker.ready;
    this.searchInput = new FormControl();
    this.searchResult$ = this.searchInput.valueChanges
      .switchMap((searchText: string) => searchWorker.search(searchText));
  }
}
