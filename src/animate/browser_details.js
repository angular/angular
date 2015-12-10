'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
})();
exports.BrowserDetails = BrowserDetails;
var RafQueue = (function () {
    function RafQueue(callback, frames) {
        this.callback = callback;
        this.frames = frames;
        this._raf();
    }
    RafQueue.prototype._raf = function () {
        var _this = this;
        this.currentFrameId = dom_adapter_1.DOM.requestAnimationFrame(function (timestamp) { return _this._nextFrame(timestamp); });
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
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9kZXRhaWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2FuaW1hdGUvYnJvd3Nlcl9kZXRhaWxzLnRzIl0sIm5hbWVzIjpbIkJyb3dzZXJEZXRhaWxzIiwiQnJvd3NlckRldGFpbHMuY29uc3RydWN0b3IiLCJCcm93c2VyRGV0YWlscy5kb2VzRWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5IiwiQnJvd3NlckRldGFpbHMucmFmIiwiUmFmUXVldWUiLCJSYWZRdWV1ZS5jb25zdHJ1Y3RvciIsIlJhZlF1ZXVlLl9yYWYiLCJSYWZRdWV1ZS5fbmV4dEZyYW1lIiwiUmFmUXVldWUuY2FuY2VsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCxxQkFBbUIsMEJBQTBCLENBQUMsQ0FBQTtBQUM5Qyw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUUxRDtJQUlFQTtRQUZBQyw2QkFBd0JBLEdBQUdBLEtBQUtBLENBQUNBO1FBRWpCQSxJQUFJQSxDQUFDQSw0QkFBNEJBLEVBQUVBLENBQUNBO0lBQUNBLENBQUNBO0lBRXRERDs7O09BR0dBO0lBQ0hBLHFEQUE0QkEsR0FBNUJBO1FBQUFFLGlCQWFDQTtRQVpDQSxJQUFJQSxHQUFHQSxHQUFHQSxpQkFBR0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLGlCQUFHQSxDQUFDQSxZQUFZQSxDQUFDQSxHQUFHQSxFQUFFQSxPQUFPQSxFQUFFQSxrSEFDZ0JBLENBQUNBLENBQUNBO1FBQ2pEQSw2REFBNkRBO1FBQzdEQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxVQUFBQSxTQUFTQTtZQUNoQkEsaUJBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLGVBQWVBLEVBQUVBLFVBQUNBLEtBQVVBO2dCQUN0Q0EsSUFBSUEsT0FBT0EsR0FBR0EsV0FBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ25EQSxLQUFJQSxDQUFDQSx3QkFBd0JBLEdBQUdBLE9BQU9BLElBQUlBLENBQUNBLENBQUNBO2dCQUM3Q0EsaUJBQUdBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO1lBQ2xCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNIQSxpQkFBR0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsRUFBRUEsT0FBT0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDcENBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ1JBLENBQUNBO0lBRURGLDRCQUFHQSxHQUFIQSxVQUFJQSxRQUFrQkEsRUFBRUEsTUFBa0JBO1FBQWxCRyxzQkFBa0JBLEdBQWxCQSxVQUFrQkE7UUFDeENBLElBQUlBLEtBQUtBLEdBQWFBLElBQUlBLFFBQVFBLENBQUNBLFFBQVFBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1FBQ3JEQSxNQUFNQSxDQUFDQSxjQUFNQSxPQUFBQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFkQSxDQUFjQSxDQUFDQTtJQUM5QkEsQ0FBQ0E7SUE1QkhIO1FBQUNBLGVBQVVBLEVBQUVBOzt1QkE2QlpBO0lBQURBLHFCQUFDQTtBQUFEQSxDQUFDQSxBQTdCRCxJQTZCQztBQTVCWSxzQkFBYyxpQkE0QjFCLENBQUE7QUFFRDtJQUVFSSxrQkFBbUJBLFFBQWtCQSxFQUFTQSxNQUFjQTtRQUF6Q0MsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBVUE7UUFBU0EsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBUUE7UUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFDdEVELHVCQUFJQSxHQUFaQTtRQUFBRSxpQkFFQ0E7UUFEQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsR0FBR0EsaUJBQUdBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsVUFBQUEsU0FBU0EsSUFBSUEsT0FBQUEsS0FBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsRUFBMUJBLENBQTBCQSxDQUFDQSxDQUFDQTtJQUMzRkEsQ0FBQ0E7SUFDT0YsNkJBQVVBLEdBQWxCQSxVQUFtQkEsU0FBaUJBO1FBQ2xDRyxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUNkQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFDM0JBLENBQUNBO0lBQ0hBLENBQUNBO0lBQ0RILHlCQUFNQSxHQUFOQTtRQUNFSSxpQkFBR0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtRQUM5Q0EsSUFBSUEsQ0FBQ0EsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDN0JBLENBQUNBO0lBQ0hKLGVBQUNBO0FBQURBLENBQUNBLEFBbEJELElBa0JDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge01hdGh9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbWF0aCc7XG5pbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBCcm93c2VyRGV0YWlscyB7XG4gIGVsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKCkgeyB0aGlzLmRvZXNFbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkoKTsgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIGBldmVudC5lbGFwc2VkVGltZWAgaW5jbHVkZXMgdHJhbnNpdGlvbiBkZWxheSBpbiB0aGUgY3VycmVudCBicm93c2VyLiAgQXQgdGhpc1xuICAgKiB0aW1lLCBDaHJvbWUgYW5kIE9wZXJhIHNlZW0gdG8gYmUgdGhlIG9ubHkgYnJvd3NlcnMgdGhhdCBpbmNsdWRlIHRoaXMuXG4gICAqL1xuICBkb2VzRWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5KCk6IHZvaWQge1xuICAgIHZhciBkaXYgPSBET00uY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgRE9NLnNldEF0dHJpYnV0ZShkaXYsICdzdHlsZScsIGBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogLTk5OTlweDsgbGVmdDogLTk5OTlweDsgd2lkdGg6IDFweDtcbiAgICAgIGhlaWdodDogMXB4OyB0cmFuc2l0aW9uOiBhbGwgMW1zIGxpbmVhciAxbXM7YCk7XG4gICAgLy8gRmlyZWZveCByZXF1aXJlcyB0aGF0IHdlIHdhaXQgZm9yIDIgZnJhbWVzIGZvciBzb21lIHJlYXNvblxuICAgIHRoaXMucmFmKHRpbWVzdGFtcCA9PiB7XG4gICAgICBET00ub24oZGl2LCAndHJhbnNpdGlvbmVuZCcsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgIHZhciBlbGFwc2VkID0gTWF0aC5yb3VuZChldmVudC5lbGFwc2VkVGltZSAqIDEwMDApO1xuICAgICAgICB0aGlzLmVsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSA9IGVsYXBzZWQgPT0gMjtcbiAgICAgICAgRE9NLnJlbW92ZShkaXYpO1xuICAgICAgfSk7XG4gICAgICBET00uc2V0U3R5bGUoZGl2LCAnd2lkdGgnLCAnMnB4Jyk7XG4gICAgfSwgMik7XG4gIH1cblxuICByYWYoY2FsbGJhY2s6IEZ1bmN0aW9uLCBmcmFtZXM6IG51bWJlciA9IDEpOiBGdW5jdGlvbiB7XG4gICAgdmFyIHF1ZXVlOiBSYWZRdWV1ZSA9IG5ldyBSYWZRdWV1ZShjYWxsYmFjaywgZnJhbWVzKTtcbiAgICByZXR1cm4gKCkgPT4gcXVldWUuY2FuY2VsKCk7XG4gIH1cbn1cblxuY2xhc3MgUmFmUXVldWUge1xuICBjdXJyZW50RnJhbWVJZDogbnVtYmVyO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY2FsbGJhY2s6IEZ1bmN0aW9uLCBwdWJsaWMgZnJhbWVzOiBudW1iZXIpIHsgdGhpcy5fcmFmKCk7IH1cbiAgcHJpdmF0ZSBfcmFmKCkge1xuICAgIHRoaXMuY3VycmVudEZyYW1lSWQgPSBET00ucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpbWVzdGFtcCA9PiB0aGlzLl9uZXh0RnJhbWUodGltZXN0YW1wKSk7XG4gIH1cbiAgcHJpdmF0ZSBfbmV4dEZyYW1lKHRpbWVzdGFtcDogbnVtYmVyKSB7XG4gICAgdGhpcy5mcmFtZXMtLTtcbiAgICBpZiAodGhpcy5mcmFtZXMgPiAwKSB7XG4gICAgICB0aGlzLl9yYWYoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYWxsYmFjayh0aW1lc3RhbXApO1xuICAgIH1cbiAgfVxuICBjYW5jZWwoKSB7XG4gICAgRE9NLmNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuY3VycmVudEZyYW1lSWQpO1xuICAgIHRoaXMuY3VycmVudEZyYW1lSWQgPSBudWxsO1xuICB9XG59XG4iXX0=