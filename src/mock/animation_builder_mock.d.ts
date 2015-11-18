import { AnimationBuilder } from 'angular2/src/animate/animation_builder';
import { CssAnimationBuilder } from 'angular2/src/animate/css_animation_builder';
export declare class MockAnimationBuilder extends AnimationBuilder {
    constructor();
    css(): CssAnimationBuilder;
}
