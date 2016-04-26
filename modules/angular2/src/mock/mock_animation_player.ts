import {AnimationPlayer} from 'angular2/src/core/animation/animation_player';

export class MockAnimationPlayer implements AnimationPlayer {
  log = [];
  private _subscriptions = [];
  private _finished = false;

  private _onfinish(): void {
    if (!this._finished) {
      this._finished = true;
      this.log.push('finish');
      this._subscriptions.forEach((entry) => { entry(); });
      this._subscriptions = [];
    }
  }

  onDone(fn: Function): void { this._subscriptions.push(fn); }

  play(): void { this.log.push('play'); }

  pause(): void { this.log.push('pause'); }

  restart(): void { this.log.push('restart'); }

  finish(): void { this._onfinish(); }

  reset(): void { this.log.push('reset'); }

  destroy(): void {
    this.finish();
    this.log.push('destroy');
  }
}
