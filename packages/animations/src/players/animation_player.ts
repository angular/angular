/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Provides programmatic control of a reusable animation sequence,
 * built using the <code>[AnimationBuilder.build](api/animations/AnimationBuilder#build)()</code>
 * method which returns an `AnimationFactory`, whose
 * <code>[create](api/animations/AnimationFactory#create)()</code> method instantiates and
 * initializes this interface.
 *
 * @see {@link AnimationBuilder}
 * @see {@link AnimationFactory}
 * @see {@link animate}
 *
 * @publicApi
 */
export interface AnimationPlayer {
  /**
   * Provides a callback to invoke when the animation finishes.
   * @param fn The callback function.
   * @see {@link #finish}
   */
  onDone(fn: () => void): void;
  /**
   * Provides a callback to invoke when the animation starts.
   * @param fn The callback function.
   * @see {@link #play}
   */
  onStart(fn: () => void): void;
  /**
   * Provides a callback to invoke after the animation is destroyed.
   * @param fn The callback function.
   * @see {@link #destroy}
   * @see {@link #beforeDestroy}
   */
  onDestroy(fn: () => void): void;
  /**
   * Initializes the animation.
   */
  init(): void;
  /**
   * Reports whether the animation has started.
   * @returns True if the animation has started, false otherwise.
   */
  hasStarted(): boolean;
  /**
   * Runs the animation, invoking the `onStart()` callback.
   */
  play(): void;
  /**
   * Pauses the animation.
   */
  pause(): void;
  /**
   * Restarts the paused animation.
   */
  restart(): void;
  /**
   * Ends the animation, invoking the `onDone()` callback.
   */
  finish(): void;
  /**
   * Destroys the animation, after invoking the `beforeDestroy()` callback.
   * Calls the `onDestroy()` callback when destruction is completed.
   */
  destroy(): void;
  /**
   * Resets the animation to its initial state.
   */
  reset(): void;
  /**
   * Sets the position of the animation.
   * @param position A fractional value, representing the progress through the animation.
   */
  setPosition(position: number): void;
  /**
   * Reports the current position of the animation.
   * @returns A fractional value, representing the progress through the animation.
   */
  getPosition(): number;
  /**
   * The parent of this player, if any.
   */
  parentPlayer: AnimationPlayer | null;
  /**
   * The total run time of the animation, in milliseconds.
   */
  readonly totalTime: number;
  /**
   * Provides a callback to invoke before the animation is destroyed.
   */
  beforeDestroy?: () => any;
  /**
   * @internal
   * Internal
   */
  triggerCallback?: (phaseName: string) => void;
  /**
   * @internal
   * Internal
   */
  disabled?: boolean;
}

/**
 * An empty programmatic controller for reusable animations.
 * Used internally when animations are disabled, to avoid
 * checking for the null case when an animation player is expected.
 *
 * @see {@link animate}
 * @see {@link AnimationPlayer}
 *
 * @publicApi
 */
export class NoopAnimationPlayer implements AnimationPlayer {
  private _onDoneFns: Function[] = [];
  private _onStartFns: Function[] = [];
  private _onDestroyFns: Function[] = [];
  private _originalOnDoneFns: Function[] = [];
  private _originalOnStartFns: Function[] = [];
  private _started = false;
  private _destroyed = false;
  private _finished = false;
  private _position = 0;
  public parentPlayer: AnimationPlayer | null = null;
  public readonly totalTime: number;
  constructor(duration: number = 0, delay: number = 0) {
    this.totalTime = duration + delay;
  }
  private _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach((fn) => fn());
      this._onDoneFns = [];
    }
  }
  onStart(fn: () => void): void {
    this._originalOnStartFns.push(fn);
    this._onStartFns.push(fn);
  }
  onDone(fn: () => void): void {
    this._originalOnDoneFns.push(fn);
    this._onDoneFns.push(fn);
  }
  onDestroy(fn: () => void): void {
    this._onDestroyFns.push(fn);
  }
  hasStarted(): boolean {
    return this._started;
  }
  init(): void {}
  play(): void {
    if (!this.hasStarted()) {
      this._onStart();
      this.triggerMicrotask();
    }
    this._started = true;
  }

  /** @internal */
  triggerMicrotask() {
    queueMicrotask(() => this._onFinish());
  }

  private _onStart() {
    this._onStartFns.forEach((fn) => fn());
    this._onStartFns = [];
  }

  pause(): void {}
  restart(): void {}
  finish(): void {
    this._onFinish();
  }
  destroy(): void {
    if (!this._destroyed) {
      this._destroyed = true;
      if (!this.hasStarted()) {
        this._onStart();
      }
      this.finish();
      this._onDestroyFns.forEach((fn) => fn());
      this._onDestroyFns = [];
    }
  }
  reset(): void {
    this._started = false;
    this._finished = false;
    this._onStartFns = this._originalOnStartFns;
    this._onDoneFns = this._originalOnDoneFns;
  }
  setPosition(position: number): void {
    this._position = this.totalTime ? position * this.totalTime : 1;
  }
  getPosition(): number {
    return this.totalTime ? this._position / this.totalTime : 1;
  }

  /** @internal */
  triggerCallback(phaseName: string): void {
    const methods = phaseName == 'start' ? this._onStartFns : this._onDoneFns;
    methods.forEach((fn) => fn());
    methods.length = 0;
  }
}
