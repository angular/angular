import { Observable } from '../Observable';
/**
 * @param {Observable} observables the observables to get the latest values from.
 * @param {Function} [project] optional projection function for merging values together. Receives all values in order
 *  of observables passed. (e.g. `a.withLatestFrom(b, c, (a1, b1, c1) => a1 + b1 + c1)`). If this is not passed, arrays
 *  will be returned.
 * @description merges each value from an observable with the latest values from the other passed observables.
 * All observables must emit at least one value before the resulting observable will emit
 *
 * #### example
 * ```
 * A.withLatestFrom(B, C)
 *
 *  A:     ----a-----------------b---------------c-----------|
 *  B:     ---d----------------e--------------f---------|
 *  C:     --x----------------y-------------z-------------|
 * result: ---([a,d,x])---------([b,e,y])--------([c,f,z])---|
 * ```
 */
export declare function withLatestFrom<R>(...args: Array<Observable<any> | ((...values: Array<any>) => R)>): Observable<R>;
