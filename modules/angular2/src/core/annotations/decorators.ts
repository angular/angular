import {
  ComponentAnnotation,
  DirectiveAnnotation,
  PipeAnnotation,
  LifecycleEvent
} from './annotations';
import {BaseViewAnnotation} from './base_view';
import {AttributeAnnotation, QueryAnnotation, ViewQueryAnnotation} from './di';
import {makeDecorator, makeParamDecorator, TypeDecorator, Class} from '../../util/decorators';
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
   * Chain {@link BaseView} annotation.
   */
  BaseView(obj: {
    templateUrl?: string,
    template?: string,
    directives?: List<Type | any | List<any>>,
    pipes?: List<Type | any | List<any>>,
    renderer?: string,
    styles?: List<string>,
    styleUrls?: List<string>,
  }): BaseViewDecorator;
}

/**
 * Interface for the {@link BaseView} decorator function.
 *
 * See {@link BaseViewFactory}.
 */
export interface BaseViewDecorator extends TypeDecorator {
  /**
   * Chain {@link BaseView} annotation.
   */
  BaseView(obj: {
    templateUrl?: string,
    template?: string,
    directives?: List<Type | any | List<any>>,
    pipes?: List<Type | any | List<any>>,
    renderer?: string,
    styles?: List<string>,
    styleUrls?: List<string>,
  }): BaseViewDecorator;
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
        host?: StringMap<string, string>, lifecycle?: List<LifecycleEvent>, bindings?: List<any>,
        exportAs?: string, compileChildren?: boolean;
  }): DirectiveDecorator;
  new (obj: {
    selector?: string, properties?: List<string>, events?: List<string>,
        host?: StringMap<string, string>, lifecycle?: List<LifecycleEvent>, bindings?: List<any>,
        exportAs?: string, compileChildren?: boolean;
  }): DirectiveAnnotation;
}

/**
 * {@link ComponentAnnotation} factory for creating annotations, decorators or DSL.
 *
 * ## Example as TypeScript Decorator
 *
 * ```
 * import {Component, BaseView} from "angular2/angular2";
 *
 * @Component({...})
 * @BaseView({...})
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
  }): ComponentAnnotation;
}

/**
 * {@link BaseViewAnnotation} factory for creating annotations, decorators or DSL.
 *
 * ## Example as TypeScript Decorator
 *
 * ```
 * import {Component, BaseView} from "angular2/angular2";
 *
 * @Component({...})
 * @BaseView({...})
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
export interface BaseViewFactory {
  (obj: {
    templateUrl?: string,
    template?: string,
    directives?: List<Type | any | List<any>>,
    encapsulation?: ViewEncapsulation,
    styles?: List<string>,
    styleUrls?: List<string>,
  }): BaseViewDecorator;
  new (obj: {
    templateUrl?: string,
    template?: string,
    directives?: List<Type | any | List<any>>,
    encapsulation?: ViewEncapsulation,
    styles?: List<string>,
    styleUrls?: List<string>,
  }): BaseViewAnnotation;
}

/**
 * {@link Attribute} factory for creating annotations, decorators or DSL.
 *
 * ## Example as TypeScript Decorator
 *
 * ```
 * import {Attribute, Component, BaseView} from "angular2/angular2";
 *
 * @Component({...})
 * @BaseView({...})
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
 * import {Query, QueryList, Component, BaseView} from "angular2/angular2";
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
  new (selector: Type | string, {descendants}?: {descendants?: boolean}): QueryAnnotation;
}

/**
 * {@link Pipe} factory for creating decorators.
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
 * {@link Component} factory function.
 */
export var Component: ComponentFactory =
    <ComponentFactory>makeDecorator(ComponentAnnotation, (fn: any) => fn.BaseView = BaseView);
/**
 * {@link Directive} factory function.
 */
export var Directive: DirectiveFactory = <DirectiveFactory>makeDecorator(DirectiveAnnotation);

/**
 * {@link BaseView} factory function.
 */
export var BaseView: BaseViewFactory =
    <BaseViewFactory>makeDecorator(BaseViewAnnotation, (fn: any) => fn.BaseView = BaseView);

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

/**
 * {@link Pipe} factory function.
 */
export var Pipe: PipeFactory = <PipeFactory>makeDecorator(PipeAnnotation);
