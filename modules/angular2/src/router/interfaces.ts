import {ComponentInstruction} from './instruction';
import {global} from 'angular2/src/facade/lang';

// This is here only so that after TS transpilation the file is not empty.
// TODO(rado): find a better way to fix this, or remove if likely culprit
// https://github.com/systemjs/systemjs/issues/487 gets closed.
var __ignore_me = global;


/**
 * Defines route lifecycle method [onActivate]
 */
export interface OnActivate {
  onActivate(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}

/**
 * Defines route lifecycle method [onReuse]
 */
export interface OnReuse {
  onReuse(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}

/**
 * Defines route lifecycle method [onDeactivate]
 */
export interface OnDeactivate {
  onDeactivate(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}

/**
 * Defines route lifecycle method [canReuse]
 */
export interface CanReuse {
  canReuse(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}

/**
 * Defines route lifecycle method [canDeactivate]
 */
export interface CanDeactivate {
  canDeactivate(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}
