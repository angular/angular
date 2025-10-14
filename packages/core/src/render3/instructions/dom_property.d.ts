import { SanitizerFn } from '../interfaces/sanitization';
import { NO_CHANGE } from '../tokens';
/**
 * Update a DOM property on an element.
 *
 * @param propName Name of property..
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 * @returns This function returns itself so that it may be chained
 *  (e.g. `domProperty('name', ctx.name)('title', ctx.title)`)
 *
 * @codeGenApi
 */
export declare function ɵɵdomProperty<T>(propName: string, value: T, sanitizer?: SanitizerFn | null): typeof ɵɵdomProperty;
/**
 * Updates a synthetic host binding (e.g. `[@foo]`) on a component or directive.
 *
 * This instruction is for compatibility purposes and is designed to ensure that a
 * synthetic host binding (e.g. `@HostBinding('@foo')`) properly gets rendered in
 * the component's renderer. Normally all host bindings are evaluated with the parent
 * component's renderer, but, in the case of animation @triggers, they need to be
 * evaluated with the sub component's renderer (because that's where the animation
 * triggers are defined).
 *
 * Do not use this instruction as a replacement for `elementProperty`. This instruction
 * only exists to ensure compatibility with the ViewEngine's host binding behavior.
 *
 * @param index The index of the element to update in the data array
 * @param propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 *
 * @codeGenApi
 */
export declare function ɵɵsyntheticHostProperty<T>(propName: string, value: T | NO_CHANGE, sanitizer?: SanitizerFn | null): typeof ɵɵsyntheticHostProperty;
