export interface NgMatchers extends jasmine.Matchers {
    toBePromise(): boolean;
    toBeAnInstanceOf(expected: any): boolean;
    toHaveText(expected: any): boolean;
    toHaveCssClass(expected: any): boolean;
    toImplement(expected: any): boolean;
    toContainError(expected: any): boolean;
    toThrowErrorWith(expectedMessage: any): boolean;
    not: NgMatchers;
}
export declare var expect: (actual: any) => NgMatchers;
