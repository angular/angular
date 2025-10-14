/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '../interface/type';
/**
 * An interface that a function passed into `forwardRef` has to implement.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='forward_ref_fn'}
 * @publicApi
 */
export interface ForwardRefFn {
    (): any;
}
/**
 * Allows to refer to references which are not yet defined.
 *
 * For instance, `forwardRef` is used when the `token` which we need to refer to for the purposes of
 * DI is declared, but not yet defined. It is also used when the `token` which we use when creating
 * a query is not yet defined.
 *
 * `forwardRef` is also used to break circularities in standalone components imports.
 *
 * @usageNotes
 * ### Circular dependency example
 * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='forward_ref'}
 *
 * ### Circular standalone reference import example
 * ```angular-ts
 * @Component({
 *   imports: [ChildComponent],
 *   selector: 'app-parent',
 *   template: `<app-child [hideParent]="hideParent()"></app-child>`,
 * })
 * export class ParentComponent {
 *    hideParent = input.required<boolean>();
 * }
 *
 *
 * @Component({
 *   imports: [forwardRef(() => ParentComponent)],
 *   selector: 'app-child',
 *   template: `
 *    @if(!hideParent() {
 *       <app-parent/>
 *    }
 *  `,
 * })
 * export class ChildComponent {
 *    hideParent = input.required<boolean>();
 * }
 * ```
 *
 * @publicApi
 */
export declare function forwardRef(forwardRefFn: ForwardRefFn): Type<any>;
/**
 * Lazily retrieves the reference value from a forwardRef.
 *
 * Acts as the identity function when given a non-forward-ref value.
 *
 * @usageNotes
 * ### Example
 *
 * {@example core/di/ts/forward_ref/forward_ref_spec.ts region='resolve_forward_ref'}
 *
 * @see {@link forwardRef}
 * @publicApi
 */
export declare function resolveForwardRef<T>(type: T): T;
/** Checks whether a function is wrapped by a `forwardRef`. */
export declare function isForwardRef(fn: any): fn is () => any;
