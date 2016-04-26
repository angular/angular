import {AnimationPlayer} from 'angular2/src/core/animation/animation_player';
import {DomAnimatePlayer} from 'angular2/src/platform/dom/animation/dom_animate_player';

export class WebAnimationsPlayer implements AnimationPlayer {
  private _subscriptions: Function[] = [];
  private _finished = false;

  constructor(private _player: DomAnimatePlayer) {
    // this is required to make the player startable at a later time
    this.reset();
    this._player.onfinish = () => this._onFinish();
  }

  private _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._subscriptions.forEach(fn => fn());
      this._subscriptions = [];
    }
  }

  onDone(fn: Function): void { this._subscriptions.push(fn); }

  play(): void { this._player.play(); }

  pause(): void { this._player.pause(); }

  finish(): void { this._player.finish(); }

  reset(): void { this._player.cancel(); }

  restart(): void {
    this.reset();
    this.play();
  }

  destroy(): void {
    this.reset();
    this._onFinish();
  }
}
