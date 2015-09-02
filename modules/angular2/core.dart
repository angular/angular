library angular2.core;

// DI
export 'package:angular2/src/core/di/decorators.dart';
export 'package:angular2/src/core/di/metadata.dart' show InjectMetadata, OptionalMetadata, InjectableMetadata, SelfMetadata, HostMetadata, SkipSelfMetadata, DependencyMetadata;
export 'package:angular2/src/core/di/forward_ref.dart' show forwardRef, resolveForwardRef, ForwardRefFn;
export 'package:angular2/src/core/di/injector.dart' show Injector, ProtoInjector, BindingWithVisibility, DependencyProvider, Visibility, UNDEFINED;
export 'package:angular2/src/core/di/binding.dart' show Binding, BindingBuilder, ResolvedBinding, Dependency, bind;
export 'package:angular2/src/core/di/key.dart' show Key, KeyRegistry, TypeLiteral;
export 'package:angular2/src/core/di/exceptions.dart' show NoBindingError, AbstractBindingError, CyclicDependencyError, InstantiationError, InvalidBindingError, NoAnnotationError, OutOfBoundsError;
export 'package:angular2/src/core/di/opaque_token.dart' show OpaqueToken;

export 'package:angular2/src/core/application_tokens.dart' show APP_COMPONENT;
export 'package:angular2/src/core/application_ref.dart' show ApplicationRef;

// Compiler Related Dependencies.
export 'package:angular2/src/core/services/app_root_url.dart' show AppRootUrl;
export 'package:angular2/src/core/services/url_resolver.dart' show UrlResolver;
export 'package:angular2/src/core/compiler/component_url_mapper.dart'
    show ComponentUrlMapper;
export 'package:angular2/src/core/compiler/directive_resolver.dart'
    show DirectiveResolver;
export 'package:angular2/src/core/compiler/compiler.dart' show Compiler;

export 'package:angular2/src/core/compiler/view_manager.dart' show AppViewManager;
export 'package:angular2/src/core/compiler/query_list.dart' show QueryList;
export 'package:angular2/src/core/compiler/dynamic_component_loader.dart'
    show DynamicComponentLoader;
export 'package:angular2/src/core/life_cycle/life_cycle.dart' show LifeCycle;

export 'package:angular2/src/core/compiler/element_ref.dart' show ElementRef;
export 'package:angular2/src/core/compiler/template_ref.dart' show TemplateRef;
export 'package:angular2/src/core/compiler/view_ref.dart'
    show ViewRef, HostViewRef, ProtoViewRef;
export 'package:angular2/src/core/compiler/view_container_ref.dart'
    show ViewContainerRef;
export 'package:angular2/src/core/compiler/dynamic_component_loader.dart'
    show ComponentRef;

export 'package:angular2/src/core/zone/ng_zone.dart' show NgZone;
export 'package:angular2/src/core/facade/async.dart' show Stream, EventEmitter;

// Pipes
export 'package:angular2/src/core/pipes/async_pipe.dart' show AsyncPipe;
export 'package:angular2/src/core/pipes/date_pipe.dart' show DatePipe;
export 'package:angular2/src/core/pipes/default_pipes.dart' show DEFAULT_PIPES, DEFAULT_PIPES_TOKEN;
export 'package:angular2/src/core/pipes/json_pipe.dart' show JsonPipe;
export 'package:angular2/src/core/pipes/limit_to_pipe.dart' show LimitToPipe;
export 'package:angular2/src/core/pipes/lowercase_pipe.dart' show LowerCasePipe;
export 'package:angular2/src/core/pipes/number_pipe.dart' show NumberPipe, DecimalPipe, PercentPipe, CurrencyPipe;
export 'package:angular2/src/core/pipes/uppercase_pipe.dart' show UpperCasePipe;

// Render
export 'package:angular2/src/core/render/render.dart'
    show RenderDirectiveMetadata, DomRenderer, RenderEventDispatcher, Renderer,
    RenderElementRef, RenderViewRef, RenderProtoViewRef, RenderFragmentRef,
    RenderViewWithFragments, ViewDefinition, DOCUMENT, APP_ID, MAX_IN_MEMORY_ELEMENTS_PER_TEMPLATE;

// Directives
export 'package:angular2/src/core/directives/ng_class.dart';
export 'package:angular2/src/core/directives/ng_for.dart';
export 'package:angular2/src/core/directives/ng_if.dart';
export 'package:angular2/src/core/directives/ng_non_bindable.dart';
export 'package:angular2/src/core/directives/ng_style.dart';
export 'package:angular2/src/core/directives/ng_switch.dart';
//Dart-Only
export 'package:angular2/src/core/directives/observable_list_diff.dart';

// Forms
export 'package:angular2/src/core/forms/model.dart' show AbstractControl, Control, ControlGroup, ControlArray;
export 'package:angular2/src/core/forms/directives/abstract_control_directive.dart' show AbstractControlDirective;
export 'package:angular2/src/core/forms/directives/form_interface.dart' show Form;
export 'package:angular2/src/core/forms/directives/control_container.dart' show ControlContainer;
export 'package:angular2/src/core/forms/directives/ng_control_name.dart' show NgControlName;
export 'package:angular2/src/core/forms/directives/ng_form_control.dart' show NgFormControl;
export 'package:angular2/src/core/forms/directives/ng_model.dart' show NgModel;
export 'package:angular2/src/core/forms/directives/ng_control.dart' show NgControl;
export 'package:angular2/src/core/forms/directives/ng_control_group.dart' show NgControlGroup;
export 'package:angular2/src/core/forms/directives/ng_form_model.dart' show NgFormModel;
export 'package:angular2/src/core/forms/directives/ng_form.dart' show NgForm;
export 'package:angular2/src/core/forms/directives/control_value_accessor.dart' show ControlValueAccessor;
export 'package:angular2/src/core/forms/directives/default_value_accessor.dart' show DefaultValueAccessor;
export 'package:angular2/src/core/forms/directives/checkbox_value_accessor.dart' show CheckboxControlValueAccessor;
export 'package:angular2/src/core/forms/directives/select_control_value_accessor.dart'
    show NgSelectOption, SelectControlValueAccessor;
export 'package:angular2/src/core/forms/directives.dart' show FORM_DIRECTIVES;
export 'package:angular2/src/core/forms/validators.dart' show Validators;
export 'package:angular2/src/core/forms/directives/validators.dart' show NgValidator, NgRequiredValidator;
export 'package:angular2/src/core/forms/form_builder.dart' show FormBuilder;

import 'package:angular2/src/core/forms/form_builder.dart' show FormBuilder;
import 'package:angular2/src/core/facade/lang.dart' show CONST_EXPR, Type;

const List<dynamic> FORM_BINDINGS = const [FormBuilder];
