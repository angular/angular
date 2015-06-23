/**
 * @module
 * @public
 * @description
 *
 * Annotations provide the additional information that Angular requires in order to run your
 * application. This module
 * contains {@link Component}, {@link Directive}, and {@link View} annotations, as well as
 * {@link Parent} and {@link Ancestor} annotations that are
 * used by Angular to resolve dependencies.
 *
 */
export {
  ComponentAnnotation,
  ComponentArgs,
  DirectiveAnnotation,
  DirectiveArgs,
  onDestroy,
  onChange,
  onCheck,
  onInit,
  onAllChangesDone
} from './src/core/annotations/annotations';

export {
  Attribute,
  Component,
  ComponentTypeDecorator,
  Directive,
  DirectiveTypeDecorator,
  Query,
  View,
  ViewTypeDecorator
} from './src/core/annotations/decorators';
