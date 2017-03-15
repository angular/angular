/** @experimental */
export declare class MockAnimationDriver implements AnimationDriver {
    animate(element: any, keyframes: {
        [key: string]: string | number;
    }[], duration: number, delay: number, easing: string, previousPlayers?: any[]): MockAnimationPlayer;
    static log: AnimationPlayer[];
}

/** @experimental */
export declare class MockAnimationPlayer extends NoopAnimationPlayer {
    delay: number;
    duration: number;
    easing: string;
    element: any;
    keyframes: {
        [key: string]: string | number;
    }[];
    previousPlayers: any[];
    previousStyles: {
        [key: string]: string | number;
    };
    constructor(element: any, keyframes: {
        [key: string]: string | number;
    }[], duration: number, delay: number, easing: string, previousPlayers: any[]);
    destroy(): void;
    finish(): void;
}
