/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NoopAnimationPlayer, ɵStyleDataMap} from '@angular/animations';

import {hypenatePropsKeys} from '../shared';

export class DirectStylePlayer extends NoopAnimationPlayer {
  private _startingStyles: ɵStyleDataMap|null = new Map();
  private __initialized = false;
  private _styles: ɵStyleDataMap;

  constructor(public element: any, styles: ɵStyleDataMap) {
    super();
    this._styles = hypenatePropsKeys(styles);
  }

  override init() {
    if (this.__initialized || !this._startingStyles) return;
    this.__initialized = true;
    this._styles.forEach((_, prop) => {
      this._startingStyles!.set(prop, this.element.style[prop]);
    });
    super.init();
  }

  override play() {
    if (!this._startingStyles) return;
    this.init();
    this._styles.forEach((val, prop) => this.element.style.setProperty(prop, val));
    super.play();
  }

  override destroy() {
    if (!this._startingStyles) return;
    this._startingStyles.forEach((value, prop) => {
      if (value) {
        this.element.style.setProperty(prop, value);
      } else {
        this.element.style.removeProperty(prop);
      }
    });
    this._startingStyles = null;
    super.destroy();
  }
}
