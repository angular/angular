import {CompileElement} from './compile_element';
import * as compileControlModule from './compile_control';

/**
 * One part of the compile process.
 * Is guaranteed to be called in depth first order
 */
export interface CompileStep {
  process(parent: CompileElement, current: CompileElement,
          control: compileControlModule.CompileControl): void;
}
