/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {A11yModule, LiveAnnouncer} from '@angular/cdk/a11y';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';

@Component({
  selector: 'toolbar-demo',
  templateUrl: 'live-announcer-demo.html',
  standalone: true,
  imports: [A11yModule, MatLegacyButtonModule],
})
export class LiveAnnouncerDemo {
  constructor(private _liveAnnouncer: LiveAnnouncer) {}

  announceText(message: string) {
    this._liveAnnouncer.announce(message);
  }
}
