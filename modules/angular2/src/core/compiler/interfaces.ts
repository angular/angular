import {StringMap} from 'angular2/src/facade/collection';

/**
 * Defines lifecycle method [onChange] called after all of component's bound
 * properties are updated.
 */
export interface OnChange { onChange(changes: StringMap<string, any>): void; }
