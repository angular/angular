/** @experimental */
export declare abstract class AnimationDriver {
    abstract animate(element: any, keyframes: {
        [key: string]: string | number;
    }[], duration: number, delay: number, easing?: string | null, previousPlayers?: any[]): any;
    abstract computeStyle(element: any, prop: string, defaultValue?: string): string;
    abstract containsElement(elm1: any, elm2: any): boolean;
    abstract matchesElement(element: any, selector: string): boolean;
    abstract query(element: any, selector: string, multi: boolean): any[];
    static NOOP: AnimationDriver;
}
