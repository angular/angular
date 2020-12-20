export declare function animate(timings: string | number, styles?: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata | null): AnimationAnimateMetadata;

export declare function animateChild(options?: AnimateChildOptions | null): AnimationAnimateChildMetadata;

export declare interface AnimateChildOptions extends AnimationOptions {
    duration?: number | string;
}

export declare type AnimateTimings = {
    duration: number;
    delay: number;
    easing: string | null;
};

export declare function animation(steps: AnimationMetadata | AnimationMetadata[], options?: AnimationOptions | null): AnimationReferenceMetadata;

export declare interface AnimationAnimateChildMetadata extends AnimationMetadata {
    options: AnimationOptions | null;
}

export declare interface AnimationAnimateMetadata extends AnimationMetadata {
    styles: AnimationStyleMetadata | AnimationKeyframesSequenceMetadata | null;
    timings: string | number | AnimateTimings;
}

export declare interface AnimationAnimateRefMetadata extends AnimationMetadata {
    animation: AnimationReferenceMetadata;
    options: AnimationOptions | null;
}

export declare abstract class AnimationBuilder {
    abstract build(animation: AnimationMetadata | AnimationMetadata[]): AnimationFactory;
}

export declare interface AnimationEvent {
    disabled: boolean;
    element: any;
    fromState: string;
    phaseName: string;
    toState: string;
    totalTime: number;
    triggerName: string;
}

export declare abstract class AnimationFactory {
    abstract create(element: any, options?: AnimationOptions): AnimationPlayer;
}

export declare interface AnimationGroupMetadata extends AnimationMetadata {
    options: AnimationOptions | null;
    steps: AnimationMetadata[];
}

export declare interface AnimationKeyframesSequenceMetadata extends AnimationMetadata {
    steps: AnimationStyleMetadata[];
}

export declare interface AnimationMetadata {
    type: AnimationMetadataType;
}

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
    Stagger = 12
}

export declare interface AnimationOptions {
    delay?: number | string;
    params?: {
        [name: string]: any;
    };
}

export declare interface AnimationPlayer {
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
    setPosition(position: any /** TODO #9100 */): void;
}

export declare interface AnimationQueryMetadata extends AnimationMetadata {
    animation: AnimationMetadata | AnimationMetadata[];
    options: AnimationQueryOptions | null;
    selector: string;
}

export declare interface AnimationQueryOptions extends AnimationOptions {
    limit?: number;
    optional?: boolean;
}

export declare interface AnimationReferenceMetadata extends AnimationMetadata {
    animation: AnimationMetadata | AnimationMetadata[];
    options: AnimationOptions | null;
}

export declare interface AnimationSequenceMetadata extends AnimationMetadata {
    options: AnimationOptions | null;
    steps: AnimationMetadata[];
}

export declare interface AnimationStaggerMetadata extends AnimationMetadata {
    animation: AnimationMetadata | AnimationMetadata[];
    timings: string | number;
}

export declare interface AnimationStateMetadata extends AnimationMetadata {
    name: string;
    options?: {
        params: {
            [name: string]: any;
        };
    };
    styles: AnimationStyleMetadata;
}

export declare interface AnimationStyleMetadata extends AnimationMetadata {
    offset: number | null;
    styles: '*' | {
        [key: string]: string | number;
    } | Array<{
        [key: string]: string | number;
    } | '*'>;
}

export declare interface AnimationTransitionMetadata extends AnimationMetadata {
    animation: AnimationMetadata | AnimationMetadata[];
    expr: string | ((fromState: string, toState: string, element?: any, params?: {
        [key: string]: any;
    }) => boolean);
    options: AnimationOptions | null;
}

export declare interface AnimationTriggerMetadata extends AnimationMetadata {
    definitions: AnimationMetadata[];
    name: string;
    options: {
        params?: {
            [name: string]: any;
        };
    } | null;
}

export declare const AUTO_STYLE = "*";

export declare function group(steps: AnimationMetadata[], options?: AnimationOptions | null): AnimationGroupMetadata;

export declare function keyframes(steps: AnimationStyleMetadata[]): AnimationKeyframesSequenceMetadata;

export declare class NoopAnimationPlayer implements AnimationPlayer {
    parentPlayer: AnimationPlayer | null;
    readonly totalTime: number;
    constructor(duration?: number, delay?: number);
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
    setPosition(position: number): void;
}

export declare function query(selector: string, animation: AnimationMetadata | AnimationMetadata[], options?: AnimationQueryOptions | null): AnimationQueryMetadata;

export declare function sequence(steps: AnimationMetadata[], options?: AnimationOptions | null): AnimationSequenceMetadata;

export declare function stagger(timings: string | number, animation: AnimationMetadata | AnimationMetadata[]): AnimationStaggerMetadata;

export declare function state(name: string, styles: AnimationStyleMetadata, options?: {
    params: {
        [name: string]: any;
    };
}): AnimationStateMetadata;

export declare function style(tokens: '*' | {
    [key: string]: string | number;
} | Array<'*' | {
    [key: string]: string | number;
}>): AnimationStyleMetadata;

export declare function transition(stateChangeExpr: string | ((fromState: string, toState: string, element?: any, params?: {
    [key: string]: any;
}) => boolean), steps: AnimationMetadata | AnimationMetadata[], options?: AnimationOptions | null): AnimationTransitionMetadata;

export declare function trigger(name: string, definitions: AnimationMetadata[]): AnimationTriggerMetadata;

export declare function useAnimation(animation: AnimationReferenceMetadata, options?: AnimationOptions | null): AnimationAnimateRefMetadata;
