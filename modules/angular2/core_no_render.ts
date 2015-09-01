/**
 * @module
 * @description
 * Define angular core API here.
 */
// DI
export {
  InjectMetadata,
  OptionalMetadata,
  InjectableMetadata,
  SelfMetadata,
  HostMetadata,
  SkipSelfMetadata,
  DependencyMetadata
} from './src/core/di/metadata';

// we have to reexport * because Dart and TS export two different sets of types
export * from './src/core/di/decorators';

export {forwardRef, resolveForwardRef, ForwardRefFn} from './src/core/di/forward_ref';
export {
  Injector,
  ProtoInjector,
  BindingWithVisibility,
  DependencyProvider,
  Visibility,
  UNDEFINED
} from './src/core/di/injector';
export {Binding, BindingBuilder, ResolvedBinding, Dependency, bind} from './src/core/di/binding';
export {Key, KeyRegistry, TypeLiteral} from './src/core/di/key';
export {
  NoBindingError,
  AbstractBindingError,
  CyclicDependencyError,
  InstantiationError,
  InvalidBindingError,
  NoAnnotationError,
  OutOfBoundsError
} from './src/core/di/exceptions';
export {OpaqueToken} from './src/core/di/opaque_token';

// Pipes
export {AsyncPipe} from 'angular2/src/core/pipes/async_pipe';
export {DatePipe} from 'angular2/src/core/pipes/date_pipe';
export {DEFAULT_PIPES, DEFAULT_PIPES_TOKEN} from 'angular2/src/core/pipes/default_pipes';
export {JsonPipe} from 'angular2/src/core/pipes/json_pipe';
export {LimitToPipe} from 'angular2/src/core/pipes/limit_to_pipe';
export {LowerCasePipe} from 'angular2/src/core/pipes/lowercase_pipe';
export {
  NumberPipe,
  DecimalPipe,
  PercentPipe,
  CurrencyPipe
} from 'angular2/src/core/pipes/number_pipe';
export {UpperCasePipe} from 'angular2/src/core/pipes/uppercase_pipe';


export {APP_COMPONENT} from 'angular2/src/core/application_tokens';
export {Type} from 'angular2/src/core/facade/lang';
export {ApplicationRef} from 'angular2/src/core/application_ref';

// Compiler Related Dependencies.
export {AppRootUrl} from 'angular2/src/core/services/app_root_url';
export {UrlResolver} from 'angular2/src/core/services/url_resolver';
export {ComponentUrlMapper} from 'angular2/src/core/compiler/component_url_mapper';
export {DirectiveResolver} from 'angular2/src/core/compiler/directive_resolver';
export {Compiler} from 'angular2/src/core/compiler/compiler';

export {AppViewManager} from 'angular2/src/core/compiler/view_manager';
export {QueryList} from 'angular2/src/core/compiler/query_list';
export {DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
export {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';

export {ElementRef} from 'angular2/src/core/compiler/element_ref';
export {TemplateRef} from 'angular2/src/core/compiler/template_ref';
export {ViewRef, HostViewRef, ProtoViewRef} from 'angular2/src/core/compiler/view_ref';
export {ViewContainerRef} from 'angular2/src/core/compiler/view_container_ref';
export {ComponentRef} from 'angular2/src/core/compiler/dynamic_component_loader';

export {NgZone} from 'angular2/src/core/zone/ng_zone';
export {Observable, EventEmitter} from 'angular2/src/core/facade/async';

// Directives
export * from './src/core/directives/ng_class';
export * from './src/core/directives/ng_for';
export * from './src/core/directives/ng_if';
export * from './src/core/directives/ng_non_bindable';
export * from './src/core/directives/ng_style';
export * from './src/core/directives/ng_switch';
