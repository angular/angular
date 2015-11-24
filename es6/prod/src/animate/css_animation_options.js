export class CssAnimationOptions {
    constructor() {
        /** classes to be added to the element */
        this.classesToAdd = [];
        /** classes to be removed from the element */
        this.classesToRemove = [];
        /** classes to be added for the duration of the animation */
        this.animationClasses = [];
        /** styles to be applied for the duration of the animation */
        this.animationStyles = {};
    }
}
