import {
  ComponentAnnotation,
  DirectiveAnnotation,
  ComponentArgs,
  DirectiveArgs
} from './annotations';
import {ViewAnnotation, ViewArgs} from './view';
import {AttributeAnnotation, QueryAnnotation} from './di';
import {
  makeDecorator,
  makeParamDecorator,
  TypeDecorator,
  ParameterDecorator,
  Class
} from '../../util/decorators';
import {Type} from 'angular2/src/facade/lang';

/**
 * Interface for the {@link Directive} decorator function.
 *
 * See {@link DirectiveFactory}.
 */
export interface DirectiveDecorator extends TypeDecorator {}

/**
 * Interface for the {@link Component} decorator function.
 *
 * See {@link ComponentFactory}.
 */
export interface ComponentDecorator extends TypeDecorator {
  /**
   * Chain {@link View} annotation.
   */
  View(obj: ViewArgs): ViewDecorator;
}

/**
 * Interface for the {@link View} decorator function.
 *
 * See {@link ViewFactory}.
 */
export interface ViewDecorator extends TypeDecorator {
  /**
   * Chain {@link View} annotation.
   */
  View(obj: ViewArgs): ViewDecorator
}

/**
 * {@link Directive} factory for creating annotations, decorators or DSL.
 *
 * ## Example as TypeScript Decorator
 *
 * ```
 * import {Directive} from "angular2/angular2";
 *
 * @Directive({...})
 * class MyDirective {
 *   constructor() {
 *     ...
 *   }
 * }
 * ```
 *
 * ## Example as ES5 DSL
 *
 * ```
 * var MyDirective = ng
 *   .Directive({...})
 *   .Class({
 *     constructor: function() {
 *       ...
 *     }
 *   })
 * ```
 *
 * ## Example as ES5 annotation
 *
 * ```
 * var MyDirective = function() {
 *   ...
 * };
 *
 * MyDirective.annotations = [
 *   new ng.Directive({...})
 * ]
 * ```
 */
export interface DirectiveFactory {
  (obj: DirectiveArgs): DirectiveDecorator;
  new (obj: DirectiveAnnotation): DirectiveAnnotation;
}

/**
 * {@link ComponentAnnotation} factory for creating annotations, decorators or DSL.
 *
 * ## Example as TypeScript Decorator
 *
 * ```
 * import {Component, View} from "angular2/angular2";
 *
 * @Component({...})
 * @View({...})
 * class MyComponent {
 *   constructor() {
 *     ...
 *   }
 * }
 * ```
 *
 * ## Example as ES5 DSL
 *
 * ```
 * var MyComponent = ng
 *   .Component({...})
 *   .View({...})
 *   .Class({
 *     constructor: function() {
 *       ...
 *     }
 *   })
 * ```
 *
 * ## Example as ES5 annotation
 *
 * ```
 * var MyComponent = function() {
 *   ...
 * };
 *
 * MyComponent.annotations = [
 *   new ng.Component({...})
 *   new ng.View({...})
 * ]
 * ```
 */
export interface ComponentFactory {
  (obj: ComponentArgs): ComponentDecorator;
  new (obj: ComponentAnnotation): ComponentAnnotation;
}

/**
 * {@link ViewAnnotation} factory for creating annotations, decorators or DSL.
 *
 * ## Example as TypeScript Decorator
 *
 * ```
 * import {Component, View} from "angular2/angular2";
 *
 * @Component({...})
 * @View({...})
 * class MyComponent {
 *   constructor() {
 *     ...
 *   }
 * }
 * ```
 *
 * ## Example as ES5 DSL
 *
 * ```
 * var MyComponent = ng
 *   .Component({...})
 *   .View({...})
 *   .Class({
 *     constructor: function() {
 *       ...
 *     }
 *   })
 * ```
 *
 * ## Example as ES5 annotation
 *
 * ```
 * var MyComponent = function() {
 *   ...
 * };
 *
 * MyComponent.annotations = [
 *   new ng.Component({...})
 *   new ng.View({...})
 * ]
 * ```
 */
export interface ViewFactory {
  (obj: ViewArgs): ViewDecorator;
  new (obj: ViewArgs): ViewAnnotation;
}

/**
 * {@link Attribute} factory for creating annotations, decorators or DSL.
 *
 * ## Example as TypeScript Decorator
 *
 * ```
 * import {Attribute, Component, View} from "angular2/angular2";
 *
 * @Component({...})
 * @View({...})
 * class MyComponent {
 *   constructor(@Attribute('title') title: string) {
 *     ...
 *   }
 * }
 * ```
 *
 * ## Example as ES5 DSL
 *
 * ```
 * var MyComponent = ng
 *   .Component({...})
 *   .View({...})
 *   .Class({
 *     constructor: [new ng.Attribute('title'), function(title) {
 *       ...
 *     }]
 *   })
 * ```
 *
 * ## Example as ES5 annotation
 *
 * ```
 * var MyComponent = function(title) {
 *   ...
 * };
 *
 * MyComponent.annotations = [
 *   new ng.Component({...})
 *   new ng.View({...})
 * ]
 * MyComponent.parameters = [
 *   [new ng.Attribute('title')]
 * ]
 * ```
 */
export interface AttributeFactory {
  (name: string): TypeDecorator;
  new (name: string): AttributeAnnotation;
}

/**
 * {@link Query} factory for creating annotations, decorators or DSL.
 *
 * ## Example as TypeScript Decorator
 *
 * ```
 * import {Query, QueryList, Component, View} from "angular2/angular2";
 *
 * @Component({...})
 * @View({...})
 * class MyComponent {
 *   constructor(@Query(SomeType) queryList: QueryList) {
 *     ...
 *   }
 * }
 * ```
 *
 * ## Example as ES5 DSL
 *
 * ```
 * var MyComponent = ng
 *   .Component({...})
 *   .View({...})
 *   .Class({
 *     constructor: [new ng.Query(SomeType), function(queryList) {
 *       ...
 *     }]
 *   })
 * ```
 *
 * ## Example as ES5 annotation
 *
 * ```
 * var MyComponent = function(queryList) {
 *   ...
 * };
 *
 * MyComponent.annotations = [
 *   new ng.Component({...})
 *   new ng.View({...})
 * ]
 * MyComponent.parameters = [
 *   [new ng.Query(SomeType)]
 * ]
 * ```
 */
export interface QueryFactory {
  (selector: Type | string, {descendants}?: {descendants?: boolean}): ParameterDecorator;
  new (selector: Type | string, {descendants}?: {descendants?: boolean}): QueryAnnotation;
}


/**
 * {@link Component} factory function.
 */
export var Component: ComponentFactory =
    <ComponentFactory>makeDecorator(ComponentAnnotation, (fn: any) => fn.View = View);
/**
 * {@link Directive} factory function.
 */
export var Directive: DirectiveFactory = <DirectiveFactory>makeDecorator(DirectiveAnnotation);

/**
 * {@link View} factory function.
 */
export var View: ViewFactory =
    <ViewFactory>makeDecorator(ViewAnnotation, (fn: any) => fn.View = View);

/**
 * {@link Attribute} factory function.
 */
export var Attribute: AttributeFactory = makeParamDecorator(AttributeAnnotation);

/**
 * {@link Query} factory function.
 */
export var Query: QueryFactory = makeParamDecorator(QueryAnnotation);
