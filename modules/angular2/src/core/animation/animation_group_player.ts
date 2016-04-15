import {isPresent} from 'angular2/src/facade/lang';
import {AnimationPlayer} from 'angular2/src/core/animation/animation_player';
import {scheduleMicroTask} from 'angular2/src/facade/lang';

export class AnimationGroupPlayer implements AnimationPlayer {
  private _subscriptions: Function[] = [];
  public parentPlayer: AnimationPlayer = null;

  constructor(private _players: AnimationPlayer[]) {
    var count = 0;
    var total = this._players.length;
    if (total == 0) {
      scheduleMicroTask(() => this._onFinish());
    } else {
      this._players.forEach(player => {
        player.parentPlayer = this;
        player.onDone(() => {
          if (++count >= total) {
            this._onFinish();
          }
        });
      });
    }
  }

  private _onFinish() {
    if (!isPresent(this.parentPlayer)) {
      this.destroy();
    }
    this._subscriptions.forEach(subscription => subscription());
    this._subscriptions = [];
  }

  onDone(fn: Function): void { this._subscriptions.push(fn); }

  play() { this._players.forEach(player => player.play()); }

  pause(): void { this._players.forEach(player => player.pause()); }

  restart(): void { this._players.forEach(player => player.restart()); }

  finish(): void { this._players.forEach(player => player.finish()); }

  destroy(): void { this._players.forEach(player => player.destroy()); }

  reset(): void { this._players.forEach(player => player.reset()); }
}
