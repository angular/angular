import { BrowserDetails } from './browser_details';
import { CssAnimationOptions } from './css_animation_options';
export declare class Animation {
    element: HTMLElement;
    data: CssAnimationOptions;
    browserDetails: BrowserDetails;
    /** functions to be called upon completion */
    callbacks: Function[];
    /** the duration (ms) of the animation (whether from CSS or manually set) */
    computedDuration: number;
    /** the animation delay (ms) (whether from CSS or manually set) */
    computedDelay: number;
    /** timestamp of when the animation started */
    startTime: number;
    /** functions for removing event listeners */
    eventClearFunctions: Function[];
    /** flag used to track whether or not the animation has finished */
    completed: boolean;
    private _stringPrefix;
    /** total amount of time that the animation should take including delay */
    totalTime: number;
    /**
     * Stores the start time and starts the animation
     * @param element
     * @param data
     * @param browserDetails
     */
    constructor(element: HTMLElement, data: CssAnimationOptions, browserDetails: BrowserDetails);
    wait(callback: Function): void;
    /**
     * Sets up the initial styles before the animation is started
     */
    setup(): void;
    /**
     * After the initial setup has occurred, this method adds the animation styles
     */
    start(): void;
    /**
     * Applies the provided styles to the element
     * @param styles
     */
    applyStyles(styles: {
        [key: string]: any;
    }): void;
    /**
     * Adds the provided classes to the element
     * @param classes
     */
    addClasses(classes: string[]): void;
    /**
     * Removes the provided classes from the element
     * @param classes
     */
    removeClasses(classes: string[]): void;
    /**
     * Adds events to track when animations have finished
     */
    addEvents(): void;
    handleAnimationEvent(event: any): void;
    /**
     * Runs all animation callbacks and removes temporary classes
     */
    handleAnimationCompleted(): void;
    /**
     * Adds animation callbacks to be called upon completion
     * @param callback
     * @returns {Animation}
     */
    onComplete(callback: Function): Animation;
    /**
     * Converts the duration string to the number of milliseconds
     * @param duration
     * @returns {number}
     */
    parseDurationString(duration: string): number;
    /**
     * Strips the letters from the duration string
     * @param str
     * @returns {string}
     */
    stripLetters(str: string): string;
}
