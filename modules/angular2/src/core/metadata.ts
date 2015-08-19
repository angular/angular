/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */

export {
  QueryMetadata,
  ViewQueryMetadata,
  AttributeMetadata,
} from './metadata/di';

export {
  ComponentMetadata,
  DirectiveMetadata,
  PipeMetadata,
  LifecycleEvent
} from './metadata/directives';

export {ViewMetadata, ViewEncapsulation} from './metadata/view';


import {
  QueryMetadata,
  ViewQueryMetadata,
  AttributeMetadata,
} from './metadata/di';

import {
  ComponentMetadata,
  DirectiveMetadata,
  PipeMetadata,
  LifecycleEvent
} from './metadata/directives';

import {ViewMetadata, ViewEncapsulation} from './metadata/view';

import {makeDecorator, makeParamDecorator, TypeDecorator, Class} from '../util/decorators';
import {Type} from 'angular2/src/facade/lang';

/**
 * Interface for the {@link DirectiveMetadata} decorator function.
 *
 * See {@link DirectiveFactory}.
 */
export interface DirectiveDecorator extends TypeDecorator {}

/**
 * Interface for the {@link ComponentMetadata} decorator function.
 *
 * See {@link ComponentFactory}.
 */
export interface ComponentDecorator extends TypeDecorator {
  /**
   * Chain {@link ViewMetadata} annotation.
   */
  BaseView(obj: {
    templateUrl?: string,
    template?: string,
    directives?: List<Type | any | List<any>>,
    pipes?: List<Type | any | List<any>>,
    renderer?: string,
    styles?: List<string>,
    styleUrls?: List<string>,
  }): ViewDecorator;
}

/**
 * Interface for the {@link ViewMetadata} decorator function.
 *
 * See {@link ViewFactory}.
 */
export interface ViewDecorator extends TypeDecorator {
  /**
   * Chain {@link ViewMetadata} annotation.
   */
  BaseView(obj: {
    templateUrl?: string,
    template?: string,
    directives?: List<Type | any | List<any>>,
    pipes?: List<Type | any | List<any>>,
    renderer?: string,
    styles?: List<string>,
    styleUrls?: List<string>,
  }): ViewDecorator;
}

/**
 * {@link DirectiveMetadata} factory for creating annotations, decorators or DSL.
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
  (obj: {
    selector?: string, properties?: List<string>, events?: List<string>,
        host?: StringMap<string, string>, lifecycle?: List<LifecycleEvent>, bindings?: List<any>,
        exportAs?: string, compileChildren?: boolean;
  }): DirectiveDecorator;
  new (obj: {
    selector?: string, properties?: List<string>, events?: List<string>,
        host?: StringMap<string, string>, lifecycle?: List<LifecycleEvent>, bindings?: List<any>,
        exportAs?: string, compileChildren?: boolean;
  }): DirectiveMetadata;
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
 *   .BaseView({...})
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
 *   new ng.BaseView({...})
 * ]
 * ```
 */
export interface ComponentFactory {
  (obj: {
    selector?: string,
    properties?: List<string>,
    events?: List<string>,
    host?: StringMap<string, string>,
    lifecycle?: List<LifecycleEvent>,
    bindings?: List<any>,
    exportAs?: string,
    compileChildren?: boolean,
    viewBindings?: List<any>,
    changeDetection?: string,
  }): ComponentDecorator;
  new (obj: {
    selector?: string,
    properties?: List<string>,
    events?: List<string>,
    host?: StringMap<string, string>,
    lifecycle?: List<LifecycleEvent>,
    bindings?: List<any>,
    exportAs?: string,
    compileChildren?: boolean,
    viewBindings?: List<any>,
    changeDetection?: string,
  }): ComponentMetadata;
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
 *   .BaseView({...})
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
 *   new ng.BaseView({...})
 * ]
 * ```
 */
export interface ViewFactory {
  (obj: {
    templateUrl?: string,
    template?: string,
    directives?: List<Type | any | List<any>>,
    encapsulation?: ViewEncapsulation,
    styles?: List<string>,
    styleUrls?: List<string>,
  }): ViewDecorator;
  new (obj: {
    templateUrl?: string,
    template?: string,
    directives?: List<Type | any | List<any>>,
    encapsulation?: ViewEncapsulation,
    styles?: List<string>,
    styleUrls?: List<string>,
  }): ViewMetadata;
}

/**
 * {@link AttributeMetadata} factory for creating annotations, decorators or DSL.
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
 *   .BaseView({...})
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
 *   new ng.BaseView({...})
 * ]
 * MyComponent.parameters = [
 *   [new ng.Attribute('title')]
 * ]
 * ```
 */
export interface AttributeFactory {
  (name: string): TypeDecorator;
  new (name: string): AttributeMetadata;
}

/**
 * {@link QueryMetadata} factory for creating annotations, decorators or DSL.
 *
 * ## Example as TypeScript Decorator
 *
 * ```
 * import {Query, QueryList, Component, View} from "angular2/angular2";
 *
 * @Component({...})
 * @BaseView({...})
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
 *   .BaseView({...})
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
 *   new ng.BaseView({...})
 * ]
 * MyComponent.parameters = [
 *   [new ng.Query(SomeType)]
 * ]
 * ```
 */
export interface QueryFactory {
  (selector: Type | string, {descendants}?: {descendants?: boolean}): ParameterDecorator;
  new (selector: Type | string, {descendants}?: {descendants?: boolean}): QueryMetadata;
}

/**
 * {@link PipeMetadata} factory for creating decorators.
 *
 * ## Example as TypeScript Decorator
 *
 * ```
 * import {Pipe} from "angular2/angular2";
 *
 * @Pipe({...})
 * class MyPipe {
 *   constructor() {
 *     ...
 *   }
 *
 *   transform(v, args) {}
 * }
 * ```
 */
export interface PipeFactory {
  (obj: {name: string}): any;
  new (obj: {
    name: string,
  }): any;
}

/**
 * {@link ComponentMetadata} factory function.
 */
export var Component: ComponentFactory =
    <ComponentFactory>makeDecorator(ComponentMetadata, (fn: any) => fn.BaseView = BaseView);
/**
 * {@link DirectiveMetadata} factory function.
 */
export var Directive: DirectiveFactory = <DirectiveFactory>makeDecorator(DirectiveMetadata);

/**
 * {@link ViewMetadata} factory function.
 */
export var BaseView: ViewFactory =
    <ViewFactory>makeDecorator(ViewMetadata, (fn: any) => fn.BaseView = BaseView);

/**
 * {@link AttributeMetadata} factory function.
 */
export var Attribute: AttributeFactory = makeParamDecorator(AttributeMetadata);

/**
 * {@link QueryMetadata} factory function.
 */
export var Query: QueryFactory = makeParamDecorator(QueryMetadata);


/**
 * {@link ViewQueryMetadata} factory function.
 */
export var ViewQuery: QueryFactory = makeParamDecorator(ViewQueryMetadata);

/**
 * {@link PipeMetadata} factory function.
 */
export var Pipe: PipeFactory = <PipeFactory>makeDecorator(PipeMetadata);
