/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';

// This service is used to notify the CDK virtual scroll parents
// when the tab has changed. Alternatively, we risk to have broken
// layout since the virtual scroll is nested inside of a TabGroup
// which doesn't have consistent dimensions when collapsed and expanded.
export class TabUpdate {
  private _tabUpdate = signal<string>('');

  tabUpdate = this._tabUpdate.asReadonly();

  notify(tab: string): void {
    this._tabUpdate.set(tab);
  }
}
