import { CssAnimationOptions } from './css_animation_options';
import { Animation } from './animation';
import { BrowserDetails } from './browser_details';
export declare class CssAnimationBuilder {
    browserDetails: BrowserDetails;
    /** @type {CssAnimationOptions} */
    data: CssAnimationOptions;
    /**
     * Accepts public properties for CssAnimationBuilder
     */
    constructor(browserDetails: BrowserDetails);
    /**
     * Adds a temporary class that will be removed at the end of the animation
     * @param className
     */
    addAnimationClass(className: string): CssAnimationBuilder;
    /**
     * Adds a class that will remain on the element after the animation has finished
     * @param className
     */
    addClass(className: string): CssAnimationBuilder;
    /**
     * Removes a class from the element
     * @param className
     */
    removeClass(className: string): CssAnimationBuilder;
    /**
     * Sets the animation duration (and overrides any defined through CSS)
     * @param duration
     */
    setDuration(duration: number): CssAnimationBuilder;
    /**
     * Sets the animation delay (and overrides any defined through CSS)
     * @param delay
     */
    setDelay(delay: number): CssAnimationBuilder;
    /**
     * Sets styles for both the initial state and the destination state
     * @param from
     * @param to
     */
    setStyles(from: {
        [key: string]: any;
    }, to: {
        [key: string]: any;
    }): CssAnimationBuilder;
    /**
     * Sets the initial styles for the animation
     * @param from
     */
    setFromStyles(from: {
        [key: string]: any;
    }): CssAnimationBuilder;
    /**
     * Sets the destination styles for the animation
     * @param to
     */
    setToStyles(to: {
        [key: string]: any;
    }): CssAnimationBuilder;
    /**
     * Starts the animation and returns a promise
     * @param element
     */
    start(element: HTMLElement): Animation;
}
