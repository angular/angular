import {scheduleMicroTask} from 'angular2/src/facade/lang';

export abstract class AnimationPlayer {
  abstract onDone(fn: Function): void;
  abstract play(): void;
  abstract pause(): void;
  abstract restart(): void;
  abstract finish(): void;
  abstract destroy(): void;
  abstract reset(): void;
}

export class NoOpAnimationPlayer implements AnimationPlayer {
  private _subscriptions = [];
  constructor() {
    scheduleMicroTask(() => {
      this._subscriptions.forEach(entry => { entry(); });
      this._subscriptions = [];
    });
  }
  onDone(fn: Function): void { this._subscriptions.push(fn); }
  play(): void {}
  pause(): void {}
  restart(): void {}
  finish(): void {}
  destroy(): void {}
  reset(): void {}
}
