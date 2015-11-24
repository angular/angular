'use strict';var lang_1 = require('angular2/src/facade/lang');
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
        this._temporaryStyles = {};
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
        var _this = this;
        if (this.data.fromStyles != null)
            this.applyStyles(this.data.fromStyles);
        if (this.data.duration != null) {
            this._temporaryStyles['transitionDuration'] = this._readStyle('transitionDuration');
            this.applyStyles({ 'transitionDuration': this.data.duration.toString() + 'ms' });
        }
        if (this.data.delay != null) {
            this._temporaryStyles['transitionDelay'] = this._readStyle('transitionDelay');
            this.applyStyles({ 'transitionDelay': this.data.delay.toString() + 'ms' });
        }
        if (!collection_1.StringMapWrapper.isEmpty(this.data.animationStyles)) {
            // it's important that we setup a list of the styles and their
            // initial inline style values prior to applying the animation
            // styles such that we can restore the values after the animation
            // has been completed.
            collection_1.StringMapWrapper.keys(this.data.animationStyles)
                .forEach(function (prop) { _this._temporaryStyles[prop] = _this._readStyle(prop); });
            this.applyStyles(this.data.animationStyles);
        }
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
            var prop = _this._formatStyleProp(key);
            dom_adapter_1.DOM.setStyle(_this.element, prop, value.toString());
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
    Animation.prototype._readStyle = function (prop) {
        return dom_adapter_1.DOM.getStyle(this.element, this._formatStyleProp(prop));
    };
    Animation.prototype._formatStyleProp = function (prop) {
        prop = util_1.camelCaseToDashCase(prop);
        return prop.indexOf('animation') >= 0 ? this._stringPrefix + prop : prop;
    };
    Animation.prototype._removeAndRestoreStyles = function (styles) {
        var _this = this;
        collection_1.StringMapWrapper.forEach(styles, function (value, prop) {
            prop = _this._formatStyleProp(prop);
            if (value.length > 0) {
                dom_adapter_1.DOM.setStyle(_this.element, prop, value);
            }
            else {
                dom_adapter_1.DOM.removeStyle(_this.element, prop);
            }
        });
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
        this._removeAndRestoreStyles(this._temporaryStyles);
        this._temporaryStyles = {};
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
})();
exports.Animation = Animation;
//# sourceMappingURL=animation.js.map