/**
 * Update an ARIA attribute on a selected element.
 *
 * If the attribute name also exists as an input property on any of the element's directives, those
 * inputs will be set instead of the element attribute.
 *
 * @param name Name of the ARIA attribute (beginning with `aria-`).
 * @param value New value to write.
 * @returns This function returns itself so that it may be chained.
 *
 * @codeGenApi
 */
export declare function ɵɵariaProperty<T>(name: string, value: T): typeof ɵɵariaProperty;
