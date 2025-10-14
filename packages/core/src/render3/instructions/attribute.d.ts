import { SanitizerFn } from '../interfaces/sanitization';
/**
 * Updates the value of or removes a bound attribute on an Element.
 *
 * Used in the case of `[attr.title]="value"`
 *
 * @param name name The name of the attribute.
 * @param value value The attribute is removed when value is `null` or `undefined`.
 *                  Otherwise the attribute value is set to the stringified value.
 * @param sanitizer An optional function used to sanitize the value.
 * @param namespace Optional namespace to use when setting the attribute.
 *
 * @codeGenApi
 */
export declare function ɵɵattribute(name: string, value: any, sanitizer?: SanitizerFn | null, namespace?: string): typeof ɵɵattribute;
