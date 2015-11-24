import { CssAnimationOptions } from './css_animation_options';
import { Animation } from './animation';
export class CssAnimationBuilder {
    /**
     * Accepts public properties for CssAnimationBuilder
     */
    constructor(browserDetails) {
        this.browserDetails = browserDetails;
        /** @type {CssAnimationOptions} */
        this.data = new CssAnimationOptions();
    }
    /**
     * Adds a temporary class that will be removed at the end of the animation
     * @param className
     */
    addAnimationClass(className) {
        this.data.animationClasses.push(className);
        return this;
    }
    /**
     * Adds a class that will remain on the element after the animation has finished
     * @param className
     */
    addClass(className) {
        this.data.classesToAdd.push(className);
        return this;
    }
    /**
     * Removes a class from the element
     * @param className
     */
    removeClass(className) {
        this.data.classesToRemove.push(className);
        return this;
    }
    /**
     * Sets the animation duration (and overrides any defined through CSS)
     * @param duration
     */
    setDuration(duration) {
        this.data.duration = duration;
        return this;
    }
    /**
     * Sets the animation delay (and overrides any defined through CSS)
     * @param delay
     */
    setDelay(delay) {
        this.data.delay = delay;
        return this;
    }
    /**
     * Sets styles for both the initial state and the destination state
     * @param from
     * @param to
     */
    setStyles(from, to) {
        return this.setFromStyles(from).setToStyles(to);
    }
    /**
     * Sets the initial styles for the animation
     * @param from
     */
    setFromStyles(from) {
        this.data.fromStyles = from;
        return this;
    }
    /**
     * Sets the destination styles for the animation
     * @param to
     */
    setToStyles(to) {
        this.data.toStyles = to;
        return this;
    }
    /**
     * Starts the animation and returns a promise
     * @param element
     */
    start(element) {
        return new Animation(element, this.data, this.browserDetails);
    }
}
