import { Type } from 'angular2/src/facade/lang';
/**
 * An interface that a function passed into {@link forwardRef} has to implement.
 *
 * ### Example
 *
 * ```typescript
 * var fn:ForwardRefFn = forwardRef(() => Lock);
 * ```
 */
export interface ForwardRefFn {
    (): any;
}
/**
 * Allows to refer to references which are not yet defined.
 *
 * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
 * DI is declared,
 * but not yet defined. It is also used when the `token` which we use when creating a query is not
 * yet defined.
 *
 * ### Example ([live demo](http://plnkr.co/edit/bRs0SX2OTQiJzqvjgl8P?p=preview))
 *
 * ```typescript
 * class Door {
 *   lock: Lock;
 *   constructor(@Inject(forwardRef(() => Lock)) lock:Lock) {
 *     this.lock = lock;
 *   }
 * }
 *
 * // Only at this point Lock is defined.
 * class Lock {
 * }
 *
 * var injector = Injector.resolveAndCreate([Door, Lock]);
 * var door = injector.get(Door);
 * expect(door instanceof Door).toBe(true);
 * expect(door.lock instanceof Lock).toBe(true);
 * ```
 */
export declare function forwardRef(forwardRefFn: ForwardRefFn): Type;
/**
 * Lazily retrieves the reference value from a forwardRef.
 *
 * Acts as the identity function when given a non-forward-ref value.
 *
 * ### Example ([live demo](http://plnkr.co/edit/GU72mJrk1fiodChcmiDR?p=preview))
 *
 * ```typescript
 * var ref = forwardRef(() => "refValue");
 * expect(resolveForwardRef(ref)).toEqual("refValue");
 * expect(resolveForwardRef("regularValue")).toEqual("regularValue");
 * ```
 *
 * See: {@link forwardRef}
 */
export declare function resolveForwardRef(type: any): any;
