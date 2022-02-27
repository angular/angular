/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, AUTO_STYLE, NoopAnimationPlayer, ɵStyleDataMap} from '@angular/animations';
import {AnimationDriver, ɵallowPreviousPlayerStylesMerge as allowPreviousPlayerStylesMerge, ɵcontainsElement as containsElement, ɵgetParentElement as getParentElement, ɵinvokeQuery as invokeQuery, ɵnormalizeKeyframes as normalizeKeyframes, ɵvalidateStyleProperty as validateStyleProperty,} from '@angular/animations/browser';

import {validateWebAnimatableStyleProperty} from '../../src/render/shared';
import {camelCaseToDashCase} from '../../src/util';

/**
 * @publicApi
 */
export class MockAnimationDriver implements AnimationDriver {
  static log: AnimationPlayer[] = [];

  validateStyleProperty(prop: string): boolean {
    return validateStyleProperty(prop);
  }

  validateAnimatableStyleProperty(prop: string): boolean {
    const cssProp = camelCaseToDashCase(prop);
    return validateWebAnimatableStyleProperty(cssProp);
  }

  matchesElement(_element: any, _selector: string): boolean {
    return false;
  }

  containsElement(elm1: any, elm2: any): boolean {
    return containsElement(elm1, elm2);
  }

  getParentElement(element: unknown): unknown {
    return getParentElement(element);
  }

  query(element: any, selector: string, multi: boolean): any[] {
    return invokeQuery(element, selector, multi);
  }

  computeStyle(element: any, prop: string, defaultValue?: string): string {
    return defaultValue || '';
  }

  animate(
      element: any, keyframes: Array<ɵStyleDataMap>, duration: number, delay: number,
      easing: string, previousPlayers: any[] = []): MockAnimationPlayer {
    const player =
        new MockAnimationPlayer(element, keyframes, duration, delay, easing, previousPlayers);
    MockAnimationDriver.log.push(<AnimationPlayer>player);
    return player;
  }
}

/**
 * @publicApi
 */
export class MockAnimationPlayer extends NoopAnimationPlayer {
  private __finished = false;
  private __started = false;
  public previousStyles: ɵStyleDataMap = new Map();
  private _onInitFns: (() => any)[] = [];
  public currentSnapshot: ɵStyleDataMap = new Map();
  private _keyframes: Array<ɵStyleDataMap> = [];

  constructor(
      public element: any, public keyframes: Array<ɵStyleDataMap>, public duration: number,
      public delay: number, public easing: string, public previousPlayers: any[]) {
    super(duration, delay);

    this._keyframes = normalizeKeyframes(keyframes);

    if (allowPreviousPlayerStylesMerge(duration, delay)) {
      previousPlayers.forEach(player => {
        if (player instanceof MockAnimationPlayer) {
          const styles = player.currentSnapshot;
          styles.forEach((val, prop) => this.previousStyles.set(prop, val));
        }
      });
    }
  }

  /* @internal */
  onInit(fn: () => any) {
    this._onInitFns.push(fn);
  }

  /* @internal */
  override init() {
    super.init();
    this._onInitFns.forEach(fn => fn());
    this._onInitFns = [];
  }

  override reset() {
    super.reset();
    this.__started = false;
  }

  override finish(): void {
    super.finish();
    this.__finished = true;
  }

  override destroy(): void {
    super.destroy();
    this.__finished = true;
  }

  /* @internal */
  triggerMicrotask() {}

  override play(): void {
    super.play();
    this.__started = true;
  }

  override hasStarted() {
    return this.__started;
  }

  beforeDestroy() {
    const captures: ɵStyleDataMap = new Map();

    this.previousStyles.forEach((val, prop) => captures.set(prop, val));

    if (this.hasStarted()) {
      // when assembling the captured styles, it's important that
      // we build the keyframe styles in the following order:
      // {other styles within keyframes, ... previousStyles }
      this._keyframes.forEach(kf => {
        for (let [prop, val] of kf) {
          if (prop !== 'offset') {
            captures.set(prop, this.__finished ? val : AUTO_STYLE);
          }
        }
      });
    }

    this.currentSnapshot = captures;
  }
}
