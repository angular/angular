/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NoopAnimationPlayer} from '@angular/animations';
import {hypenatePropsObject} from '../shared';

export class DirectStylePlayer extends NoopAnimationPlayer {
  private _startingStyles: {[key: string]: any}|null = {};
  private __initialized = false;
  private _styles: {[key: string]: any};

  constructor(public element: any, styles: {[key: string]: any}) {
    super();
    this._styles = hypenatePropsObject(styles);
  }

  override init() {
    if (this.__initialized || !this._startingStyles) return;
    this.__initialized = true;
    Object.keys(this._styles).forEach(prop => {
      this._startingStyles![prop] = this.element.style[prop];
    });
    super.init();
  }

  override play() {
    if (!this._startingStyles) return;
    this.init();
    Object.keys(this._styles)
        .forEach(prop => this.element.style.setProperty(prop, this._styles[prop]));
    super.play();
  }

  override destroy() {
    if (!this._startingStyles) return;
    Object.keys(this._startingStyles).forEach(prop => {
      const value = this._startingStyles![prop];
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
