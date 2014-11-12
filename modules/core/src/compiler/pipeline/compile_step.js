import {CompileElement} from './compile_element';
import {CompileControl} from './compile_control';
import {AnnotatedType} from '../annotated_type';

/**
 * One part of the compile process.
 * Is guaranteed to be called in depth first order
 */
export class CompileStep {
  process(parent:CompileElement, current:CompileElement, control:CompileControl) {}
}
