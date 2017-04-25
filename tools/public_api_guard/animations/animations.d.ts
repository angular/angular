/** @experimental */
export declare function animate(timings: string | number, styles?: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata | null): AnimationAnimateMetadata;

/** @experimental */
export declare function animateChild(options?: AnimateChildOptions | null): AnimationAnimateChildMetadata;

/** @experimental */
export interface AnimateChildOptions extends AnimationOptions {
    duration?: number | string;
}

/** @experimental */
export declare type AnimateTimings = {
    duration: number;
    delay: number;
    easing: string | null;
};

/** @experimental */
export declare function animation(steps: AnimationMetadata | AnimationMetadata[], options?: AnimationOptions | null): AnimationReferenceMetadata;

/** @experimental */
export interface AnimationAnimateChildMetadata extends AnimationMetadata {
    options: AnimationOptions | null;
}

/** @experimental */
export interface AnimationAnimateMetadata extends AnimationMetadata {
    styles: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata | null;
    timings: string | number | AnimateTimings;
}

/** @experimental */
export interface AnimationAnimateRefMetadata extends AnimationMetadata {
    animation: AnimationReferenceMetadata;
    options: AnimationOptions | null;
}

/** @experimental */
export declare abstract class AnimationBuilder {
    abstract build(animation: AnimationMetadata | AnimationMetadata[]): AnimationFactory;
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
export declare abstract class AnimationFactory {
    abstract create(element: any, options?: AnimationOptions): AnimationPlayer;
}

/** @experimental */
export interface AnimationGroupMetadata extends AnimationMetadata {
    options: AnimationOptions | null;
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
    Keyframes = 5,
    Style = 6,
    Trigger = 7,
    Reference = 8,
    AnimateChild = 9,
    AnimateRef = 10,
    Query = 11,
    Stagger = 12,
}

/** @experimental */
export interface AnimationOptions {
    delay?: number | string;
    params?: {
        [name: string]: any;
    };
}

/** @experimental */
export interface AnimationPlayer {
    beforeDestroy?: () => any;
    parentPlayer: AnimationPlayer | null;
    readonly totalTime: number;
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
    setPosition(p: any): void;
}

/** @experimental */
export interface AnimationQueryMetadata extends AnimationMetadata {
    animation: AnimationMetadata | AnimationMetadata[];
    options: AnimationQueryOptions | null;
    selector: string;
}

/** @experimental */
export interface AnimationQueryOptions extends AnimationOptions {
    limit?: number;
    optional?: boolean;
}

/** @experimental */
export interface AnimationReferenceMetadata extends AnimationMetadata {
    animation: AnimationMetadata | AnimationMetadata[];
    options: AnimationOptions | null;
}

/** @experimental */
export interface AnimationSequenceMetadata extends AnimationMetadata {
    options: AnimationOptions | null;
    steps: AnimationMetadata[];
}

/** @experimental */
export interface AnimationStaggerMetadata extends AnimationMetadata {
    animation: AnimationMetadata | AnimationMetadata[];
    timings: string | number;
}

/** @experimental */
export interface AnimationStateMetadata extends AnimationMetadata {
    name: string;
    styles: AnimationStyleMetadata;
}

/** @experimental */
export interface AnimationStyleMetadata extends AnimationMetadata {
    offset: number | null;
    styles: '*' | {
        [key: string]: string | number;
    } | Array<{
        [key: string]: string | number;
    } | '*'>;
}

/** @experimental */
export interface AnimationTransitionMetadata extends AnimationMetadata {
    animation: AnimationMetadata | AnimationMetadata[];
    expr: string;
    options: AnimationOptions | null;
}

/** @experimental */
export interface AnimationTriggerMetadata extends AnimationMetadata {
    definitions: AnimationMetadata[];
    name: string;
    options: {
        params?: {
            [name: string]: any;
        };
    } | null;
}

/** @experimental */
export declare const AUTO_STYLE = "*";

/** @experimental */
export declare function group(steps: AnimationMetadata[], options?: AnimationOptions | null): AnimationGroupMetadata;

/** @experimental */
export declare function keyframes(steps: AnimationStyleMetadata[]): AnimationKeyframesSequenceMetadata;

/** @experimental */
export declare class NoopAnimationPlayer implements AnimationPlayer {
    parentPlayer: AnimationPlayer | null;
    totalTime: number;
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
export declare function query(selector: string, animation: AnimationMetadata | AnimationMetadata[], options?: AnimationQueryOptions | null): AnimationQueryMetadata;

/** @experimental */
export declare function sequence(steps: AnimationMetadata[], options?: AnimationOptions | null): AnimationSequenceMetadata;

/** @experimental */
export declare function stagger(timings: string | number, animation: AnimationMetadata | AnimationMetadata[]): AnimationStaggerMetadata;

/** @experimental */
export declare function state(name: string, styles: AnimationStyleMetadata): AnimationStateMetadata;

/** @experimental */
export declare function style(tokens: '*' | {
    [key: string]: string | number;
} | Array<'*' | {
    [key: string]: string | number;
}>): AnimationStyleMetadata;

/** @experimental */
export declare function transition(stateChangeExpr: string, steps: AnimationMetadata | AnimationMetadata[], options?: AnimationOptions | null): AnimationTransitionMetadata;

/** @experimental */
export declare function trigger(name: string, definitions: AnimationMetadata[]): AnimationTriggerMetadata;

/** @experimental */
export declare function useAnimation(animation: AnimationReferenceMetadata, options?: AnimationOptions | null): AnimationAnimateRefMetadata;
