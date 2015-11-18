export declare class BrowserDetails {
    elapsedTimeIncludesDelay: boolean;
    constructor();
    /**
     * Determines if `event.elapsedTime` includes transition delay in the current browser.  At this
     * time, Chrome and Opera seem to be the only browsers that include this.
     */
    doesElapsedTimeIncludesDelay(): void;
    raf(callback: Function, frames?: number): Function;
}
