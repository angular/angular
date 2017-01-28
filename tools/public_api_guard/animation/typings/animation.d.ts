/** @experimental */
export declare function animate(timings: string | number, styles?: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata): AnimationAnimateMetadata;

/** @experimental */
export declare class Animation {
    constructor(input: AnimationMetadata | AnimationMetadata[]);
    buildTimelines(startingStyles: StyleData | StyleData[], destinationStyles: StyleData | StyleData[]): AnimationTimelineInstruction[];
}

/** @experimental */
export interface AnimationGroupMetadata extends AnimationMetadata {
    steps: AnimationMetadata[];
}

/** @experimental */
export interface AnimationKeyframesSequenceMetadata extends AnimationMetadata {
    steps: AnimationStyleMetadata[];
}

/** @experimental */
export declare class AnimationModule {
}

/** @experimental */
export interface AnimationSequenceMetadata extends AnimationMetadata {
    steps: AnimationMetadata[];
}

/** @experimental */
export interface AnimationStateMetadata extends AnimationMetadata {
    name: string;
    styles: AnimationStyleMetadata;
}

/** @experimental */
export interface AnimationStyleMetadata extends AnimationMetadata {
    offset: number;
    styles: StyleData[];
}

/** @experimental */
export interface AnimationTransitionMetadata extends AnimationMetadata {
    animation: AnimationMetadata;
    expr: string | ((fromState: string, toState: string) => boolean);
}

/** @experimental */
export declare class AnimationTrigger implements Trigger {
    name: string;
    states: {
        [stateName: string]: StyleData;
    };
    transitionFactories: AnimationTransitionFactory[];
    constructor(name: string, states: {
        [stateName: string]: StyleData;
    }, _transitionAsts: AnimationTransitionMetadata[]);
    matchTransition(currentState: any, nextState: any): AnimationTransitionInstruction;
}

/** @experimental */
export declare const AUTO_STYLE = "*";

/** @experimental */
export declare function group(steps: AnimationMetadata[]): AnimationGroupMetadata;

/** @experimental */
export declare function keyframes(steps: AnimationStyleMetadata[]): AnimationKeyframesSequenceMetadata;

/** @experimental */
export declare function sequence(steps: AnimationMetadata[]): AnimationSequenceMetadata;

/** @experimental */
export declare function state(name: string, styles: AnimationStyleMetadata): AnimationStateMetadata;

/** @experimental */
export declare function style(tokens: {
    [key: string]: string | number;
} | Array<{
    [key: string]: string | number;
}>): AnimationStyleMetadata;

/** @experimental */
export declare function transition(stateChangeExpr: string | ((fromState: string, toState: string) => boolean), steps: AnimationMetadata | AnimationMetadata[]): AnimationTransitionMetadata;

/** @experimental */
export declare function trigger(name: string, definitions: AnimationMetadata[]): AnimationTrigger;
