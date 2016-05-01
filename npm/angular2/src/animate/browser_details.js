'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var math_1 = require('angular2/src/facade/math');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var BrowserDetails = (function () {
    function BrowserDetails() {
        this.elapsedTimeIncludesDelay = false;
        this.doesElapsedTimeIncludesDelay();
    }
    /**
     * Determines if `event.elapsedTime` includes transition delay in the current browser.  At this
     * time, Chrome and Opera seem to be the only browsers that include this.
     */
    BrowserDetails.prototype.doesElapsedTimeIncludesDelay = function () {
        var _this = this;
        var div = dom_adapter_1.DOM.createElement('div');
        dom_adapter_1.DOM.setAttribute(div, 'style', "position: absolute; top: -9999px; left: -9999px; width: 1px;\n      height: 1px; transition: all 1ms linear 1ms;");
        // Firefox requires that we wait for 2 frames for some reason
        this.raf(function (timestamp) {
            dom_adapter_1.DOM.on(div, 'transitionend', function (event) {
                var elapsed = math_1.Math.round(event.elapsedTime * 1000);
                _this.elapsedTimeIncludesDelay = elapsed == 2;
                dom_adapter_1.DOM.remove(div);
            });
            dom_adapter_1.DOM.setStyle(div, 'width', '2px');
        }, 2);
    };
    BrowserDetails.prototype.raf = function (callback, frames) {
        if (frames === void 0) { frames = 1; }
        var queue = new RafQueue(callback, frames);
        return function () { return queue.cancel(); };
    };
    BrowserDetails = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], BrowserDetails);
    return BrowserDetails;
}());
exports.BrowserDetails = BrowserDetails;
var RafQueue = (function () {
    function RafQueue(callback, frames) {
        this.callback = callback;
        this.frames = frames;
        this._raf();
    }
    RafQueue.prototype._raf = function () {
        var _this = this;
        this.currentFrameId =
            dom_adapter_1.DOM.requestAnimationFrame(function (timestamp) { return _this._nextFrame(timestamp); });
    };
    RafQueue.prototype._nextFrame = function (timestamp) {
        this.frames--;
        if (this.frames > 0) {
            this._raf();
        }
        else {
            this.callback(timestamp);
        }
    };
    RafQueue.prototype.cancel = function () {
        dom_adapter_1.DOM.cancelAnimationFrame(this.currentFrameId);
        this.currentFrameId = null;
    };
    return RafQueue;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9kZXRhaWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2FuaW1hdGUvYnJvd3Nlcl9kZXRhaWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCxxQkFBbUIsMEJBQTBCLENBQUMsQ0FBQTtBQUM5Qyw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUcxRDtJQUdFO1FBRkEsNkJBQXdCLEdBQUcsS0FBSyxDQUFDO1FBRWpCLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO0lBQUMsQ0FBQztJQUV0RDs7O09BR0c7SUFDSCxxREFBNEIsR0FBNUI7UUFBQSxpQkFhQztRQVpDLElBQUksR0FBRyxHQUFHLGlCQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLGlCQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsa0hBQ2dCLENBQUMsQ0FBQztRQUNqRCw2REFBNkQ7UUFDN0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLFNBQWM7WUFDdEIsaUJBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLGVBQWUsRUFBRSxVQUFDLEtBQVU7Z0JBQ3RDLElBQUksT0FBTyxHQUFHLFdBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQztnQkFDbkQsS0FBSSxDQUFDLHdCQUF3QixHQUFHLE9BQU8sSUFBSSxDQUFDLENBQUM7Z0JBQzdDLGlCQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsaUJBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBRUQsNEJBQUcsR0FBSCxVQUFJLFFBQWtCLEVBQUUsTUFBa0I7UUFBbEIsc0JBQWtCLEdBQWxCLFVBQWtCO1FBQ3hDLElBQUksS0FBSyxHQUFhLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNyRCxNQUFNLENBQUMsY0FBTSxPQUFBLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBZCxDQUFjLENBQUM7SUFDOUIsQ0FBQztJQTVCSDtRQUFDLGVBQVUsRUFBRTs7c0JBQUE7SUE2QmIscUJBQUM7QUFBRCxDQUFDLEFBNUJELElBNEJDO0FBNUJZLHNCQUFjLGlCQTRCMUIsQ0FBQTtBQUVEO0lBRUUsa0JBQW1CLFFBQWtCLEVBQVMsTUFBYztRQUF6QyxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUFDLENBQUM7SUFDdEUsdUJBQUksR0FBWjtRQUFBLGlCQUdDO1FBRkMsSUFBSSxDQUFDLGNBQWM7WUFDZixpQkFBRyxDQUFDLHFCQUFxQixDQUFDLFVBQUMsU0FBaUIsSUFBSyxPQUFBLEtBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQTFCLENBQTBCLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBQ08sNkJBQVUsR0FBbEIsVUFBbUIsU0FBaUI7UUFDbEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0IsQ0FBQztJQUNILENBQUM7SUFDRCx5QkFBTSxHQUFOO1FBQ0UsaUJBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQUNILGVBQUM7QUFBRCxDQUFDLEFBbkJELElBbUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge01hdGh9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbWF0aCc7XG5pbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCcm93c2VyRGV0YWlscyB7XG4gIGVsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKCkgeyB0aGlzLmRvZXNFbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkoKTsgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIGBldmVudC5lbGFwc2VkVGltZWAgaW5jbHVkZXMgdHJhbnNpdGlvbiBkZWxheSBpbiB0aGUgY3VycmVudCBicm93c2VyLiAgQXQgdGhpc1xuICAgKiB0aW1lLCBDaHJvbWUgYW5kIE9wZXJhIHNlZW0gdG8gYmUgdGhlIG9ubHkgYnJvd3NlcnMgdGhhdCBpbmNsdWRlIHRoaXMuXG4gICAqL1xuICBkb2VzRWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5KCk6IHZvaWQge1xuICAgIHZhciBkaXYgPSBET00uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgRE9NLnNldEF0dHJpYnV0ZShkaXYsICdzdHlsZScsIGBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogLTk5OTlweDsgbGVmdDogLTk5OTlweDsgd2lkdGg6IDFweDtcbiAgICAgIGhlaWdodDogMXB4OyB0cmFuc2l0aW9uOiBhbGwgMW1zIGxpbmVhciAxbXM7YCk7XG4gICAgLy8gRmlyZWZveCByZXF1aXJlcyB0aGF0IHdlIHdhaXQgZm9yIDIgZnJhbWVzIGZvciBzb21lIHJlYXNvblxuICAgIHRoaXMucmFmKCh0aW1lc3RhbXA6IGFueSkgPT4ge1xuICAgICAgRE9NLm9uKGRpdiwgJ3RyYW5zaXRpb25lbmQnLCAoZXZlbnQ6IGFueSkgPT4ge1xuICAgICAgICB2YXIgZWxhcHNlZCA9IE1hdGgucm91bmQoZXZlbnQuZWxhcHNlZFRpbWUgKiAxMDAwKTtcbiAgICAgICAgdGhpcy5lbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkgPSBlbGFwc2VkID09IDI7XG4gICAgICAgIERPTS5yZW1vdmUoZGl2KTtcbiAgICAgIH0pO1xuICAgICAgRE9NLnNldFN0eWxlKGRpdiwgJ3dpZHRoJywgJzJweCcpO1xuICAgIH0sIDIpO1xuICB9XG5cbiAgcmFmKGNhbGxiYWNrOiBGdW5jdGlvbiwgZnJhbWVzOiBudW1iZXIgPSAxKTogRnVuY3Rpb24ge1xuICAgIHZhciBxdWV1ZTogUmFmUXVldWUgPSBuZXcgUmFmUXVldWUoY2FsbGJhY2ssIGZyYW1lcyk7XG4gICAgcmV0dXJuICgpID0+IHF1ZXVlLmNhbmNlbCgpO1xuICB9XG59XG5cbmNsYXNzIFJhZlF1ZXVlIHtcbiAgY3VycmVudEZyYW1lSWQ6IG51bWJlcjtcbiAgY29uc3RydWN0b3IocHVibGljIGNhbGxiYWNrOiBGdW5jdGlvbiwgcHVibGljIGZyYW1lczogbnVtYmVyKSB7IHRoaXMuX3JhZigpOyB9XG4gIHByaXZhdGUgX3JhZigpIHtcbiAgICB0aGlzLmN1cnJlbnRGcmFtZUlkID1cbiAgICAgICAgRE9NLnJlcXVlc3RBbmltYXRpb25GcmFtZSgodGltZXN0YW1wOiBudW1iZXIpID0+IHRoaXMuX25leHRGcmFtZSh0aW1lc3RhbXApKTtcbiAgfVxuICBwcml2YXRlIF9uZXh0RnJhbWUodGltZXN0YW1wOiBudW1iZXIpIHtcbiAgICB0aGlzLmZyYW1lcy0tO1xuICAgIGlmICh0aGlzLmZyYW1lcyA+IDApIHtcbiAgICAgIHRoaXMuX3JhZigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbGxiYWNrKHRpbWVzdGFtcCk7XG4gICAgfVxuICB9XG4gIGNhbmNlbCgpIHtcbiAgICBET00uY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5jdXJyZW50RnJhbWVJZCk7XG4gICAgdGhpcy5jdXJyZW50RnJhbWVJZCA9IG51bGw7XG4gIH1cbn1cbiJdfQ==