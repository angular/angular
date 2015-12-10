var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9kZXRhaWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2FuaW1hdGUvYnJvd3Nlcl9kZXRhaWxzLnRzIl0sIm5hbWVzIjpbIkJyb3dzZXJEZXRhaWxzIiwiQnJvd3NlckRldGFpbHMuY29uc3RydWN0b3IiLCJCcm93c2VyRGV0YWlscy5kb2VzRWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5IiwiQnJvd3NlckRldGFpbHMucmFmIiwiUmFmUXVldWUiLCJSYWZRdWV1ZS5jb25zdHJ1Y3RvciIsIlJhZlF1ZXVlLl9yYWYiLCJSYWZRdWV1ZS5fbmV4dEZyYW1lIiwiUmFmUXVldWUuY2FuY2VsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ3hDLEVBQUMsSUFBSSxFQUFDLE1BQU0sMEJBQTBCO09BQ3RDLEVBQUMsR0FBRyxFQUFDLE1BQU0sdUNBQXVDO0FBRXpEO0lBSUVBO1FBRkFDLDZCQUF3QkEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFFakJBLElBQUlBLENBQUNBLDRCQUE0QkEsRUFBRUEsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFFdEREOzs7T0FHR0E7SUFDSEEsNEJBQTRCQTtRQUMxQkUsSUFBSUEsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLEdBQUdBLENBQUNBLFlBQVlBLENBQUNBLEdBQUdBLEVBQUVBLE9BQU9BLEVBQUVBO21EQUNnQkEsQ0FBQ0EsQ0FBQ0E7UUFDakRBLDZEQUE2REE7UUFDN0RBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLFNBQVNBO1lBQ2hCQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxFQUFFQSxlQUFlQSxFQUFFQSxDQUFDQSxLQUFVQTtnQkFDdENBLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBO2dCQUNuREEsSUFBSUEsQ0FBQ0Esd0JBQXdCQSxHQUFHQSxPQUFPQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDN0NBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1lBQ2xCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNIQSxHQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUFFQSxPQUFPQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNwQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDUkEsQ0FBQ0E7SUFFREYsR0FBR0EsQ0FBQ0EsUUFBa0JBLEVBQUVBLE1BQU1BLEdBQVdBLENBQUNBO1FBQ3hDRyxJQUFJQSxLQUFLQSxHQUFhQSxJQUFJQSxRQUFRQSxDQUFDQSxRQUFRQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUNyREEsTUFBTUEsQ0FBQ0EsTUFBTUEsS0FBS0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7SUFDOUJBLENBQUNBO0FBQ0hILENBQUNBO0FBN0JEO0lBQUMsVUFBVSxFQUFFOzttQkE2Qlo7QUFFRDtJQUVFSSxZQUFtQkEsUUFBa0JBLEVBQVNBLE1BQWNBO1FBQXpDQyxhQUFRQSxHQUFSQSxRQUFRQSxDQUFVQTtRQUFTQSxXQUFNQSxHQUFOQSxNQUFNQSxDQUFRQTtRQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUN0RUQsSUFBSUE7UUFDVkUsSUFBSUEsQ0FBQ0EsY0FBY0EsR0FBR0EsR0FBR0EsQ0FBQ0EscUJBQXFCQSxDQUFDQSxTQUFTQSxJQUFJQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMzRkEsQ0FBQ0E7SUFDT0YsVUFBVUEsQ0FBQ0EsU0FBaUJBO1FBQ2xDRyxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUNkQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDM0JBLENBQUNBO0lBQ0hBLENBQUNBO0lBQ0RILE1BQU1BO1FBQ0pJLEdBQUdBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7UUFDOUNBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBO0lBQzdCQSxDQUFDQTtBQUNISixDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge01hdGh9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbWF0aCc7XG5pbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCcm93c2VyRGV0YWlscyB7XG4gIGVsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKCkgeyB0aGlzLmRvZXNFbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkoKTsgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIGBldmVudC5lbGFwc2VkVGltZWAgaW5jbHVkZXMgdHJhbnNpdGlvbiBkZWxheSBpbiB0aGUgY3VycmVudCBicm93c2VyLiAgQXQgdGhpc1xuICAgKiB0aW1lLCBDaHJvbWUgYW5kIE9wZXJhIHNlZW0gdG8gYmUgdGhlIG9ubHkgYnJvd3NlcnMgdGhhdCBpbmNsdWRlIHRoaXMuXG4gICAqL1xuICBkb2VzRWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5KCk6IHZvaWQge1xuICAgIHZhciBkaXYgPSBET00uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgRE9NLnNldEF0dHJpYnV0ZShkaXYsICdzdHlsZScsIGBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogLTk5OTlweDsgbGVmdDogLTk5OTlweDsgd2lkdGg6IDFweDtcbiAgICAgIGhlaWdodDogMXB4OyB0cmFuc2l0aW9uOiBhbGwgMW1zIGxpbmVhciAxbXM7YCk7XG4gICAgLy8gRmlyZWZveCByZXF1aXJlcyB0aGF0IHdlIHdhaXQgZm9yIDIgZnJhbWVzIGZvciBzb21lIHJlYXNvblxuICAgIHRoaXMucmFmKHRpbWVzdGFtcCA9PiB7XG4gICAgICBET00ub24oZGl2LCAndHJhbnNpdGlvbmVuZCcsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgIHZhciBlbGFwc2VkID0gTWF0aC5yb3VuZChldmVudC5lbGFwc2VkVGltZSAqIDEwMDApO1xuICAgICAgICB0aGlzLmVsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSA9IGVsYXBzZWQgPT0gMjtcbiAgICAgICAgRE9NLnJlbW92ZShkaXYpO1xuICAgICAgfSk7XG4gICAgICBET00uc2V0U3R5bGUoZGl2LCAnd2lkdGgnLCAnMnB4Jyk7XG4gICAgfSwgMik7XG4gIH1cblxuICByYWYoY2FsbGJhY2s6IEZ1bmN0aW9uLCBmcmFtZXM6IG51bWJlciA9IDEpOiBGdW5jdGlvbiB7XG4gICAgdmFyIHF1ZXVlOiBSYWZRdWV1ZSA9IG5ldyBSYWZRdWV1ZShjYWxsYmFjaywgZnJhbWVzKTtcbiAgICByZXR1cm4gKCkgPT4gcXVldWUuY2FuY2VsKCk7XG4gIH1cbn1cblxuY2xhc3MgUmFmUXVldWUge1xuICBjdXJyZW50RnJhbWVJZDogbnVtYmVyO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY2FsbGJhY2s6IEZ1bmN0aW9uLCBwdWJsaWMgZnJhbWVzOiBudW1iZXIpIHsgdGhpcy5fcmFmKCk7IH1cbiAgcHJpdmF0ZSBfcmFmKCkge1xuICAgIHRoaXMuY3VycmVudEZyYW1lSWQgPSBET00ucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpbWVzdGFtcCA9PiB0aGlzLl9uZXh0RnJhbWUodGltZXN0YW1wKSk7XG4gIH1cbiAgcHJpdmF0ZSBfbmV4dEZyYW1lKHRpbWVzdGFtcDogbnVtYmVyKSB7XG4gICAgdGhpcy5mcmFtZXMtLTtcbiAgICBpZiAodGhpcy5mcmFtZXMgPiAwKSB7XG4gICAgICB0aGlzLl9yYWYoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYWxsYmFjayh0aW1lc3RhbXApO1xuICAgIH1cbiAgfVxuICBjYW5jZWwoKSB7XG4gICAgRE9NLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuY3VycmVudEZyYW1lSWQpO1xuICAgIHRoaXMuY3VycmVudEZyYW1lSWQgPSBudWxsO1xuICB9XG59XG4iXX0=