/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */

export {
  Component as ComponentAnnotation,
  Directive as DirectiveAnnotation,
  Pipe as PipeAnnotation,
  LifecycleEvent
} from '../annotations_impl/annotations';
