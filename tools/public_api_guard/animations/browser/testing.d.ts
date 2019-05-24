export declare class MockAnimationDriver implements AnimationDriver {
    animate(element: any, keyframes: {
        [key: string]: string | number;
    }[], duration: number, delay: number, easing: string, previousPlayers?: any[]): MockAnimationPlayer;
    computeStyle(element: any, prop: string, defaultValue?: string): string;
    containsElement(elm1: any, elm2: any): boolean;
    matchesElement(element: any, selector: string): boolean;
    query(element: any, selector: string, multi: boolean): any[];
    validateStyleProperty(prop: string): boolean;
    static log: AnimationPlayer[];
}

export declare class MockAnimationPlayer extends NoopAnimationPlayer {
    currentSnapshot: ɵStyleData;
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
    beforeDestroy(): void;
    destroy(): void;
    finish(): void;
    hasStarted(): boolean;
    play(): void;
}
