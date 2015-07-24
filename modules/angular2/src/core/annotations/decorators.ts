import {ComponentAnnotation, DirectiveAnnotation, LifecycleEvent} from './annotations';
import {ViewAnnotation} from './view';
import {AttributeAnnotation, QueryAnnotation, ViewQueryAnnotation} from './di';
import {
  makeDecorator,
  makeParamDecorator,
  TypeDecorator,
  ParameterDecorator,
  Class
} from '../../util/decorators';
import {Type} from 'angular2/src/facade/lang';
import {ViewEncapsulation} from 'angular2/src/render/api';

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
  View(obj: {
    templateUrl?: string,
    template?: string,
    directives?: List<Type | any | List<any>>,
    renderer?: string,
    styles?: List<string>,
    styleUrls?: List<string>,
  }): ViewDecorator;
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
  View(obj: {
    templateUrl?: string,
    template?: string,
    directives?: List<Type | any | List<any>>,
    renderer?: string,
    styles?: List<string>,
    styleUrls?: List<string>,
  }): ViewDecorator;
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
  (obj: {
    selector?: string, properties?: List<string>, events?: List<string>,
        host?: StringMap<string, string>, lifecycle?: List<LifecycleEvent>,
        hostInjector?: List<any>, exportAs?: string, compileChildren?: boolean;
  }): DirectiveDecorator;
  new (obj: {
    selector?: string, properties?: List<string>, events?: List<string>,
        host?: StringMap<string, string>, lifecycle?: List<LifecycleEvent>,
        hostInjector?: List<any>, exportAs?: string, compileChildren?: boolean;
  }): DirectiveAnnotation;
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
  (obj: {
    selector?: string,
    properties?: List<string>,
    events?: List<string>,
    host?: StringMap<string, string>,
    lifecycle?: List<LifecycleEvent>,
    hostInjector?: List<any>,
    exportAs?: string,
    compileChildren?: boolean,
    viewInjector?: List<any>,
    changeDetection?: string,
  }): ComponentDecorator;
  new (obj: {
    selector?: string,
    properties?: List<string>,
    events?: List<string>,
    host?: StringMap<string, string>,
    lifecycle?: List<LifecycleEvent>,
    hostInjector?: List<any>,
    exportAs?: string,
    compileChildren?: boolean,
    viewInjector?: List<any>,
    changeDetection?: string,
  }): ComponentAnnotation;
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
  }): ViewAnnotation;
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


/**
 * {@link ViewQuery} factory function.
 */
export var ViewQuery: QueryFactory = makeParamDecorator(ViewQueryAnnotation);
