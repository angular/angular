import {StringMap} from 'angular2/src/facade/collection';
import {global} from 'angular2/src/facade/lang';

// This is here only so that after TS transpilation the file is not empty.
// TODO(rado): find a better way to fix this, or remove if likely culprit
// https://github.com/systemjs/systemjs/issues/487 gets closed.
var __ignore_me = global;
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
 * Defines lifecycle method [onCheck] called when a directive is being checked.
 */
export interface OnCheck { onCheck(): void; }

/**
 * Defines lifecycle method [onInit] called when a directive is being checked the first time.
 */
export interface OnInit { onInit(): void; }

/**
 * Defines lifecycle method [onAllChangesDone ] called when the bindings of all its children have
 * been changed.
 */
export interface OnAllChangesDone { onAllChangesDone(): void; }
