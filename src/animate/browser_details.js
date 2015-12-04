'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9kZXRhaWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2FuaW1hdGUvYnJvd3Nlcl9kZXRhaWxzLnRzIl0sIm5hbWVzIjpbIkJyb3dzZXJEZXRhaWxzIiwiQnJvd3NlckRldGFpbHMuY29uc3RydWN0b3IiLCJCcm93c2VyRGV0YWlscy5kb2VzRWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5IiwiQnJvd3NlckRldGFpbHMucmFmIiwiUmFmUXVldWUiLCJSYWZRdWV1ZS5jb25zdHJ1Y3RvciIsIlJhZlF1ZXVlLl9yYWYiLCJSYWZRdWV1ZS5fbmV4dEZyYW1lIiwiUmFmUXVldWUuY2FuY2VsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELHFCQUFtQiwwQkFBMEIsQ0FBQyxDQUFBO0FBQzlDLDRCQUFrQix1Q0FBdUMsQ0FBQyxDQUFBO0FBRTFEO0lBSUVBO1FBRkFDLDZCQUF3QkEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFFakJBLElBQUlBLENBQUNBLDRCQUE0QkEsRUFBRUEsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFFdEREOzs7T0FHR0E7SUFDSEEscURBQTRCQSxHQUE1QkE7UUFBQUUsaUJBYUNBO1FBWkNBLElBQUlBLEdBQUdBLEdBQUdBLGlCQUFHQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNuQ0EsaUJBQUdBLENBQUNBLFlBQVlBLENBQUNBLEdBQUdBLEVBQUVBLE9BQU9BLEVBQUVBLGtIQUNnQkEsQ0FBQ0EsQ0FBQ0E7UUFDakRBLDZEQUE2REE7UUFDN0RBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLFVBQUFBLFNBQVNBO1lBQ2hCQSxpQkFBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsZUFBZUEsRUFBRUEsVUFBQ0EsS0FBVUE7Z0JBQ3RDQSxJQUFJQSxPQUFPQSxHQUFHQSxXQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDbkRBLEtBQUlBLENBQUNBLHdCQUF3QkEsR0FBR0EsT0FBT0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQzdDQSxpQkFBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDbEJBLENBQUNBLENBQUNBLENBQUNBO1lBQ0hBLGlCQUFHQSxDQUFDQSxRQUFRQSxDQUFDQSxHQUFHQSxFQUFFQSxPQUFPQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUNwQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDUkEsQ0FBQ0E7SUFFREYsNEJBQUdBLEdBQUhBLFVBQUlBLFFBQWtCQSxFQUFFQSxNQUFrQkE7UUFBbEJHLHNCQUFrQkEsR0FBbEJBLFVBQWtCQTtRQUN4Q0EsSUFBSUEsS0FBS0EsR0FBYUEsSUFBSUEsUUFBUUEsQ0FBQ0EsUUFBUUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDckRBLE1BQU1BLENBQUNBLGNBQU1BLE9BQUFBLEtBQUtBLENBQUNBLE1BQU1BLEVBQUVBLEVBQWRBLENBQWNBLENBQUNBO0lBQzlCQSxDQUFDQTtJQTVCSEg7UUFBQ0EsZUFBVUEsRUFBRUE7O3VCQTZCWkE7SUFBREEscUJBQUNBO0FBQURBLENBQUNBLEFBN0JELElBNkJDO0FBNUJZLHNCQUFjLGlCQTRCMUIsQ0FBQTtBQUVEO0lBRUVJLGtCQUFtQkEsUUFBa0JBLEVBQVNBLE1BQWNBO1FBQXpDQyxhQUFRQSxHQUFSQSxRQUFRQSxDQUFVQTtRQUFTQSxXQUFNQSxHQUFOQSxNQUFNQSxDQUFRQTtRQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUN0RUQsdUJBQUlBLEdBQVpBO1FBQUFFLGlCQUVDQTtRQURDQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxpQkFBR0EsQ0FBQ0EscUJBQXFCQSxDQUFDQSxVQUFBQSxTQUFTQSxJQUFJQSxPQUFBQSxLQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxTQUFTQSxDQUFDQSxFQUExQkEsQ0FBMEJBLENBQUNBLENBQUNBO0lBQzNGQSxDQUFDQTtJQUNPRiw2QkFBVUEsR0FBbEJBLFVBQW1CQSxTQUFpQkE7UUFDbENHLElBQUlBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ2RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BCQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUMzQkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFDREgseUJBQU1BLEdBQU5BO1FBQ0VJLGlCQUFHQSxDQUFDQSxvQkFBb0JBLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBO1FBQzlDQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUM3QkEsQ0FBQ0E7SUFDSEosZUFBQ0E7QUFBREEsQ0FBQ0EsQUFsQkQsSUFrQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7TWF0aH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9tYXRoJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJyb3dzZXJEZXRhaWxzIHtcbiAgZWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5ID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoKSB7IHRoaXMuZG9lc0VsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSgpOyB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgYGV2ZW50LmVsYXBzZWRUaW1lYCBpbmNsdWRlcyB0cmFuc2l0aW9uIGRlbGF5IGluIHRoZSBjdXJyZW50IGJyb3dzZXIuICBBdCB0aGlzXG4gICAqIHRpbWUsIENocm9tZSBhbmQgT3BlcmEgc2VlbSB0byBiZSB0aGUgb25seSBicm93c2VycyB0aGF0IGluY2x1ZGUgdGhpcy5cbiAgICovXG4gIGRvZXNFbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkoKTogdm9pZCB7XG4gICAgdmFyIGRpdiA9IERPTS5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBET00uc2V0QXR0cmlidXRlKGRpdiwgJ3N0eWxlJywgYHBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAtOTk5OXB4OyBsZWZ0OiAtOTk5OXB4OyB3aWR0aDogMXB4O1xuICAgICAgaGVpZ2h0OiAxcHg7IHRyYW5zaXRpb246IGFsbCAxbXMgbGluZWFyIDFtcztgKTtcbiAgICAvLyBGaXJlZm94IHJlcXVpcmVzIHRoYXQgd2Ugd2FpdCBmb3IgMiBmcmFtZXMgZm9yIHNvbWUgcmVhc29uXG4gICAgdGhpcy5yYWYodGltZXN0YW1wID0+IHtcbiAgICAgIERPTS5vbihkaXYsICd0cmFuc2l0aW9uZW5kJywgKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgdmFyIGVsYXBzZWQgPSBNYXRoLnJvdW5kKGV2ZW50LmVsYXBzZWRUaW1lICogMTAwMCk7XG4gICAgICAgIHRoaXMuZWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5ID0gZWxhcHNlZCA9PSAyO1xuICAgICAgICBET00ucmVtb3ZlKGRpdik7XG4gICAgICB9KTtcbiAgICAgIERPTS5zZXRTdHlsZShkaXYsICd3aWR0aCcsICcycHgnKTtcbiAgICB9LCAyKTtcbiAgfVxuXG4gIHJhZihjYWxsYmFjazogRnVuY3Rpb24sIGZyYW1lczogbnVtYmVyID0gMSk6IEZ1bmN0aW9uIHtcbiAgICB2YXIgcXVldWU6IFJhZlF1ZXVlID0gbmV3IFJhZlF1ZXVlKGNhbGxiYWNrLCBmcmFtZXMpO1xuICAgIHJldHVybiAoKSA9PiBxdWV1ZS5jYW5jZWwoKTtcbiAgfVxufVxuXG5jbGFzcyBSYWZRdWV1ZSB7XG4gIGN1cnJlbnRGcmFtZUlkOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjYWxsYmFjazogRnVuY3Rpb24sIHB1YmxpYyBmcmFtZXM6IG51bWJlcikgeyB0aGlzLl9yYWYoKTsgfVxuICBwcml2YXRlIF9yYWYoKSB7XG4gICAgdGhpcy5jdXJyZW50RnJhbWVJZCA9IERPTS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGltZXN0YW1wID0+IHRoaXMuX25leHRGcmFtZSh0aW1lc3RhbXApKTtcbiAgfVxuICBwcml2YXRlIF9uZXh0RnJhbWUodGltZXN0YW1wOiBudW1iZXIpIHtcbiAgICB0aGlzLmZyYW1lcy0tO1xuICAgIGlmICh0aGlzLmZyYW1lcyA+IDApIHtcbiAgICAgIHRoaXMuX3JhZigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbGxiYWNrKHRpbWVzdGFtcCk7XG4gICAgfVxuICB9XG4gIGNhbmNlbCgpIHtcbiAgICBET00uY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5jdXJyZW50RnJhbWVJZCk7XG4gICAgdGhpcy5jdXJyZW50RnJhbWVJZCA9IG51bGw7XG4gIH1cbn1cbiJdfQ==