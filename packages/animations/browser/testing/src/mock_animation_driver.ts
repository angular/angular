/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationPlayer, AUTO_STYLE, NoopAnimationPlayer, ɵStyleData} from '@angular/animations';
import {AnimationDriver, ɵallowPreviousPlayerStylesMerge as allowPreviousPlayerStylesMerge, ɵcontainsElement as containsElement, ɵinvokeQuery as invokeQuery, ɵmatchesElement as matchesElement, ɵvalidateStyleProperty as validateStyleProperty} from '@angular/animations/browser';


/**
 * @publicApi
 */
export class MockAnimationDriver implements AnimationDriver {
  static log: AnimationPlayer[] = [];

  validateStyleProperty(prop: string): boolean {
    return validateStyleProperty(prop);
  }

  matchesElement(element: any, selector: string): boolean {
    return matchesElement(element, selector);
  }

  containsElement(elm1: any, elm2: any): boolean {
    return containsElement(elm1, elm2);
  }

  query(element: any, selector: string, multi: boolean): any[] {
    return invokeQuery(element, selector, multi);
  }

  computeStyle(element: any, prop: string, defaultValue?: string): string {
    return defaultValue || '';
  }

  animate(
      element: any, keyframes: {[key: string]: string|number}[], duration: number, delay: number,
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
  public previousStyles: {[key: string]: string|number} = {};
  private _onInitFns: (() => any)[] = [];
  public currentSnapshot: ɵStyleData = {};

  constructor(
      public element: any, public keyframes: {[key: string]: string|number}[],
      public duration: number, public delay: number, public easing: string,
      public previousPlayers: any[]) {
    super(duration, delay);

    if (allowPreviousPlayerStylesMerge(duration, delay)) {
      previousPlayers.forEach(player => {
        if (player instanceof MockAnimationPlayer) {
          const styles = player.currentSnapshot;
          Object.keys(styles).forEach(prop => this.previousStyles[prop] = styles[prop]);
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
    const captures: ɵStyleData = {};

    Object.keys(this.previousStyles).forEach(prop => {
      captures[prop] = this.previousStyles[prop];
    });

    if (this.hasStarted()) {
      // when assembling the captured styles, it's important that
      // we build the keyframe styles in the following order:
      // {other styles within keyframes, ... previousStyles }
      this.keyframes.forEach(kf => {
        Object.keys(kf).forEach(prop => {
          if (prop != 'offset') {
            captures[prop] = this.__finished ? kf[prop] : AUTO_STYLE;
          }
        });
      });
    }

    this.currentSnapshot = captures;
  }
}
