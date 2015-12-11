import { DateWrapper, StringWrapper, RegExpWrapper, NumberWrapper } from 'angular2/src/facade/lang';
import { Math } from 'angular2/src/facade/math';
import { camelCaseToDashCase } from 'angular2/src/platform/dom/util';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
export class Animation {
    /**
     * Stores the start time and starts the animation
     * @param element
     * @param data
     * @param browserDetails
     */
    constructor(element, data, browserDetails) {
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
        this.startTime = DateWrapper.toMillis(DateWrapper.now());
        this._stringPrefix = DOM.getAnimationPrefix();
        this.setup();
        this.wait(timestamp => this.start());
    }
    /** total amount of time that the animation should take including delay */
    get totalTime() {
        let delay = this.computedDelay != null ? this.computedDelay : 0;
        let duration = this.computedDuration != null ? this.computedDuration : 0;
        return delay + duration;
    }
    wait(callback) {
        // Firefox requires 2 frames for some reason
        this.browserDetails.raf(callback, 2);
    }
    /**
     * Sets up the initial styles before the animation is started
     */
    setup() {
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
        if (!StringMapWrapper.isEmpty(this.data.animationStyles)) {
            // it's important that we setup a list of the styles and their
            // initial inline style values prior to applying the animation
            // styles such that we can restore the values after the animation
            // has been completed.
            StringMapWrapper.keys(this.data.animationStyles)
                .forEach((prop) => { this._temporaryStyles[prop] = this._readStyle(prop); });
            this.applyStyles(this.data.animationStyles);
        }
    }
    /**
     * After the initial setup has occurred, this method adds the animation styles
     */
    start() {
        this.addClasses(this.data.classesToAdd);
        this.addClasses(this.data.animationClasses);
        this.removeClasses(this.data.classesToRemove);
        if (this.data.toStyles != null)
            this.applyStyles(this.data.toStyles);
        var computedStyles = DOM.getComputedStyle(this.element);
        this.computedDelay =
            Math.max(this.parseDurationString(computedStyles.getPropertyValue(this._stringPrefix + 'transition-delay')), this.parseDurationString(this.element.style.getPropertyValue(this._stringPrefix + 'transition-delay')));
        this.computedDuration = Math.max(this.parseDurationString(computedStyles.getPropertyValue(this._stringPrefix + 'transition-duration')), this.parseDurationString(this.element.style.getPropertyValue(this._stringPrefix + 'transition-duration')));
        this.addEvents();
    }
    /**
     * Applies the provided styles to the element
     * @param styles
     */
    applyStyles(styles) {
        StringMapWrapper.forEach(styles, (value, key) => {
            var prop = this._formatStyleProp(key);
            DOM.setStyle(this.element, prop, value.toString());
        });
    }
    /**
     * Adds the provided classes to the element
     * @param classes
     */
    addClasses(classes) {
        for (let i = 0, len = classes.length; i < len; i++)
            DOM.addClass(this.element, classes[i]);
    }
    /**
     * Removes the provided classes from the element
     * @param classes
     */
    removeClasses(classes) {
        for (let i = 0, len = classes.length; i < len; i++)
            DOM.removeClass(this.element, classes[i]);
    }
    _readStyle(prop) {
        return DOM.getStyle(this.element, this._formatStyleProp(prop));
    }
    _formatStyleProp(prop) {
        prop = camelCaseToDashCase(prop);
        return prop.indexOf('animation') >= 0 ? this._stringPrefix + prop : prop;
    }
    _removeAndRestoreStyles(styles) {
        StringMapWrapper.forEach(styles, (value, prop) => {
            prop = this._formatStyleProp(prop);
            if (value.length > 0) {
                DOM.setStyle(this.element, prop, value);
            }
            else {
                DOM.removeStyle(this.element, prop);
            }
        });
    }
    /**
     * Adds events to track when animations have finished
     */
    addEvents() {
        if (this.totalTime > 0) {
            this.eventClearFunctions.push(DOM.onAndCancel(this.element, DOM.getTransitionEnd(), (event) => this.handleAnimationEvent(event)));
        }
        else {
            this.handleAnimationCompleted();
        }
    }
    handleAnimationEvent(event) {
        let elapsedTime = Math.round(event.elapsedTime * 1000);
        if (!this.browserDetails.elapsedTimeIncludesDelay)
            elapsedTime += this.computedDelay;
        event.stopPropagation();
        if (elapsedTime >= this.totalTime)
            this.handleAnimationCompleted();
    }
    /**
     * Runs all animation callbacks and removes temporary classes
     */
    handleAnimationCompleted() {
        this.removeClasses(this.data.animationClasses);
        this._removeAndRestoreStyles(this._temporaryStyles);
        this._temporaryStyles = {};
        this.callbacks.forEach(callback => callback());
        this.callbacks = [];
        this.eventClearFunctions.forEach(fn => fn());
        this.eventClearFunctions = [];
        this.completed = true;
    }
    /**
     * Adds animation callbacks to be called upon completion
     * @param callback
     * @returns {Animation}
     */
    onComplete(callback) {
        if (this.completed) {
            callback();
        }
        else {
            this.callbacks.push(callback);
        }
        return this;
    }
    /**
     * Converts the duration string to the number of milliseconds
     * @param duration
     * @returns {number}
     */
    parseDurationString(duration) {
        var maxValue = 0;
        // duration must have at least 2 characters to be valid. (number + type)
        if (duration == null || duration.length < 2) {
            return maxValue;
        }
        else if (duration.substring(duration.length - 2) == 'ms') {
            let value = NumberWrapper.parseInt(this.stripLetters(duration), 10);
            if (value > maxValue)
                maxValue = value;
        }
        else if (duration.substring(duration.length - 1) == 's') {
            let ms = NumberWrapper.parseFloat(this.stripLetters(duration)) * 1000;
            let value = Math.floor(ms);
            if (value > maxValue)
                maxValue = value;
        }
        return maxValue;
    }
    /**
     * Strips the letters from the duration string
     * @param str
     * @returns {string}
     */
    stripLetters(str) {
        return StringWrapper.replaceAll(str, RegExpWrapper.create('[^0-9]+$', ''), '');
    }
}
