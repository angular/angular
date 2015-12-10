var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { Math } from 'angular2/src/facade/math';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
export let BrowserDetails = class {
    constructor() {
        this.elapsedTimeIncludesDelay = false;
        this.doesElapsedTimeIncludesDelay();
    }
    /**
     * Determines if `event.elapsedTime` includes transition delay in the current browser.  At this
     * time, Chrome and Opera seem to be the only browsers that include this.
     */
    doesElapsedTimeIncludesDelay() {
        var div = DOM.createElement('div');
        DOM.setAttribute(div, 'style', `position: absolute; top: -9999px; left: -9999px; width: 1px;
      height: 1px; transition: all 1ms linear 1ms;`);
        // Firefox requires that we wait for 2 frames for some reason
        this.raf(timestamp => {
            DOM.on(div, 'transitionend', (event) => {
                var elapsed = Math.round(event.elapsedTime * 1000);
                this.elapsedTimeIncludesDelay = elapsed == 2;
                DOM.remove(div);
            });
            DOM.setStyle(div, 'width', '2px');
        }, 2);
    }
    raf(callback, frames = 1) {
        var queue = new RafQueue(callback, frames);
        return () => queue.cancel();
    }
};
BrowserDetails = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], BrowserDetails);
class RafQueue {
    constructor(callback, frames) {
        this.callback = callback;
        this.frames = frames;
        this._raf();
    }
    _raf() {
        this.currentFrameId = DOM.requestAnimationFrame(timestamp => this._nextFrame(timestamp));
    }
    _nextFrame(timestamp) {
        this.frames--;
        if (this.frames > 0) {
            this._raf();
        }
        else {
            this.callback(timestamp);
        }
    }
    cancel() {
        DOM.cancelAnimationFrame(this.currentFrameId);
        this.currentFrameId = null;
    }
}
