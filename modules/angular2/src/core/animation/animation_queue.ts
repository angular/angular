import {isPresent} from 'angular2/src/facade/lang';
import {Map} from 'angular2/src/facade/collection';
import {ObservableWrapper} from 'angular2/src/facade/async';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {AnimationPlayer} from 'angular2/src/core/animation/animation_player';
import {Injectable} from 'angular2/src/core/di';

class _AnimationQueueEntry {
  constructor(public index: number, public priority: number, public doneFn: Function) {}
}

class _AnimationPlayerEntry {
  constructor(public element: any, public priority, public player: AnimationPlayer) {}
}

@Injectable()
export class AnimationQueue {
  private _queue: _AnimationPlayerEntry[] = [];
  private _activeElementAnimation = new Map<any, _AnimationPlayerEntry>();
  private _queuedElementAnimation = new Map<any, _AnimationQueueEntry>();

  constructor(private _zone: NgZone) {
    ObservableWrapper.subscribe(this._zone.onMicrotaskEmpty,
                                (e) => { this._zone.runOutsideAngular(() => this.flush()); });
  }

  public schedule(element: any, priority: number, player: AnimationPlayer, doneFn: Function): void {
    var index = this._queue.length;
    var queueEntry = new _AnimationQueueEntry(index, priority, doneFn);
    var queuedAnimation = this._queuedElementAnimation.get(element);
    var playerEntry = new _AnimationPlayerEntry(element, priority, player);

    var activeAnimation = this._activeElementAnimation.get(element);
    if (isPresent(activeAnimation)) {
      if (activeAnimation.priority > priority) {
        doneFn();
        return;
      }
      activeAnimation.player.finish();
    }

    if (isPresent(queuedAnimation)) {
      if (queuedAnimation.priority > priority) {
        doneFn();
        return;
      }

      this._queue[queuedAnimation.index] = playerEntry;
      queuedAnimation.doneFn();
    } else {
      this._queue.push(playerEntry);
    }

    player.onDone(() => doneFn());
    this._queuedElementAnimation.set(element, queueEntry);
  }

  public flush(): void {
    NgZone.assertNotInAngularZone();
    this._queue.forEach(playerEntry => {
      var element = playerEntry.element;
      this._activeElementAnimation.set(element, playerEntry);

      var player = playerEntry.player;
      player.onDone(() => { this._activeElementAnimation.delete(element); });
      player.play();
    });
    this._queue = [];
    this._queuedElementAnimation.clear();
  }
}
