/**
 * @module
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
  DirectiveAnnotation,
  LifecycleEvent
} from './src/core/annotations/annotations';

export {ViewAnnotation} from 'angular2/src/core/annotations/view';
export {QueryAnnotation, AttributeAnnotation} from 'angular2/src/core/annotations/di';

export {
  OnAllChangesDone,
  OnChange,
  OnDestroy,
  OnInit,
  OnCheck
} from 'angular2/src/core/compiler/interfaces';


export {
  Class,
  ClassDefinition,
  ParameterDecorator,
  TypeDecorator
} from 'angular2/src/util/decorators';

export {
  Attribute,
  AttributeFactory,
  Component,
  ComponentDecorator,
  ComponentFactory,
  Directive,
  DirectiveDecorator,
  DirectiveFactory,
  View,
  ViewDecorator,
  ViewFactory,
  Query,
  QueryFactory,
  ViewQuery
} from 'angular2/src/core/annotations/decorators';
