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
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
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
//# sourceMappingURL=browser_details.js.map