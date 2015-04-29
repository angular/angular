/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */

export {
  Component as ComponentAnnotation,
  Decorator as DecoratorAnnotation,
  Directive as DirectiveAnnotation,
  DynamicComponent as DynamicComponentAnnotation,
  Viewport as ViewportAnnotation,
  onDestroy, onChange, onAllChangesDone
} from '../annotations_impl/annotations';
