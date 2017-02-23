/** @experimental */
export declare abstract class AnimationDriver {
    abstract animate(element: any, keyframes: {
        [key: string]: string | number;
    }[], duration: number, delay: number, easing: string, previousPlayers?: any[]): any;
    static NOOP: AnimationDriver;
}

/** @experimental */
export declare class BrowserAnimationModule {
}

/** @experimental */
export declare class NoopBrowserAnimationModule {
}
