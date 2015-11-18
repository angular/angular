'use strict';var css_animation_options_1 = require('./css_animation_options');
var animation_1 = require('./animation');
var CssAnimationBuilder = (function () {
    /**
     * Accepts public properties for CssAnimationBuilder
     */
    function CssAnimationBuilder(browserDetails) {
        this.browserDetails = browserDetails;
        /** @type {CssAnimationOptions} */
        this.data = new css_animation_options_1.CssAnimationOptions();
    }
    /**
     * Adds a temporary class that will be removed at the end of the animation
     * @param className
     */
    CssAnimationBuilder.prototype.addAnimationClass = function (className) {
        this.data.animationClasses.push(className);
        return this;
    };
    /**
     * Adds a class that will remain on the element after the animation has finished
     * @param className
     */
    CssAnimationBuilder.prototype.addClass = function (className) {
        this.data.classesToAdd.push(className);
        return this;
    };
    /**
     * Removes a class from the element
     * @param className
     */
    CssAnimationBuilder.prototype.removeClass = function (className) {
        this.data.classesToRemove.push(className);
        return this;
    };
    /**
     * Sets the animation duration (and overrides any defined through CSS)
     * @param duration
     */
    CssAnimationBuilder.prototype.setDuration = function (duration) {
        this.data.duration = duration;
        return this;
    };
    /**
     * Sets the animation delay (and overrides any defined through CSS)
     * @param delay
     */
    CssAnimationBuilder.prototype.setDelay = function (delay) {
        this.data.delay = delay;
        return this;
    };
    /**
     * Sets styles for both the initial state and the destination state
     * @param from
     * @param to
     */
    CssAnimationBuilder.prototype.setStyles = function (from, to) {
        return this.setFromStyles(from).setToStyles(to);
    };
    /**
     * Sets the initial styles for the animation
     * @param from
     */
    CssAnimationBuilder.prototype.setFromStyles = function (from) {
        this.data.fromStyles = from;
        return this;
    };
    /**
     * Sets the destination styles for the animation
     * @param to
     */
    CssAnimationBuilder.prototype.setToStyles = function (to) {
        this.data.toStyles = to;
        return this;
    };
    /**
     * Starts the animation and returns a promise
     * @param element
     */
    CssAnimationBuilder.prototype.start = function (element) {
        return new animation_1.Animation(element, this.data, this.browserDetails);
    };
    return CssAnimationBuilder;
})();
exports.CssAnimationBuilder = CssAnimationBuilder;
//# sourceMappingURL=css_animation_builder.js.map