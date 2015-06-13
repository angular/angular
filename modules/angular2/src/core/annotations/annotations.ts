/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */

export {
  Component as ComponentAnnotation,
  Directive as DirectiveAnnotation,
  ComponentArgs,
  DirectiveArgs,
  onDestroy,
  onChange,
  onCheck,
  onInit,
  onAllChangesDone
} from '../annotations_impl/annotations';
