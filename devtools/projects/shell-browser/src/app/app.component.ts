/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private _cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    chrome.devtools.network.onNavigated.addListener(() => {
      window.location.reload();
    });

    this._cd.detectChanges();
  }
}
