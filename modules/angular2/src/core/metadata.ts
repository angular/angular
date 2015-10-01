/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */

export {
  QueryMetadata,
  ContentChildrenMetadata,
  ContentChildMetadata,
  ViewChildrenMetadata,
  ViewQueryMetadata,
  ViewChildMetadata,
  AttributeMetadata
} from './metadata/di';

export {
  ComponentMetadata,
  DirectiveMetadata,
  PipeMetadata,
  InputMetadata,
  OutputMetadata,
  HostBindingMetadata,
  HostListenerMetadata
} from './metadata/directives';

export {ViewMetadata, ViewEncapsulation} from './metadata/view';

import {
  QueryMetadata,
  ContentChildrenMetadata,
  ContentChildMetadata,
  ViewChildrenMetadata,
  ViewChildMetadata,
  ViewQueryMetadata,
  AttributeMetadata
} from './metadata/di';

import {
  ComponentMetadata,
  DirectiveMetadata,
  PipeMetadata,
  InputMetadata,
  OutputMetadata,
  HostBindingMetadata,
  HostListenerMetadata
} from './metadata/directives';

import {ViewMetadata, ViewEncapsulation} from './metadata/view';
import {ChangeDetectionStrategy} from 'angular2/src/core/change_detection/change_detection';

import {
  makeDecorator,
  makeParamDecorator,
  makePropDecorator,
  TypeDecorator,
  Class
} from './util/decorators';
import {Type} from 'angular2/src/core/facade/lang';

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
  View(obj: {
    templateUrl?: string,
    template?: string,
    directives?: Array<Type | any[]>,
    pipes?: Array<Type | any[]>,
    renderer?: string,
    styles?: string[],
    styleUrls?: string[],
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
  View(obj: {
    templateUrl?: string,
    template?: string,
    directives?: Array<Type | any[]>,
    pipes?: Array<Type | any[]>,
    renderer?: string,
    styles?: string[],
    styleUrls?: string[],
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
    selector?: string,
    inputs?: string[],
    outputs?: string[],
    host?: StringMap<string, string>,
    bindings?: any[],
    exportAs?: string,
    moduleId?: string,
    compileChildren?: boolean,
    queries?: StringMap<string, any>
  }): DirectiveDecorator;
  new (obj: {
    selector?: string,
    inputs?: string[],
    outputs?: string[],
    host?: StringMap<string, string>,
    bindings?: any[],
    exportAs?: string,
    moduleId?: string,
    compileChildren?: boolean,
    queries?: StringMap<string, any>
  }): DirectiveMetadata;
}

/**
 * {@link ComponentMetadata} factory for creating annotations, decorators or DSL.
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
 *   new ng.Component({...}),
 *   new ng.View({...})
 * ]
 * ```
 */
export interface ComponentFactory {
  (obj: {
    selector?: string,
    inputs?: string[],
    outputs?: string[],
    host?: StringMap<string, string>,
    bindings?: any[],
    exportAs?: string,
    moduleId?: string,
    compileChildren?: boolean,
    queries?: StringMap<string, any>,
    viewBindings?: any[],
    changeDetection?: ChangeDetectionStrategy,
  }): ComponentDecorator;
  new (obj: {
    selector?: string,
    inputs?: string[],
    outputs?: string[],
    host?: StringMap<string, string>,
    bindings?: any[],
    exportAs?: string,
    moduleId?: string,
    compileChildren?: boolean,
    queries?: StringMap<string, any>,
    viewBindings?: any[],
    changeDetection?: ChangeDetectionStrategy,
  }): ComponentMetadata;
}

/**
 * {@link ViewMetadata} factory for creating annotations, decorators or DSL.
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
 *   new ng.Component({...}),
 *   new ng.View({...})
 * ]
 * ```
 */
export interface ViewFactory {
  (obj: {
    templateUrl?: string,
    template?: string,
    directives?: Array<Type | any[]>,
    pipes?: Array<Type | any[]>,
    encapsulation?: ViewEncapsulation,
    styles?: string[],
    styleUrls?: string[],
  }): ViewDecorator;
  new (obj: {
    templateUrl?: string,
    template?: string,
    directives?: Array<Type | any[]>,
    pipes?: Array<Type | any[]>,
    encapsulation?: ViewEncapsulation,
    styles?: string[],
    styleUrls?: string[],
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
 *   new ng.Component({...}),
 *   new ng.View({...})
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
 * ### Example as TypeScript Decorator
 *
 * ```
 * import {Query, QueryList, Component, View} from "angular2/angular2";
 *
 * @Component({...})
 * @View({...})
 * class MyComponent {
 *   constructor(@Query(SomeType) queryList: QueryList<SomeType>) {
 *     ...
 *   }
 * }
 * ```
 *
 * ### Example as ES5 DSL
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
 * ### Example as ES5 annotation
 *
 * ```
 * var MyComponent = function(queryList) {
 *   ...
 * };
 *
 * MyComponent.annotations = [
 *   new ng.Component({...}),
 *   new ng.View({...})
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

export interface ContentChildrenFactory {
  (selector: Type | string, {descendants}?: {descendants?: boolean}): any;
  new (selector: Type | string, {descendants}?: {descendants?: boolean}): ContentChildrenMetadata;
}

export interface ContentChildFactory {
  (selector: Type | string): any;
  new (selector: Type | string): ContentChildFactory;
}

export interface ViewChildrenFactory {
  (selector: Type | string): any;
  new (selector: Type | string): ViewChildrenMetadata;
}

export interface ViewChildFactory {
  (selector: Type | string): any;
  new (selector: Type | string): ViewChildFactory;
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
  (obj: {name: string, pure?: boolean}): any;
  new (obj: {name: string, pure?: boolean}): any;
}

/**
 * {@link InputMetadata} factory for creating decorators.
 *
 * See {@link InputMetadata}.
 */
export interface InputFactory {
  (bindingPropertyName?: string): any;
  new (bindingPropertyName?: string): any;
}

/**
 * {@link OutputMetadata} factory for creating decorators.
 *
 * See {@link OutputMetadata}.
 */
export interface OutputFactory {
  (bindingPropertyName?: string): any;
  new (bindingPropertyName?: string): any;
}

/**
 * {@link HostBindingMetadata} factory for creating decorators.
 *
 * ## Example as TypeScript Decorator
 *
 * ```
 * @Directive({
 *   selector: 'sample-dir'
 * })
 * class SampleDir {
 *   @HostBinding() prop1; // Same as @HostBinding('prop1') prop1;
 *   @HostBinding("el-prop") prop1;
 * }
 * ```
 */
export interface HostBindingFactory {
  (hostPropertyName?: string): any;
  new (hostPropertyName?: string): any;
}

/**
 * {@link HostListenerMetadata} factory for creating decorators.
 *
 * ## Example as TypeScript Decorator
 *
 * ```
 * @Directive({
 *   selector: 'sample-dir'
 * })
 * class SampleDir {
 *   @HostListener("change", ['$event.target.value']) onChange(value){}
 * }
 * ```
 */
export interface HostListenerFactory {
  (eventName: string, args?: string[]): any;
  new (eventName: string, args?: string[]): any;
}

/**
 * {@link ComponentMetadata} factory function.
 */
export var Component: ComponentFactory =
    <ComponentFactory>makeDecorator(ComponentMetadata, (fn: any) => fn.View = View);
/**
 * {@link DirectiveMetadata} factory function.
 */
export var Directive: DirectiveFactory = <DirectiveFactory>makeDecorator(DirectiveMetadata);

/**
 * {@link ViewMetadata} factory function.
 */
export var View: ViewFactory =
    <ViewFactory>makeDecorator(ViewMetadata, (fn: any) => fn.View = View);

/**
 * {@link AttributeMetadata} factory function.
 */
export var Attribute: AttributeFactory = makeParamDecorator(AttributeMetadata);

/**
 * {@link QueryMetadata} factory function.
 */
export var Query: QueryFactory = makeParamDecorator(QueryMetadata);

/**
 * {@link ContentChildrenMetadata} factory function.
 */
export var ContentChildren: ContentChildrenFactory = makePropDecorator(ContentChildrenMetadata);

/**
 * {@link ContentChildMetadata} factory function.
 */
export var ContentChild: ContentChildFactory = makePropDecorator(ContentChildMetadata);

/**
 * {@link ViewChildrenMetadata} factory function.
 */
export var ViewChildren: ViewChildrenFactory = makePropDecorator(ViewChildrenMetadata);

/**
 * {@link ViewChildMetadata} factory function.
 */
export var ViewChild: ViewChildFactory = makePropDecorator(ViewChildMetadata);

/**
 * {@link di/ViewQueryMetadata} factory function.
 */
export var ViewQuery: QueryFactory = makeParamDecorator(ViewQueryMetadata);

/**
 * {@link PipeMetadata} factory function.
 */
export var Pipe: PipeFactory = <PipeFactory>makeDecorator(PipeMetadata);

/**
 * {@link InputMetadata} factory function.
 *
 * See {@link InputMetadata}.
 */
export var Input: InputFactory = makePropDecorator(InputMetadata);

/**
 * {@link OutputMetadata} factory function.
 *
 * See {@link OutputMetadatas}.
 */
export var Output: OutputFactory = makePropDecorator(OutputMetadata);

/**
 * {@link HostBindingMetadata} factory function.
 */
export var HostBinding: HostBindingFactory = makePropDecorator(HostBindingMetadata);

/**
 * {@link HostListenerMetadata} factory function.
 */
export var HostListener: HostListenerFactory = makePropDecorator(HostListenerMetadata);
