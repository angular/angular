/** @experimental */
export declare function animate(timings: string | number, styles?: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata | null): AnimationAnimateMetadata;

/** @experimental */
export declare type AnimateTimings = {
    duration: number;
    delay: number;
    easing: string | null;
};

/** @experimental */
export interface AnimationAnimateMetadata extends AnimationMetadata {
    styles: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata | null;
    timings: string | number | AnimateTimings;
}

/** @experimental */
export interface AnimationEvent {
    element: any;
    fromState: string;
    phaseName: string;
    toState: string;
    totalTime: number;
    triggerName: string;
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
export interface AnimationMetadata {
    type: AnimationMetadataType;
}

/** @experimental */
export declare const enum AnimationMetadataType {
    State = 0,
    Transition = 1,
    Sequence = 2,
    Group = 3,
    Animate = 4,
    KeyframeSequence = 5,
    Style = 6,
}

/** @experimental */
export declare abstract class AnimationPlayer {
    parentPlayer: AnimationPlayer | null;
    abstract destroy(): void;
    abstract finish(): void;
    abstract getPosition(): number;
    abstract hasStarted(): boolean;
    abstract init(): void;
    abstract onDestroy(fn: () => void): void;
    abstract onDone(fn: () => void): void;
    abstract onStart(fn: () => void): void;
    abstract pause(): void;
    abstract play(): void;
    abstract reset(): void;
    abstract restart(): void;
    abstract setPosition(p: any): void;
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
    offset?: number;
    styles: {
        [key: string]: string | number;
    } | {
        [key: string]: string | number;
    }[];
}

/** @experimental */
export interface AnimationTransitionMetadata extends AnimationMetadata {
    animation: AnimationMetadata | AnimationMetadata[];
    expr: string | ((fromState: string, toState: string) => boolean);
}

/** @experimental */
export interface AnimationTriggerMetadata {
    definitions: AnimationMetadata[];
    name: string;
}

/** @experimental */
export declare const AUTO_STYLE = "*";

/** @experimental */
export declare function group(steps: AnimationMetadata[]): AnimationGroupMetadata;

/** @experimental */
export declare function keyframes(steps: AnimationStyleMetadata[]): AnimationKeyframesSequenceMetadata;

/** @experimental */
export declare class NoopAnimationPlayer implements AnimationPlayer {
    parentPlayer: AnimationPlayer | null;
    constructor();
    destroy(): void;
    finish(): void;
    getPosition(): number;
    hasStarted(): boolean;
    init(): void;
    onDestroy(fn: () => void): void;
    onDone(fn: () => void): void;
    onStart(fn: () => void): void;
    pause(): void;
    play(): void;
    reset(): void;
    restart(): void;
    setPosition(p: number): void;
}

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
export declare function trigger(name: string, definitions: AnimationMetadata[]): AnimationTriggerMetadata;
