'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var math_1 = require('angular2/src/facade/math');
var util_1 = require('angular2/src/platform/dom/util');
var collection_1 = require('angular2/src/facade/collection');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var Animation = (function () {
    /**
     * Stores the start time and starts the animation
     * @param element
     * @param data
     * @param browserDetails
     */
    function Animation(element, data, browserDetails) {
        var _this = this;
        this.element = element;
        this.data = data;
        this.browserDetails = browserDetails;
        /** functions to be called upon completion */
        this.callbacks = [];
        /** functions for removing event listeners */
        this.eventClearFunctions = [];
        /** flag used to track whether or not the animation has finished */
        this.completed = false;
        this._stringPrefix = '';
        this.startTime = lang_1.DateWrapper.toMillis(lang_1.DateWrapper.now());
        this._stringPrefix = dom_adapter_1.DOM.getAnimationPrefix();
        this.setup();
        this.wait(function (timestamp) { return _this.start(); });
    }
    Object.defineProperty(Animation.prototype, "totalTime", {
        /** total amount of time that the animation should take including delay */
        get: function () {
            var delay = this.computedDelay != null ? this.computedDelay : 0;
            var duration = this.computedDuration != null ? this.computedDuration : 0;
            return delay + duration;
        },
        enumerable: true,
        configurable: true
    });
    Animation.prototype.wait = function (callback) {
        // Firefox requires 2 frames for some reason
        this.browserDetails.raf(callback, 2);
    };
    /**
     * Sets up the initial styles before the animation is started
     */
    Animation.prototype.setup = function () {
        if (this.data.fromStyles != null)
            this.applyStyles(this.data.fromStyles);
        if (this.data.duration != null)
            this.applyStyles({ 'transitionDuration': this.data.duration.toString() + 'ms' });
        if (this.data.delay != null)
            this.applyStyles({ 'transitionDelay': this.data.delay.toString() + 'ms' });
    };
    /**
     * After the initial setup has occurred, this method adds the animation styles
     */
    Animation.prototype.start = function () {
        this.addClasses(this.data.classesToAdd);
        this.addClasses(this.data.animationClasses);
        this.removeClasses(this.data.classesToRemove);
        if (this.data.toStyles != null)
            this.applyStyles(this.data.toStyles);
        var computedStyles = dom_adapter_1.DOM.getComputedStyle(this.element);
        this.computedDelay =
            math_1.Math.max(this.parseDurationString(computedStyles.getPropertyValue(this._stringPrefix + 'transition-delay')), this.parseDurationString(this.element.style.getPropertyValue(this._stringPrefix + 'transition-delay')));
        this.computedDuration = math_1.Math.max(this.parseDurationString(computedStyles.getPropertyValue(this._stringPrefix + 'transition-duration')), this.parseDurationString(this.element.style.getPropertyValue(this._stringPrefix + 'transition-duration')));
        this.addEvents();
    };
    /**
     * Applies the provided styles to the element
     * @param styles
     */
    Animation.prototype.applyStyles = function (styles) {
        var _this = this;
        collection_1.StringMapWrapper.forEach(styles, function (value, key) {
            var dashCaseKey = util_1.camelCaseToDashCase(key);
            if (lang_1.isPresent(dom_adapter_1.DOM.getStyle(_this.element, dashCaseKey))) {
                dom_adapter_1.DOM.setStyle(_this.element, dashCaseKey, value.toString());
            }
            else {
                dom_adapter_1.DOM.setStyle(_this.element, _this._stringPrefix + dashCaseKey, value.toString());
            }
        });
    };
    /**
     * Adds the provided classes to the element
     * @param classes
     */
    Animation.prototype.addClasses = function (classes) {
        for (var i = 0, len = classes.length; i < len; i++)
            dom_adapter_1.DOM.addClass(this.element, classes[i]);
    };
    /**
     * Removes the provided classes from the element
     * @param classes
     */
    Animation.prototype.removeClasses = function (classes) {
        for (var i = 0, len = classes.length; i < len; i++)
            dom_adapter_1.DOM.removeClass(this.element, classes[i]);
    };
    /**
     * Adds events to track when animations have finished
     */
    Animation.prototype.addEvents = function () {
        var _this = this;
        if (this.totalTime > 0) {
            this.eventClearFunctions.push(dom_adapter_1.DOM.onAndCancel(this.element, dom_adapter_1.DOM.getTransitionEnd(), function (event) { return _this.handleAnimationEvent(event); }));
        }
        else {
            this.handleAnimationCompleted();
        }
    };
    Animation.prototype.handleAnimationEvent = function (event) {
        var elapsedTime = math_1.Math.round(event.elapsedTime * 1000);
        if (!this.browserDetails.elapsedTimeIncludesDelay)
            elapsedTime += this.computedDelay;
        event.stopPropagation();
        if (elapsedTime >= this.totalTime)
            this.handleAnimationCompleted();
    };
    /**
     * Runs all animation callbacks and removes temporary classes
     */
    Animation.prototype.handleAnimationCompleted = function () {
        this.removeClasses(this.data.animationClasses);
        this.callbacks.forEach(function (callback) { return callback(); });
        this.callbacks = [];
        this.eventClearFunctions.forEach(function (fn) { return fn(); });
        this.eventClearFunctions = [];
        this.completed = true;
    };
    /**
     * Adds animation callbacks to be called upon completion
     * @param callback
     * @returns {Animation}
     */
    Animation.prototype.onComplete = function (callback) {
        if (this.completed) {
            callback();
        }
        else {
            this.callbacks.push(callback);
        }
        return this;
    };
    /**
     * Converts the duration string to the number of milliseconds
     * @param duration
     * @returns {number}
     */
    Animation.prototype.parseDurationString = function (duration) {
        var maxValue = 0;
        // duration must have at least 2 characters to be valid. (number + type)
        if (duration == null || duration.length < 2) {
            return maxValue;
        }
        else if (duration.substring(duration.length - 2) == 'ms') {
            var value = lang_1.NumberWrapper.parseInt(this.stripLetters(duration), 10);
            if (value > maxValue)
                maxValue = value;
        }
        else if (duration.substring(duration.length - 1) == 's') {
            var ms = lang_1.NumberWrapper.parseFloat(this.stripLetters(duration)) * 1000;
            var value = math_1.Math.floor(ms);
            if (value > maxValue)
                maxValue = value;
        }
        return maxValue;
    };
    /**
     * Strips the letters from the duration string
     * @param str
     * @returns {string}
     */
    Animation.prototype.stripLetters = function (str) {
        return lang_1.StringWrapper.replaceAll(str, lang_1.RegExpWrapper.create('[^0-9]+$', ''), '');
    };
    return Animation;
}());
exports.Animation = Animation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2FuaW1hdGUvYW5pbWF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQkFNTywwQkFBMEIsQ0FBQyxDQUFBO0FBQ2xDLHFCQUFtQiwwQkFBMEIsQ0FBQyxDQUFBO0FBQzlDLHFCQUFrQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ25FLDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ2hFLDRCQUFrQix1Q0FBdUMsQ0FBQyxDQUFBO0FBSzFEO0lBNEJFOzs7OztPQUtHO0lBQ0gsbUJBQW1CLE9BQW9CLEVBQVMsSUFBeUIsRUFDdEQsY0FBOEI7UUFuQ25ELGlCQXdMQztRQXRKb0IsWUFBTyxHQUFQLE9BQU8sQ0FBYTtRQUFTLFNBQUksR0FBSixJQUFJLENBQXFCO1FBQ3RELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQWxDakQsNkNBQTZDO1FBQzdDLGNBQVMsR0FBZSxFQUFFLENBQUM7UUFXM0IsNkNBQTZDO1FBQzdDLHdCQUFtQixHQUFlLEVBQUUsQ0FBQztRQUVyQyxtRUFBbUU7UUFDbkUsY0FBUyxHQUFZLEtBQUssQ0FBQztRQUVuQixrQkFBYSxHQUFXLEVBQUUsQ0FBQztRQWlCakMsSUFBSSxDQUFDLFNBQVMsR0FBRyxrQkFBVyxDQUFDLFFBQVEsQ0FBQyxrQkFBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLGFBQWEsR0FBRyxpQkFBRyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDOUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFDLFNBQWMsSUFBSyxPQUFBLEtBQUksQ0FBQyxLQUFLLEVBQUUsRUFBWixDQUFZLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBbEJELHNCQUFJLGdDQUFT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QUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7Z0JBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN6QyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzFELElBQUksRUFBRSxHQUFHLG9CQUFhLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDdEUsSUFBSSxLQUFLLEdBQUcsV0FBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMzQixFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDO2dCQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDekMsQ0FBQztRQUNELE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxnQ0FBWSxHQUFaLFVBQWEsR0FBVztRQUN0QixNQUFNLENBQUMsb0JBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLG9CQUFhLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBQ0gsZ0JBQUM7QUFBRCxDQUFDLEFBeExELElBd0xDO0FBeExZLGlCQUFTLFlBd0xyQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgRGF0ZVdyYXBwZXIsXG4gIFN0cmluZ1dyYXBwZXIsXG4gIFJlZ0V4cFdyYXBwZXIsXG4gIE51bWJlcldyYXBwZXIsXG4gIGlzUHJlc2VudFxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtNYXRofSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL21hdGgnO1xuaW1wb3J0IHtjYW1lbENhc2VUb0Rhc2hDYXNlfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL3V0aWwnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuXG5pbXBvcnQge0Jyb3dzZXJEZXRhaWxzfSBmcm9tICcuL2Jyb3dzZXJfZGV0YWlscyc7XG5pbXBvcnQge0Nzc0FuaW1hdGlvbk9wdGlvbnN9IGZyb20gJy4vY3NzX2FuaW1hdGlvbl9vcHRpb25zJztcblxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbiB7XG4gIC8qKiBmdW5jdGlvbnMgdG8gYmUgY2FsbGVkIHVwb24gY29tcGxldGlvbiAqL1xuICBjYWxsYmFja3M6IEZ1bmN0aW9uW10gPSBbXTtcblxuICAvKiogdGhlIGR1cmF0aW9uIChtcykgb2YgdGhlIGFuaW1hdGlvbiAod2hldGhlciBmcm9tIENTUyBvciBtYW51YWxseSBzZXQpICovXG4gIGNvbXB1dGVkRHVyYXRpb246IG51bWJlcjtcblxuICAvKiogdGhlIGFuaW1hdGlvbiBkZWxheSAobXMpICh3aGV0aGVyIGZyb20gQ1NTIG9yIG1hbnVhbGx5IHNldCkgKi9cbiAgY29tcHV0ZWREZWxheTogbnVtYmVyO1xuXG4gIC8qKiB0aW1lc3RhbXAgb2Ygd2hlbiB0aGUgYW5pbWF0aW9uIHN0YXJ0ZWQgKi9cbiAgc3RhcnRUaW1lOiBudW1iZXI7XG5cbiAgLyoqIGZ1bmN0aW9ucyBmb3IgcmVtb3ZpbmcgZXZlbnQgbGlzdGVuZXJzICovXG4gIGV2ZW50Q2xlYXJGdW5jdGlvbnM6IEZ1bmN0aW9uW10gPSBbXTtcblxuICAvKiogZmxhZyB1c2VkIHRvIHRyYWNrIHdoZXRoZXIgb3Igbm90IHRoZSBhbmltYXRpb24gaGFzIGZpbmlzaGVkICovXG4gIGNvbXBsZXRlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgX3N0cmluZ1ByZWZpeDogc3RyaW5nID0gJyc7XG5cbiAgLyoqIHRvdGFsIGFtb3VudCBvZiB0aW1lIHRoYXQgdGhlIGFuaW1hdGlvbiBzaG91bGQgdGFrZSBpbmNsdWRpbmcgZGVsYXkgKi9cbiAgZ2V0IHRvdGFsVGltZSgpOiBudW1iZXIge1xuICAgIGxldCBkZWxheSA9IHRoaXMuY29tcHV0ZWREZWxheSAhPSBudWxsID8gdGhpcy5jb21wdXRlZERlbGF5IDogMDtcbiAgICBsZXQgZHVyYXRpb24gPSB0aGlzLmNvbXB1dGVkRHVyYXRpb24gIT0gbnVsbCA/IHRoaXMuY29tcHV0ZWREdXJhdGlvbiA6IDA7XG4gICAgcmV0dXJuIGRlbGF5ICsgZHVyYXRpb247XG4gIH1cblxuICAvKipcbiAgICogU3RvcmVzIHRoZSBzdGFydCB0aW1lIGFuZCBzdGFydHMgdGhlIGFuaW1hdGlvblxuICAgKiBAcGFyYW0gZWxlbWVudFxuICAgKiBAcGFyYW0gZGF0YVxuICAgKiBAcGFyYW0gYnJvd3NlckRldGFpbHNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50OiBIVE1MRWxlbWVudCwgcHVibGljIGRhdGE6IENzc0FuaW1hdGlvbk9wdGlvbnMsXG4gICAgICAgICAgICAgIHB1YmxpYyBicm93c2VyRGV0YWlsczogQnJvd3NlckRldGFpbHMpIHtcbiAgICB0aGlzLnN0YXJ0VGltZSA9IERhdGVXcmFwcGVyLnRvTWlsbGlzKERhdGVXcmFwcGVyLm5vdygpKTtcbiAgICB0aGlzLl9zdHJpbmdQcmVmaXggPSBET00uZ2V0QW5pbWF0aW9uUHJlZml4KCk7XG4gICAgdGhpcy5zZXR1cCgpO1xuICAgIHRoaXMud2FpdCgodGltZXN0YW1wOiBhbnkpID0+IHRoaXMuc3RhcnQoKSk7XG4gIH1cblxuICB3YWl0KGNhbGxiYWNrOiBGdW5jdGlvbikge1xuICAgIC8vIEZpcmVmb3ggcmVxdWlyZXMgMiBmcmFtZXMgZm9yIHNvbWUgcmVhc29uXG4gICAgdGhpcy5icm93c2VyRGV0YWlscy5yYWYoY2FsbGJhY2ssIDIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdXAgdGhlIGluaXRpYWwgc3R5bGVzIGJlZm9yZSB0aGUgYW5pbWF0aW9uIGlzIHN0YXJ0ZWRcbiAgICovXG4gIHNldHVwKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmRhdGEuZnJvbVN0eWxlcyAhPSBudWxsKSB0aGlzLmFwcGx5U3R5bGVzKHRoaXMuZGF0YS5mcm9tU3R5bGVzKTtcbiAgICBpZiAodGhpcy5kYXRhLmR1cmF0aW9uICE9IG51bGwpXG4gICAgICB0aGlzLmFwcGx5U3R5bGVzKHsndHJhbnNpdGlvbkR1cmF0aW9uJzogdGhpcy5kYXRhLmR1cmF0aW9uLnRvU3RyaW5nKCkgKyAnbXMnfSk7XG4gICAgaWYgKHRoaXMuZGF0YS5kZWxheSAhPSBudWxsKVxuICAgICAgdGhpcy5hcHBseVN0eWxlcyh7J3RyYW5zaXRpb25EZWxheSc6IHRoaXMuZGF0YS5kZWxheS50b1N0cmluZygpICsgJ21zJ30pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFmdGVyIHRoZSBpbml0aWFsIHNldHVwIGhhcyBvY2N1cnJlZCwgdGhpcyBtZXRob2QgYWRkcyB0aGUgYW5pbWF0aW9uIHN0eWxlc1xuICAgKi9cbiAgc3RhcnQoKTogdm9pZCB7XG4gICAgdGhpcy5hZGRDbGFzc2VzKHRoaXMuZGF0YS5jbGFzc2VzVG9BZGQpO1xuICAgIHRoaXMuYWRkQ2xhc3Nlcyh0aGlzLmRhdGEuYW5pbWF0aW9uQ2xhc3Nlcyk7XG4gICAgdGhpcy5yZW1vdmVDbGFzc2VzKHRoaXMuZGF0YS5jbGFzc2VzVG9SZW1vdmUpO1xuICAgIGlmICh0aGlzLmRhdGEudG9TdHlsZXMgIT0gbnVsbCkgdGhpcy5hcHBseVN0eWxlcyh0aGlzLmRhdGEudG9TdHlsZXMpO1xuICAgIHZhciBjb21wdXRlZFN0eWxlcyA9IERPTS5nZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudCk7XG4gICAgdGhpcy5jb21wdXRlZERlbGF5ID1cbiAgICAgICAgTWF0aC5tYXgodGhpcy5wYXJzZUR1cmF0aW9uU3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAgY29tcHV0ZWRTdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZSh0aGlzLl9zdHJpbmdQcmVmaXggKyAndHJhbnNpdGlvbi1kZWxheScpKSxcbiAgICAgICAgICAgICAgICAgdGhpcy5wYXJzZUR1cmF0aW9uU3RyaW5nKFxuICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLmdldFByb3BlcnR5VmFsdWUodGhpcy5fc3RyaW5nUHJlZml4ICsgJ3RyYW5zaXRpb24tZGVsYXknKSkpO1xuICAgIHRoaXMuY29tcHV0ZWREdXJhdGlvbiA9IE1hdGgubWF4KHRoaXMucGFyc2VEdXJhdGlvblN0cmluZyhjb21wdXRlZFN0eWxlcy5nZXRQcm9wZXJ0eVZhbHVlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zdHJpbmdQcmVmaXggKyAndHJhbnNpdGlvbi1kdXJhdGlvbicpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcnNlRHVyYXRpb25TdHJpbmcodGhpcy5lbGVtZW50LnN0eWxlLmdldFByb3BlcnR5VmFsdWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3N0cmluZ1ByZWZpeCArICd0cmFuc2l0aW9uLWR1cmF0aW9uJykpKTtcbiAgICB0aGlzLmFkZEV2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgdGhlIHByb3ZpZGVkIHN0eWxlcyB0byB0aGUgZWxlbWVudFxuICAgKiBAcGFyYW0gc3R5bGVzXG4gICAqL1xuICBhcHBseVN0eWxlcyhzdHlsZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogdm9pZCB7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHN0eWxlcywgKHZhbHVlOiBhbnksIGtleTogc3RyaW5nKSA9PiB7XG4gICAgICB2YXIgZGFzaENhc2VLZXkgPSBjYW1lbENhc2VUb0Rhc2hDYXNlKGtleSk7XG4gICAgICBpZiAoaXNQcmVzZW50KERPTS5nZXRTdHlsZSh0aGlzLmVsZW1lbnQsIGRhc2hDYXNlS2V5KSkpIHtcbiAgICAgICAgRE9NLnNldFN0eWxlKHRoaXMuZWxlbWVudCwgZGFzaENhc2VLZXksIHZhbHVlLnRvU3RyaW5nKCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgRE9NLnNldFN0eWxlKHRoaXMuZWxlbWVudCwgdGhpcy5fc3RyaW5nUHJlZml4ICsgZGFzaENhc2VLZXksIHZhbHVlLnRvU3RyaW5nKCkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgdGhlIHByb3ZpZGVkIGNsYXNzZXMgdG8gdGhlIGVsZW1lbnRcbiAgICogQHBhcmFtIGNsYXNzZXNcbiAgICovXG4gIGFkZENsYXNzZXMoY2xhc3Nlczogc3RyaW5nW10pOiB2b2lkIHtcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gY2xhc3Nlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykgRE9NLmFkZENsYXNzKHRoaXMuZWxlbWVudCwgY2xhc3Nlc1tpXSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgcHJvdmlkZWQgY2xhc3NlcyBmcm9tIHRoZSBlbGVtZW50XG4gICAqIEBwYXJhbSBjbGFzc2VzXG4gICAqL1xuICByZW1vdmVDbGFzc2VzKGNsYXNzZXM6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGNsYXNzZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIERPTS5yZW1vdmVDbGFzcyh0aGlzLmVsZW1lbnQsIGNsYXNzZXNbaV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnRzIHRvIHRyYWNrIHdoZW4gYW5pbWF0aW9ucyBoYXZlIGZpbmlzaGVkXG4gICAqL1xuICBhZGRFdmVudHMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudG90YWxUaW1lID4gMCkge1xuICAgICAgdGhpcy5ldmVudENsZWFyRnVuY3Rpb25zLnB1c2goRE9NLm9uQW5kQ2FuY2VsKFxuICAgICAgICAgIHRoaXMuZWxlbWVudCwgRE9NLmdldFRyYW5zaXRpb25FbmQoKSwgKGV2ZW50OiBhbnkpID0+IHRoaXMuaGFuZGxlQW5pbWF0aW9uRXZlbnQoZXZlbnQpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGFuZGxlQW5pbWF0aW9uQ29tcGxldGVkKCk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlQW5pbWF0aW9uRXZlbnQoZXZlbnQ6IGFueSk6IHZvaWQge1xuICAgIGxldCBlbGFwc2VkVGltZSA9IE1hdGgucm91bmQoZXZlbnQuZWxhcHNlZFRpbWUgKiAxMDAwKTtcbiAgICBpZiAoIXRoaXMuYnJvd3NlckRldGFpbHMuZWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5KSBlbGFwc2VkVGltZSArPSB0aGlzLmNvbXB1dGVkRGVsYXk7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgaWYgKGVsYXBzZWRUaW1lID49IHRoaXMudG90YWxUaW1lKSB0aGlzLmhhbmRsZUFuaW1hdGlvbkNvbXBsZXRlZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1bnMgYWxsIGFuaW1hdGlvbiBjYWxsYmFja3MgYW5kIHJlbW92ZXMgdGVtcG9yYXJ5IGNsYXNzZXNcbiAgICovXG4gIGhhbmRsZUFuaW1hdGlvbkNvbXBsZXRlZCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlbW92ZUNsYXNzZXModGhpcy5kYXRhLmFuaW1hdGlvbkNsYXNzZXMpO1xuICAgIHRoaXMuY2FsbGJhY2tzLmZvckVhY2goY2FsbGJhY2sgPT4gY2FsbGJhY2soKSk7XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXTtcbiAgICB0aGlzLmV2ZW50Q2xlYXJGdW5jdGlvbnMuZm9yRWFjaChmbiA9PiBmbigpKTtcbiAgICB0aGlzLmV2ZW50Q2xlYXJGdW5jdGlvbnMgPSBbXTtcbiAgICB0aGlzLmNvbXBsZXRlZCA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbmltYXRpb24gY2FsbGJhY2tzIHRvIGJlIGNhbGxlZCB1cG9uIGNvbXBsZXRpb25cbiAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAqIEByZXR1cm5zIHtBbmltYXRpb259XG4gICAqL1xuICBvbkNvbXBsZXRlKGNhbGxiYWNrOiBGdW5jdGlvbik6IEFuaW1hdGlvbiB7XG4gICAgaWYgKHRoaXMuY29tcGxldGVkKSB7XG4gICAgICBjYWxsYmFjaygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgdGhlIGR1cmF0aW9uIHN0cmluZyB0byB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kc1xuICAgKiBAcGFyYW0gZHVyYXRpb25cbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIHBhcnNlRHVyYXRpb25TdHJpbmcoZHVyYXRpb246IHN0cmluZyk6IG51bWJlciB7XG4gICAgdmFyIG1heFZhbHVlID0gMDtcbiAgICAvLyBkdXJhdGlvbiBtdXN0IGhhdmUgYXQgbGVhc3QgMiBjaGFyYWN0ZXJzIHRvIGJlIHZhbGlkLiAobnVtYmVyICsgdHlwZSlcbiAgICBpZiAoZHVyYXRpb24gPT0gbnVsbCB8fCBkdXJhdGlvbi5sZW5ndGggPCAyKSB7XG4gICAgICByZXR1cm4gbWF4VmFsdWU7XG4gICAgfSBlbHNlIGlmIChkdXJhdGlvbi5zdWJzdHJpbmcoZHVyYXRpb24ubGVuZ3RoIC0gMikgPT0gJ21zJykge1xuICAgICAgbGV0IHZhbHVlID0gTnVtYmVyV3JhcHBlci5wYXJzZUludCh0aGlzLnN0cmlwTGV0dGVycyhkdXJhdGlvbiksIDEwKTtcbiAgICAgIGlmICh2YWx1ZSA+IG1heFZhbHVlKSBtYXhWYWx1ZSA9IHZhbHVlO1xuICAgIH0gZWxzZSBpZiAoZHVyYXRpb24uc3Vic3RyaW5nKGR1cmF0aW9uLmxlbmd0aCAtIDEpID09ICdzJykge1xuICAgICAgbGV0IG1zID0gTnVtYmVyV3JhcHBlci5wYXJzZUZsb2F0KHRoaXMuc3RyaXBMZXR0ZXJzKGR1cmF0aW9uKSkgKiAxMDAwO1xuICAgICAgbGV0IHZhbHVlID0gTWF0aC5mbG9vcihtcyk7XG4gICAgICBpZiAodmFsdWUgPiBtYXhWYWx1ZSkgbWF4VmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG1heFZhbHVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0cmlwcyB0aGUgbGV0dGVycyBmcm9tIHRoZSBkdXJhdGlvbiBzdHJpbmdcbiAgICogQHBhcmFtIHN0clxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgc3RyaXBMZXR0ZXJzKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHN0ciwgUmVnRXhwV3JhcHBlci5jcmVhdGUoJ1teMC05XSskJywgJycpLCAnJyk7XG4gIH1cbn1cbiJdfQ==