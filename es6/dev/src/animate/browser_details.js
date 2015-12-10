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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9kZXRhaWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2FuaW1hdGUvYnJvd3Nlcl9kZXRhaWxzLnRzIl0sIm5hbWVzIjpbIkJyb3dzZXJEZXRhaWxzIiwiQnJvd3NlckRldGFpbHMuY29uc3RydWN0b3IiLCJCcm93c2VyRGV0YWlscy5kb2VzRWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5IiwiQnJvd3NlckRldGFpbHMucmFmIiwiUmFmUXVldWUiLCJSYWZRdWV1ZS5jb25zdHJ1Y3RvciIsIlJhZlF1ZXVlLl9yYWYiLCJSYWZRdWV1ZS5fbmV4dEZyYW1lIiwiUmFmUXVldWUuY2FuY2VsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUN4QyxFQUFDLElBQUksRUFBQyxNQUFNLDBCQUEwQjtPQUN0QyxFQUFDLEdBQUcsRUFBQyxNQUFNLHVDQUF1QztBQUV6RDtJQUlFQTtRQUZBQyw2QkFBd0JBLEdBQUdBLEtBQUtBLENBQUNBO1FBRWpCQSxJQUFJQSxDQUFDQSw0QkFBNEJBLEVBQUVBLENBQUNBO0lBQUNBLENBQUNBO0lBRXRERDs7O09BR0dBO0lBQ0hBLDRCQUE0QkE7UUFDMUJFLElBQUlBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQ25DQSxHQUFHQSxDQUFDQSxZQUFZQSxDQUFDQSxHQUFHQSxFQUFFQSxPQUFPQSxFQUFFQTttREFDZ0JBLENBQUNBLENBQUNBO1FBQ2pEQSw2REFBNkRBO1FBQzdEQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQTtZQUNoQkEsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsZUFBZUEsRUFBRUEsQ0FBQ0EsS0FBVUE7Z0JBQ3RDQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDbkRBLElBQUlBLENBQUNBLHdCQUF3QkEsR0FBR0EsT0FBT0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzdDQSxHQUFHQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNsQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDSEEsR0FBR0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsRUFBRUEsT0FBT0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDcENBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ1JBLENBQUNBO0lBRURGLEdBQUdBLENBQUNBLFFBQWtCQSxFQUFFQSxNQUFNQSxHQUFXQSxDQUFDQTtRQUN4Q0csSUFBSUEsS0FBS0EsR0FBYUEsSUFBSUEsUUFBUUEsQ0FBQ0EsUUFBUUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDckRBLE1BQU1BLENBQUNBLE1BQU1BLEtBQUtBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO0lBQzlCQSxDQUFDQTtBQUNISCxDQUFDQTtBQTdCRDtJQUFDLFVBQVUsRUFBRTs7bUJBNkJaO0FBRUQ7SUFFRUksWUFBbUJBLFFBQWtCQSxFQUFTQSxNQUFjQTtRQUF6Q0MsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBVUE7UUFBU0EsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBUUE7UUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFDdEVELElBQUlBO1FBQ1ZFLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLEdBQUdBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsU0FBU0EsSUFBSUEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDM0ZBLENBQUNBO0lBQ09GLFVBQVVBLENBQUNBLFNBQWlCQTtRQUNsQ0csSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDZEEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLElBQUlBLENBQUNBLElBQUlBLEVBQUVBLENBQUNBO1FBQ2RBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQzNCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUNESCxNQUFNQTtRQUNKSSxHQUFHQSxDQUFDQSxvQkFBb0JBLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBO1FBQzlDQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUM3QkEsQ0FBQ0E7QUFDSEosQ0FBQ0E7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtNYXRofSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL21hdGgnO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQnJvd3NlckRldGFpbHMge1xuICBlbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcigpIHsgdGhpcy5kb2VzRWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5KCk7IH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBpZiBgZXZlbnQuZWxhcHNlZFRpbWVgIGluY2x1ZGVzIHRyYW5zaXRpb24gZGVsYXkgaW4gdGhlIGN1cnJlbnQgYnJvd3Nlci4gIEF0IHRoaXNcbiAgICogdGltZSwgQ2hyb21lIGFuZCBPcGVyYSBzZWVtIHRvIGJlIHRoZSBvbmx5IGJyb3dzZXJzIHRoYXQgaW5jbHVkZSB0aGlzLlxuICAgKi9cbiAgZG9lc0VsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSgpOiB2b2lkIHtcbiAgICB2YXIgZGl2ID0gRE9NLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIERPTS5zZXRBdHRyaWJ1dGUoZGl2LCAnc3R5bGUnLCBgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IC05OTk5cHg7IGxlZnQ6IC05OTk5cHg7IHdpZHRoOiAxcHg7XG4gICAgICBoZWlnaHQ6IDFweDsgdHJhbnNpdGlvbjogYWxsIDFtcyBsaW5lYXIgMW1zO2ApO1xuICAgIC8vIEZpcmVmb3ggcmVxdWlyZXMgdGhhdCB3ZSB3YWl0IGZvciAyIGZyYW1lcyBmb3Igc29tZSByZWFzb25cbiAgICB0aGlzLnJhZih0aW1lc3RhbXAgPT4ge1xuICAgICAgRE9NLm9uKGRpdiwgJ3RyYW5zaXRpb25lbmQnLCAoZXZlbnQ6IGFueSkgPT4ge1xuICAgICAgICB2YXIgZWxhcHNlZCA9IE1hdGgucm91bmQoZXZlbnQuZWxhcHNlZFRpbWUgKiAxMDAwKTtcbiAgICAgICAgdGhpcy5lbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkgPSBlbGFwc2VkID09IDI7XG4gICAgICAgIERPTS5yZW1vdmUoZGl2KTtcbiAgICAgIH0pO1xuICAgICAgRE9NLnNldFN0eWxlKGRpdiwgJ3dpZHRoJywgJzJweCcpO1xuICAgIH0sIDIpO1xuICB9XG5cbiAgcmFmKGNhbGxiYWNrOiBGdW5jdGlvbiwgZnJhbWVzOiBudW1iZXIgPSAxKTogRnVuY3Rpb24ge1xuICAgIHZhciBxdWV1ZTogUmFmUXVldWUgPSBuZXcgUmFmUXVldWUoY2FsbGJhY2ssIGZyYW1lcyk7XG4gICAgcmV0dXJuICgpID0+IHF1ZXVlLmNhbmNlbCgpO1xuICB9XG59XG5cbmNsYXNzIFJhZlF1ZXVlIHtcbiAgY3VycmVudEZyYW1lSWQ6IG51bWJlcjtcbiAgY29uc3RydWN0b3IocHVibGljIGNhbGxiYWNrOiBGdW5jdGlvbiwgcHVibGljIGZyYW1lczogbnVtYmVyKSB7IHRoaXMuX3JhZigpOyB9XG4gIHByaXZhdGUgX3JhZigpIHtcbiAgICB0aGlzLmN1cnJlbnRGcmFtZUlkID0gRE9NLnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aW1lc3RhbXAgPT4gdGhpcy5fbmV4dEZyYW1lKHRpbWVzdGFtcCkpO1xuICB9XG4gIHByaXZhdGUgX25leHRGcmFtZSh0aW1lc3RhbXA6IG51bWJlcikge1xuICAgIHRoaXMuZnJhbWVzLS07XG4gICAgaWYgKHRoaXMuZnJhbWVzID4gMCkge1xuICAgICAgdGhpcy5fcmFmKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FsbGJhY2sodGltZXN0YW1wKTtcbiAgICB9XG4gIH1cbiAgY2FuY2VsKCkge1xuICAgIERPTS5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmN1cnJlbnRGcmFtZUlkKTtcbiAgICB0aGlzLmN1cnJlbnRGcmFtZUlkID0gbnVsbDtcbiAgfVxufVxuIl19