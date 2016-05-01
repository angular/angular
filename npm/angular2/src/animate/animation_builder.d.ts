import { CssAnimationBuilder } from './css_animation_builder';
import { BrowserDetails } from './browser_details';
export declare class AnimationBuilder {
    browserDetails: BrowserDetails;
    /**
     * Used for DI
     * @param browserDetails
     */
    constructor(browserDetails: BrowserDetails);
    /**
     * Creates a new CSS Animation
     * @returns {CssAnimationBuilder}
     */
    css(): CssAnimationBuilder;
}
