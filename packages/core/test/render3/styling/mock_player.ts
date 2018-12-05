/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Subject} from 'rxjs';

import {PlayState, Player} from '../../../src/render3/interfaces/player';

export class MockPlayer implements Player {
  private _subject = new Subject<PlayState|string>();
  parent: Player|null = null;

  data: any;
  log: string[] = [];
  state: PlayState = PlayState.Pending;

  getStatus() { return this._subject; }

  constructor(public value?: any) {}

  play(): void {
    if (this.state < PlayState.Paused) {
      this._subject.next(this.state = PlayState.Running);
    }
  }

  pause(): void {
    if (this.state !== PlayState.Paused) {
      this._subject.next(this.state = PlayState.Paused);
    }
  }

  finish(): void {
    if (this.state < PlayState.Finished) {
      this._subject.next(this.state = PlayState.Finished);
    }
  }

  destroy(): void {
    if (this.state < PlayState.Destroyed) {
      this._subject.next(this.state = PlayState.Destroyed);
    }
  }
}
