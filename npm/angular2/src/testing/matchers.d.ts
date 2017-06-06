/**
 * Jasmine matchers that check Angular specific conditions.
 */
export interface NgMatchers extends jasmine.Matchers {
    /**
     * Expect the value to be a `Promise`.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toBePromise'}
     */
    toBePromise(): boolean;
    /**
     * Expect the value to be an instance of a class.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toBeAnInstanceOf'}
     */
    toBeAnInstanceOf(expected: any): boolean;
    /**
     * Expect the element to have exactly the given text.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toHaveText'}
     */
    toHaveText(expected: any): boolean;
    /**
     * Expect the element to have the given CSS class.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toHaveCssClass'}
     */
    toHaveCssClass(expected: any): boolean;
    /**
     * Expect the element to have the given CSS styles.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toHaveCssStyle'}
     */
    toHaveCssStyle(expected: any): boolean;
    /**
     * Expect a class to implement the interface of the given class.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toImplement'}
     */
    toImplement(expected: any): boolean;
    /**
     * Expect an exception to contain the given error text.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toContainError'}
     */
    toContainError(expected: any): boolean;
    /**
     * Expect a function to throw an error with the given error text when executed.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toThrowErrorWith'}
     */
    toThrowErrorWith(expectedMessage: any): boolean;
    /**
     * Expect a string to match the given regular expression.
     *
     * ## Example
     *
     * {@example testing/ts/matchers.ts region='toMatchPattern'}
     */
    toMatchPattern(expectedMessage: any): boolean;
    /**
     * Invert the matchers.
     */
    not: NgMatchers;
}
/**
 * Jasmine matching function with Angular matchers mixed in.
 *
 * ## Example
 *
 * {@example testing/ts/matchers.ts region='toHaveText'}
 */
export declare var expect: (actual: any) => NgMatchers;
