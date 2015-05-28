import {StringMap} from 'angular2/src/facade/collection';

/**
 * Defines lifecycle method [onChange] called after all of component's bound
 * properties are updated.
 */
export interface OnChange { onChange(changes: StringMap<string, any>): void; }

/**
 * Defines lifecycle method [onDestroy] called when a directive is being destroyed.
 */
export interface OnDestroy { onDestroy(): void; }

/**
 * Defines lifecycle method [onAllChangesDone ] called when the bindings of all its children have
 * been changed.
 */
export interface OnAllChangesDone { onAllChangesDone(): void; }
