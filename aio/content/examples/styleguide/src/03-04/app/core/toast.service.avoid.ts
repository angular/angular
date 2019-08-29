// #docregion
// #docregion example
/* avoid */

import { Injectable } from '@angular/core';

@Injectable()
export class ToastService {
  message: string;

  private _toastCount: number;

  hide() {
    this._toastCount--;
    this._log();
  }

  show() {
    this._toastCount++;
    this._log();
  }

  private _log() {
    console.log(this.message);
  }
}
// #enddocregion example
