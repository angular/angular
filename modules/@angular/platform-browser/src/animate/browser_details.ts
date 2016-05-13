import {Injectable} from '@angular/core';
import {Math} from '../../src/facade/math';
import {getDOM} from '../dom/dom_adapter';

@Injectable()
export class BrowserDetails {
  elapsedTimeIncludesDelay = false;

  constructor() { this.doesElapsedTimeIncludesDelay(); }

  /**
   * Determines if `event.elapsedTime` includes transition delay in the current browser.  At this
   * time, Chrome and Opera seem to be the only browsers that include this.
   */
  doesElapsedTimeIncludesDelay(): void {
    var div = getDOM().createElement('div');
    getDOM().setAttribute(div, 'style',
                          `position: absolute; top: -9999px; left: -9999px; width: 1px;
      height: 1px; transition: all 1ms linear 1ms;`);
    // Firefox requires that we wait for 2 frames for some reason
    this.raf((timestamp: any) => {
      getDOM().on(div, 'transitionend', (event: any) => {
        var elapsed = Math.round(event.elapsedTime * 1000);
        this.elapsedTimeIncludesDelay = elapsed == 2;
        getDOM().remove(div);
      });
      getDOM().setStyle(div, 'width', '2px');
    }, 2);
  }

  raf(callback: Function, frames: number = 1): Function {
    var queue: RafQueue = new RafQueue(callback, frames);
    return () => queue.cancel();
  }
}

class RafQueue {
  currentFrameId: number;
  constructor(public callback: Function, public frames: number) { this._raf(); }
  private _raf() {
    this.currentFrameId =
        getDOM().requestAnimationFrame((timestamp: number) => this._nextFrame(timestamp));
  }
  private _nextFrame(timestamp: number) {
    this.frames--;
    if (this.frames > 0) {
      this._raf();
    } else {
      this.callback(timestamp);
    }
  }
  cancel() {
    getDOM().cancelAnimationFrame(this.currentFrameId);
    this.currentFrameId = null;
  }
}
