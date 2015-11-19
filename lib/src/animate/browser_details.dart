library angular2.src.animate.browser_details;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/facade/math.dart" show Math;
import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;

@Injectable()
class BrowserDetails {
  var elapsedTimeIncludesDelay = false;
  BrowserDetails() {
    this.doesElapsedTimeIncludesDelay();
  }
  /**
   * Determines if `event.elapsedTime` includes transition delay in the current browser.  At this
   * time, Chrome and Opera seem to be the only browsers that include this.
   */
  void doesElapsedTimeIncludesDelay() {
    var div = DOM.createElement("div");
    DOM.setAttribute(
        div,
        "style",
        '''position: absolute; top: -9999px; left: -9999px; width: 1px;
      height: 1px; transition: all 1ms linear 1ms;''');
    // Firefox requires that we wait for 2 frames for some reason
    this.raf((timestamp) {
      DOM.on(div, "transitionend", (dynamic event) {
        var elapsed = Math.round(event.elapsedTime * 1000);
        this.elapsedTimeIncludesDelay = elapsed == 2;
        DOM.remove(div);
      });
      DOM.setStyle(div, "width", "2px");
    }, 2);
  }

  Function raf(Function callback, [num frames = 1]) {
    RafQueue queue = new RafQueue(callback, frames);
    return () => queue.cancel();
  }
}

class RafQueue {
  Function callback;
  num frames;
  num currentFrameId;
  RafQueue(this.callback, this.frames) {
    this._raf();
  }
  _raf() {
    this.currentFrameId =
        DOM.requestAnimationFrame((timestamp) => this._nextFrame(timestamp));
  }

  _nextFrame(num timestamp) {
    this.frames--;
    if (this.frames > 0) {
      this._raf();
    } else {
      this.callback(timestamp);
    }
  }

  cancel() {
    DOM.cancelAnimationFrame(this.currentFrameId);
    this.currentFrameId = null;
  }
}
