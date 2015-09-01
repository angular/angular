/**
 * @module
 * @description
 *
 * Annotations provide the additional information that Angular requires in order to run your
 * application. This module
 * contains {@link ComponentMetadata}, {@link DirectiveMetadata}, and {@link ViewMetadata}
 * annotations, as well as
 * the {@link Host} annotation that is used by Angular to resolve dependencies.
 *
 */

export {
  ComponentMetadata,
  DirectiveMetadata,
  PipeMetadata,
  ViewMetadata,
  ViewEncapsulation,
  QueryMetadata,
  AttributeMetadata,
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
  ViewQuery,
  Pipe,
  PipeFactory,
  Property,
  PropertyFactory,
  PropertyMetadata,
  Event,
  EventFactory,
  EventMetadata,
  HostBinding,
  HostBindingFactory,
  HostBindingMetadata,
  HostListener,
  HostListenerFactory,
  HostListenerMetadata
} from './src/core/metadata';

export {
  // todo(vbe): LifecycleHook should not be exposed (fails test.typings)
  LifecycleHook,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked,
  OnChanges,
  OnDestroy,
  OnInit,
  DoCheck
} from './src/core/compiler/interfaces';

export {Class, ClassDefinition, TypeDecorator} from './src/core/util/decorators';
